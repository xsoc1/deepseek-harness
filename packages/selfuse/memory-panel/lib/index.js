import { basename, isAbsolute, join } from "node:path";
import z from "@deepseek-ai/schemastery";
import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, open, readdir, unlink } from "node:fs/promises";
//#region lib/types/storage.js
/** Local Markdown collections with bounded reads and exclusive note creation. */
const DIRS = {
	pages: "knowledge",
	notes: "notes"
};
const ID_RE = /^[A-Za-z0-9\u4e00-\u9fa5][A-Za-z0-9\u4e00-\u9fa5._-]{0,119}$/;
async function directory(path) {
	await mkdir(path, {
		recursive: true,
		mode: 448
	});
	const entry = await lstat(path);
	if (!entry.isDirectory() || entry.isSymbolicLink()) throw new Error("Memory store directories must not be links");
}
function titleOf(content, fallback) {
	const lines = content.split(/\r?\n/);
	for (const line of lines.slice(0, 8)) {
		const title = /^title:\s*(.*)$/.exec(line)?.[1]?.trim();
		if (title) return title;
		const heading = /^#\s+(.*)$/.exec(line)?.[1]?.trim();
		if (heading) return heading;
	}
	return lines.find((line) => line.trim())?.trim().slice(0, 60) || fallback;
}
/**
* Open a store without changing existing Markdown files or their permissions.
* @param root - Absolute Host directory containing knowledge and notes.
* @param maxFileBytes - Maximum complete file or newly composed note size.
* @param searchLimit - Maximum matches returned across both collections.
* @returns Operations bound to this directory; IO and validation failures reject.
*/
async function createMemoryStore(root, maxFileBytes, searchLimit) {
	if (!isAbsolute(root)) throw new Error("Memory store must be an absolute Host path");
	await directory(root);
	await directory(join(root, DIRS.pages));
	await directory(join(root, DIRS.notes));
	async function collection(kind, signal) {
		signal?.throwIfAborted();
		await directory(root);
		const path = join(root, DIRS[kind]);
		await directory(path);
		signal?.throwIfAborted();
		return path;
	}
	async function pathFor(kind, id, signal) {
		if (!ID_RE.test(id)) throw new Error("Invalid memory file id");
		return join(await collection(kind, signal), `${id}.md`);
	}
	async function read(kind, id, signal) {
		const path = await pathFor(kind, id, signal);
		const before = await lstat(path);
		if (!before.isFile() || before.isSymbolicLink()) throw new Error("Memory file must be a regular file, not a link");
		const file = await open(path, process.platform === "win32" ? constants.O_RDONLY : constants.O_RDONLY | constants.O_NOFOLLOW);
		try {
			const stat = await file.stat();
			if (!stat.isFile() || stat.size > maxFileBytes) throw new Error("Memory file exceeds the configured byte limit");
			const buffer = Buffer.alloc(maxFileBytes + 1);
			let used = 0;
			while (used < buffer.length) {
				signal?.throwIfAborted();
				const { bytesRead } = await file.read(buffer, used, buffer.length - used, used);
				if (bytesRead === 0) break;
				used += bytesRead;
			}
			if (used > maxFileBytes) throw new Error("Memory file exceeds the configured byte limit");
			signal?.throwIfAborted();
			const content = new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, used));
			return {
				id,
				name: titleOf(content, id),
				content
			};
		} finally {
			await file.close();
		}
	}
	async function list(kind, signal) {
		const path = await collection(kind, signal);
		const rows = [];
		for (const entry of await readdir(path, { withFileTypes: true })) {
			signal?.throwIfAborted();
			if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
			const id = basename(entry.name, ".md");
			if (!ID_RE.test(id)) continue;
			const stat = await lstat(join(path, entry.name));
			if (!stat.isFile() || stat.isSymbolicLink()) continue;
			rows.push({
				id,
				name: id,
				size: stat.size,
				mtime: stat.mtimeMs
			});
		}
		rows.sort(kind === "pages" ? (a, b) => a.id.localeCompare(b.id) : (a, b) => b.mtime - a.mtime || a.id.localeCompare(b.id));
		return rows;
	}
	return {
		async status(signal) {
			const pages = await list("pages", signal);
			const notes = await list("notes", signal);
			return {
				store: root,
				counts: {
					pages: pages.length,
					notes: notes.length
				},
				bytes: [...pages, ...notes].reduce((total, file) => total + file.size, 0)
			};
		},
		async pages(signal) {
			const items = [];
			for (const row of await list("pages", signal)) {
				const document = await read("pages", row.id, signal);
				items.push({
					id: row.id,
					name: document.name,
					size: row.size
				});
			}
			return { items };
		},
		async page(id, signal) {
			return { page: await read("pages", id, signal) };
		},
		async notes(limit, offset, signal) {
			if (!Number.isInteger(limit) || limit < 1 || limit > 500 || !Number.isInteger(offset) || offset < 0 || offset > 1e5) throw new Error("Notes require limit 1..500 and offset 0..100000");
			const rows = await list("notes", signal);
			const items = [];
			for (const row of rows.slice(offset, offset + limit)) {
				const document = await read("notes", row.id, signal);
				items.push({
					...row,
					name: document.name
				});
			}
			return {
				items,
				total: rows.length,
				limit,
				offset
			};
		},
		async note(id, signal) {
			return { note: await read("notes", id, signal) };
		},
		async search(query, signal) {
			const needle = query.trim().toLowerCase();
			if (needle.length > 1024) throw new Error("Search text must not exceed 1024 characters");
			const results = [];
			if (!needle) return { results };
			for (const kind of ["pages", "notes"]) for (const row of await list(kind, signal)) {
				const document = await read(kind, row.id, signal);
				const contentAt = document.content.toLowerCase().indexOf(needle);
				if (contentAt === -1 && !document.name.toLowerCase().includes(needle)) continue;
				const start = Math.max(0, contentAt - 40);
				const end = Math.min(document.content.length, Math.max(0, contentAt) + needle.length + 100);
				const snippet = `${start ? "…" : ""}${document.content.slice(start, end).replace(/\r?\n/g, " ")}${end < document.content.length ? "…" : ""}`;
				results.push({
					id: row.id,
					kind: kind === "pages" ? "page" : "note",
					name: document.name,
					snippet
				});
				if (results.length >= searchLimit) return { results };
			}
			return { results };
		},
		async saveNote(title, text, signal) {
			const heading = title.trim();
			const body = text.trim();
			if (!body) throw new Error("Note content must not be empty");
			if (/[\r\n]/.test(heading)) throw new Error("Note title must be one line");
			const content = heading ? `# ${heading}\n\n${body}\n` : `${body}\n`;
			if (Buffer.byteLength(content, "utf8") > maxFileBytes) throw new Error("Note exceeds the configured byte limit");
			const slug = (heading || body.slice(0, 20)).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "note";
			const id = `${(/* @__PURE__ */ new Date()).toISOString().replace(/[^0-9]/g, "")}-${slug}-${randomUUID()}`;
			const path = await pathFor("notes", id, signal);
			signal?.throwIfAborted();
			const file = await open(path, "wx", 384);
			let committed = false;
			try {
				signal?.throwIfAborted();
				await file.writeFile(content, "utf8");
				signal?.throwIfAborted();
				committed = true;
			} finally {
				await file.close();
				if (!committed) await unlink(path);
			}
			return {
				id,
				name: titleOf(content, id),
				path
			};
		}
	};
}
//#endregion
//#region lib/types/index.js
/** Optional native Host service for the human-facing local Markdown panel. */
/** Stable plugin id; opt-in only. */
const name = "@dsh-selfuse/memory-panel";
/** Host-owned environment and authenticated RPC catalog. */
const inject = ["launchEnvironment", "typert"];
/** Native configuration validation; this layer does not select a model. */
const Config = z.object({
	root: z.string().default(""),
	maxFileBytes: z.number().min(256).max(1048576).step(1).default(262144),
	searchLimit: z.number().min(1).max(500).step(1).default(50)
});
function descriptor(method, parameters) {
	return Object.freeze({
		id: `${name}#memoryPanel/${method}`,
		service: "memoryPanel",
		namespace: "memoryPanel",
		method,
		invocation: Object.freeze({ kind: "direct" }),
		parameters: Object.freeze(parameters.map((parameter) => Object.freeze({
			name: parameter,
			wire: parameter,
			source: "json",
			codec: Object.freeze({ mode: "src-json" })
		}))),
		cancellation: Object.freeze({ parameter: "signal" }),
		result: Object.freeze({ mode: "src-json" })
	});
}
const INVOCATIONS = [
	descriptor("status", []),
	descriptor("pages", []),
	descriptor("page", ["id"]),
	descriptor("notes", ["limit", "offset"]),
	descriptor("note", ["id"]),
	descriptor("search", ["query"]),
	descriptor("saveNote", ["title", "text"])
];
/** Local Markdown access; only the settings tab consumes this service. */
var MemoryPanelService = class extends TypertRemoteService {
	ops;
	controller = new AbortController();
	pending = /* @__PURE__ */ new Set();
	/**
	* Register this instance and settle its file operations before unloading.
	* @param ctx - Context owning the service lifetime.
	* @param ops - Store operations bound to one validated Host directory.
	*/
	constructor(ctx, ops) {
		super(ctx, "memoryPanel");
		this.ops = ops;
		ctx.effect(() => async () => {
			this.controller.abort();
			await Promise.allSettled([...this.pending]);
		}, `${name}: pending file operations`);
	}
	run(operation, signal) {
		const task = operation(signal ? AbortSignal.any([signal, this.controller.signal]) : this.controller.signal);
		this.pending.add(task);
		task.then(() => this.pending.delete(task), () => this.pending.delete(task));
		return task;
	}
	/** Read directory counts and bytes.
	* @param signal - Optional cancellation.
	* @returns Metadata without file content.
	*/
	status(signal) {
		return this.run((s) => this.ops.status(s), signal);
	}
	/** List permitted knowledge files.
	* @param signal - Optional cancellation.
	* @returns File names and sizes; IO failures reject.
	*/
	pages(signal) {
		return this.run((s) => this.ops.pages(s), signal);
	}
	/** Read one knowledge page.
	* @param id - Restricted basename without extension.
	* @param signal - Optional cancellation.
	* @returns Complete bounded UTF-8 content; invalid ids and links reject.
	*/
	page(id, signal) {
		return this.run((s) => this.ops.page(id, s), signal);
	}
	/** List a page of notes in descending modification-time order.
	* @param limit - Integer from 1 to 500.
	* @param offset - Integer from 0 to 100000.
	* @param signal - Optional cancellation.
	* @returns Note metadata and total count.
	*/
	notes(limit, offset, signal) {
		return this.run((s) => this.ops.notes(limit, offset, s), signal);
	}
	/** Read one note.
	* @param id - Restricted basename without extension.
	* @param signal - Optional cancellation.
	* @returns Complete bounded UTF-8 content; invalid ids and links reject.
	*/
	note(id, signal) {
		return this.run((s) => this.ops.note(id, s), signal);
	}
	/** Search both collections by case-insensitive substring.
	* @param query - At most 1024 characters; empty returns no matches.
	* @param signal - Optional cancellation.
	* @returns Bounded snippets; unreadable or oversized files reject.
	*/
	search(query, signal) {
		return this.run((s) => this.ops.search(query, s), signal);
	}
	/** Create a uniquely named note without overwriting an existing file.
	* @param title - Optional one-line title represented by an empty string.
	* @param text - Non-empty note body.
	* @param signal - Optional cancellation before the write commits.
	* @returns The saved note id and actual configured path.
	*/
	saveNote(title, text, signal) {
		return this.run((s) => this.ops.saveNote(title, text, s), signal);
	}
};
/**
* Load the optional store and register its RPC methods without legacy HTTP routes.
* @param ctx - Host context providing launchEnvironment and typert.
* @param config - Native validated storage selection and bounds.
* @returns Resolves when file collections and the service are ready.
*/
async function apply(ctx, config) {
	const env = ctx.launchEnvironment;
	if (!env) throw new Error("Memory panel requires launchEnvironment");
	const home = env.get("DSH_HOME")?.value;
	const root = config.root || env.get("DSH_MEMORY_ROOT")?.value || (home ? join(home, "memory") : ctx.get("dshHomePath")?.("memory") ?? "");
	if (!isAbsolute(root)) throw new Error("Set an absolute memory root or launch with DSH_HOME");
	const ops = await createMemoryStore(root, config.maxFileBytes, config.searchLimit);
	ctx.effect(() => ctx.typert.register({
		package: name,
		face: "host",
		schemas: [],
		invocations: INVOCATIONS,
		model: Object.freeze({
			services: Object.freeze([]),
			events: Object.freeze([]),
			objects: Object.freeze([])
		})
	}), `${name}: RPC methods`);
	await ctx.plugin(MemoryPanelService, ops);
}
//#endregion
export { Config, MemoryPanelService, apply, inject, name };
