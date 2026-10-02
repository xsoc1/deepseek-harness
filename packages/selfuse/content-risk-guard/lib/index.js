import z from "@deepseek-ai/schemastery";
import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { createHash, randomBytes } from "node:crypto";
import { lstat, mkdir, open, readFile, readdir, unlink } from "node:fs/promises";
import { constants } from "node:fs";
import { withFileLock, writeFileAtomic } from "@deepseek-ai/dsh-atomic-write";
import { isMap, parseDocument } from "yaml";
//#region lib/types/local-result-store.js
const HANDLE_PATTERN$1 = /^[a-f0-9]{32}$/;
const FILE_PATTERN = /^[a-f0-9]{32}\.json$/;
const SWEEP_INTERVAL_MS = 3600 * 1e3;
/** Private, session-scoped storage for tool text omitted from model history. */
var LocalResultStore = class {
	root;
	retentionMs;
	maxStoredBytes;
	lastSweep = 0;
	constructor(root, retentionMs, maxStoredBytes) {
		this.root = root;
		this.retentionMs = retentionMs;
		this.maxStoredBytes = maxStoredBytes;
	}
	async ensureRoot() {
		await mkdir(this.root, {
			recursive: true,
			mode: 448
		});
		const info = await lstat(this.root);
		if (!info.isDirectory() || info.isSymbolicLink() || (info.mode & 63) !== 0 || process.getuid !== void 0 && info.uid !== process.getuid()) throw new Error("local result directory is not private");
	}
	async sweep(now) {
		if (now - this.lastSweep < SWEEP_INTERVAL_MS) return;
		this.lastSweep = now;
		for (const name of await readdir(this.root)) {
			if (!FILE_PATTERN.test(name)) continue;
			const path = join(this.root, name);
			const info = await lstat(path);
			if (!info.isFile() || info.isSymbolicLink()) continue;
			if (now - info.mtimeMs > this.retentionMs) await unlink(path);
		}
	}
	/** Save text under an unpredictable handle; the handle contains no path or secret.
	* @param sessionId session permitted to retrieve this retained result.
	* @param callId tool call that produced the result.
	* @param raw complete private result retained on the local filesystem.
	* @returns an opaque handle bound to the owning session.
	*/
	async save(sessionId, callId, raw) {
		const payload = JSON.stringify({
			sessionId,
			callId,
			createdAt: Date.now(),
			raw
		});
		if (Buffer.byteLength(payload, "utf8") > this.maxStoredBytes) throw new Error("local result record exceeds the configured size limit");
		await this.ensureRoot();
		await this.sweep(Date.now());
		const handle = randomBytes(16).toString("hex");
		const file = await open(join(this.root, `${handle}.json`), "wx", 384);
		try {
			await file.writeFile(payload);
		} finally {
			await file.close();
		}
		return handle;
	}
	/** Return only the owning session's locally stored text to the in-process classifier.
	* @param sessionId session requesting its retained result.
	* @param handle opaque handle previously returned by save.
	* @returns original text when ownership, file mode, and retention checks pass.
	*/
	async load(sessionId, handle) {
		if (!HANDLE_PATTERN$1.test(handle)) throw new Error("invalid local result handle");
		await this.ensureRoot();
		const path = join(this.root, `${handle}.json`);
		const info = await lstat(path);
		if (!info.isFile() || info.isSymbolicLink() || info.size > this.maxStoredBytes || (info.mode & 63) !== 0 || process.getuid !== void 0 && info.uid !== process.getuid()) throw new Error("local result file is unsafe");
		let value;
		try {
			value = JSON.parse(await readFile(path, "utf8"));
			if (typeof value.sessionId !== "string" || typeof value.raw !== "string" || !Number.isSafeInteger(value.createdAt) || typeof value.callId !== "string") throw new Error("invalid local result record");
		} catch {
			throw new Error("local result record is unavailable");
		}
		if (value.sessionId !== sessionId) throw new Error("local result belongs to another session");
		if (value.createdAt > Date.now() || Date.now() - value.createdAt > this.retentionMs) throw new Error("local result expired");
		return value.raw;
	}
};
//#endregion
//#region lib/types/sanitizer.js
function scanTexts(text) {
	const candidates = [text];
	const fragments = [];
	let complete = true;
	try {
		const parsed = JSON.parse(text);
		const visit = (value, depth) => {
			if (depth > 24) {
				complete = false;
				return;
			}
			if (typeof value === "string") {
				candidates.push(value);
				fragments.push(value);
				if (/^[\s]*[\[{\"]/.test(value)) try {
					visit(JSON.parse(value), depth + 1);
				} catch {}
			} else if (Array.isArray(value)) for (const item of value) visit(item, depth + 1);
			else if (value !== null && typeof value === "object") for (const item of Object.values(value)) visit(item, depth + 1);
		};
		visit(parsed, 0);
		candidates.push(fragments.join("\n"));
	} catch {}
	return {
		complete,
		texts: candidates.map((candidate) => candidate.replace(/\\r?\\n/g, "\n").replace(/\\t/g, "	").replace(/^[ \t]*(?:L)?\d{1,9}(?:[ \t]*[|:]|\t| +)([ \t]*)/gm, "$1"))
	};
}
function containsNetworkMaterial(text) {
	const nodeType = /(?:^|\n)[ \t]*type:[ \t]*(?:socks5|vmess|vless|trojan|ss|ssr|hysteria|hysteria2|tuic)\b/im.test(text);
	const credentialField = /(?:^|\n)[ \t]*(?:username|password):/im.test(text);
	const serverField = /(?:^|\n)[ \t]*server:[ \t]*\S+/im.test(text);
	return /(?:^|\n)[ \t]*(?:proxies|proxy-groups):[ \t]*(?:\n|$)/im.test(text) || /\b(?:vmess|vless|trojan|ss|ssr|hysteria|hysteria2|tuic):\/\//i.test(text) || /\b(?:dm1lc3M|dmxlc3M|dHJvamFu|c3M6)[A-Za-z0-9+/=]{20,}\b/.test(text) || /https?:\/\/[^\s]*(?:subscribe|token=|subscription)[^\s]*/i.test(text) || serverField && (nodeType || credentialField);
}
/** Extract bounded, non-identifying facts from one locally retained result.
* @param text result held on the local machine.
* @returns counts and flags without names, endpoints, links, or credentials.
*/
function summarizeRiskContent(text) {
	const candidates = scanTexts(text).texts;
	const normalized = candidates.find((candidate) => /(?:^|\n)[ \t]*proxies:[ \t]*\n/m.test(candidate)) ?? candidates[0] ?? text;
	const proxySection = normalized.match(/(?:^|\n)proxies:\s*\n((?:[ \t]+[^\n]*\n)*)/m)?.[1] ?? "";
	const groupSection = normalized.match(/(?:^|\n)proxy-groups:\s*\n((?:[ \t]+[^\n]*\n)*)/m)?.[1] ?? "";
	return {
		bytes: Buffer.byteLength(text, "utf8"),
		proxyEntries: (proxySection.match(/^[ \t]*-[ \t]+name:/gm) ?? []).length,
		groupEntries: (groupSection.match(/^[ \t]*-[ \t]+name:/gm) ?? []).length,
		protocolLinks: (normalized.match(/\b(?:vmess|vless|trojan|ss|ssr|hysteria|hysteria2|tuic):\/\//gi) ?? []).length,
		subscriptionLinks: (normalized.match(/https?:\/\/[^\s]*(?:subscribe|token=|subscription)[^\s]*/gi) ?? []).length,
		hasTunSection: /(?:^|\n)tun:\s*\n/m.test(normalized),
		hasDnsSection: /(?:^|\n)dns:\s*\n/m.test(normalized)
	};
}
/** Conservative classifier; it does not claim to predict an upstream policy verdict.
* @param text model-bound or tool-result text to inspect.
* @returns true for recognized network material or an incomplete nested scan.
*/
function hasSensitiveNetworkContent(text) {
	if (!text) return false;
	const scanned = scanTexts(text);
	return !scanned.complete || scanned.texts.some(containsNetworkMaterial);
}
//#endregion
//#region lib/types/local-network-profile.js
const ID_PATTERN = /^[a-z][a-z0-9_-]{0,31}$/i;
const HANDLE_PATTERN = /^[a-f0-9]{32}$/;
function digest(text) {
	return createHash("sha256").update(text).digest("hex");
}
function parseProfile(text) {
	const document = parseDocument(text, {
		strict: true,
		uniqueKeys: true,
		merge: false
	});
	if (document.errors.length > 0 || !isMap(document.contents)) throw new Error("local network profile is not a valid YAML mapping");
	return document;
}
async function readRegularFile(path, maxBytes, privateFile) {
	const before = await lstat(path);
	if (!before.isFile() || before.isSymbolicLink() || before.size > maxBytes || privateFile && ((before.mode & 63) !== 0 || process.getuid !== void 0 && before.uid !== process.getuid())) throw new Error("local network profile file is unavailable or unsafe");
	const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
	try {
		const opened = await file.stat();
		if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino || opened.size > maxBytes) throw new Error("local network profile changed during read");
		const text = await file.readFile({ encoding: "utf8" });
		if (Buffer.byteLength(text, "utf8") > maxBytes) throw new Error("local network profile exceeds size limit");
		return text;
	} finally {
		await file.close();
	}
}
/** Local-only profile executor. It never returns raw YAML or configured paths. */
var LocalNetworkProfileExecutor = class {
	privateRoot;
	maxBytes;
	profiles = /* @__PURE__ */ new Map();
	constructor(profiles, privateRoot, maxBytes) {
		this.privateRoot = privateRoot;
		this.maxBytes = maxBytes;
		for (const profile of profiles) {
			if (!ID_PATTERN.test(profile.id) || !isAbsolute(profile.path) || this.profiles.has(profile.id)) throw new Error("content-risk-guard: profile ids must be unique and paths must be absolute");
			this.profiles.set(profile.id, profile.path);
		}
	}
	/** Return only non-secret aliases configured by the local owner.
	* @returns configured profile aliases, without filesystem paths.
	*/
	list() {
		return [...this.profiles.keys()];
	}
	/** Recognize a direct tool reference to one allowlisted file without exposing its path.
	* @param argumentsValue tool arguments to inspect for an exact configured path.
	* @returns whether an allowlisted profile path appears in those arguments.
	*/
	referencesConfiguredPath(argumentsValue) {
		if (this.profiles.size === 0) return false;
		const serialized = JSON.stringify(argumentsValue);
		return [...this.profiles.values()].some((path) => serialized.includes(path));
	}
	pathFor(id) {
		const path = this.profiles.get(id);
		if (path === void 0) throw new Error("local network profile id is not configured");
		return path;
	}
	outcome(text, changed, backupHandle) {
		return {
			changed,
			sha256: digest(text),
			facts: summarizeRiskContent(text),
			...backupHandle === void 0 ? {} : { backupHandle }
		};
	}
	/** Inspect one allowlisted YAML file without revealing its values.
	* @param id non-secret alias configured by the local owner.
	* @returns a digest and bounded, non-identifying facts.
	*/
	async inspect(id) {
		const text = await readRegularFile(this.pathFor(id), this.maxBytes, false);
		parseProfile(text);
		return this.outcome(text, false);
	}
	async backup(id, raw) {
		const root = join(this.privateRoot, "profile-backups");
		await mkdir(root, {
			recursive: true,
			mode: 448
		});
		const parent = await lstat(this.privateRoot);
		const info = await lstat(root);
		if (!parent.isDirectory() || parent.isSymbolicLink() || (parent.mode & 63) !== 0 || process.getuid !== void 0 && parent.uid !== process.getuid() || !info.isDirectory() || info.isSymbolicLink() || (info.mode & 63) !== 0 || process.getuid !== void 0 && info.uid !== process.getuid()) throw new Error("local network backup directory is not private");
		const record = JSON.stringify({
			profileId: id,
			raw
		});
		if (Buffer.byteLength(record, "utf8") > this.maxBytes) throw new Error("local network backup exceeds size limit");
		const handle = randomBytes(16).toString("hex");
		await writeFileAtomic(join(root, `${handle}.json`), record, {
			mode: 384,
			dirMode: 448
		});
		return handle;
	}
	/** Apply an approved non-secret edit after backing up the complete original.
	* @param id alias of the allowlisted YAML file.
	* @param change constrained edit approved by the human-approval channel.
	* @returns facts about the resulting file and a rollback handle when changed.
	*/
	async apply(id, change) {
		const path = this.pathFor(id);
		return withFileLock(path, async () => {
			const original = await readRegularFile(path, this.maxBytes, false);
			const document = parseProfile(original);
			if (change.operation === "set-mode") document.set("mode", change.mode);
			else if (change.operation === "set-tun-enabled") document.setIn(["tun", "enable"], change.enabled);
			else document.setIn(["dns", "enable"], change.enabled);
			const updated = String(document);
			parseProfile(updated);
			if (Buffer.byteLength(updated, "utf8") > this.maxBytes) throw new Error("local network profile exceeds size limit");
			if (updated === original) return this.outcome(original, false);
			const backupHandle = await this.backup(id, original);
			await writeFileAtomic(path, updated, { mode: 384 });
			return this.outcome(updated, true, backupHandle);
		});
	}
	/** Restore an approved backup belonging to the same configured profile.
	* @param id alias of the allowlisted YAML file.
	* @param handle opaque handle for a backup belonging to that profile.
	* @returns facts about the restored file and a backup of the replaced state when changed.
	*/
	async restore(id, handle) {
		if (!HANDLE_PATTERN.test(handle)) throw new Error("invalid local network backup handle");
		const path = this.pathFor(id);
		return withFileLock(path, async () => {
			const recordText = await readRegularFile(join(this.privateRoot, "profile-backups", `${handle}.json`), this.maxBytes, true);
			let record;
			try {
				record = JSON.parse(recordText);
			} catch {
				throw new Error("local network backup is invalid");
			}
			if (record === null || typeof record !== "object" || !("profileId" in record) || !("raw" in record) || record.profileId !== id || typeof record.raw !== "string") throw new Error("local network backup does not belong to this profile");
			parseProfile(record.raw);
			const current = await readRegularFile(path, this.maxBytes, false);
			if (current === record.raw) return this.outcome(current, false);
			const backupHandle = await this.backup(id, current);
			await writeFileAtomic(path, record.raw, { mode: 384 });
			return this.outcome(record.raw, true, backupHandle);
		});
	}
};
//#endregion
//#region lib/types/index.js
const name = "@dsh-selfuse/content-risk-guard";
const inject = ["tools"];
const Config = z.object({
	enabled: z.boolean().default(true).description("是否启用本地敏感结果隔离"),
	privateRoot: z.string().default("").description("敏感工具结果的本地私有绝对路径；留空使用 DSH_HOME"),
	retentionHours: z.number().default(24).description("本地结果最长保留小时数"),
	maxStoredBytes: z.number().default(5e6).description("单条本地结果记录最大 UTF-8 字节数"),
	profiles: z.array(z.object({
		id: z.string().required(),
		path: z.string().required()
	})).default([]).description("允许本地检查和受审批修改的网络 YAML 文件；只向模型显示 id")
});
function apply(ctx, config = {}) {
	if (config.enabled === false) return;
	const retentionHours = config.retentionHours ?? 24;
	const maxStoredBytes = config.maxStoredBytes ?? 5e6;
	if (!Number.isInteger(retentionHours) || retentionHours <= 0 || !Number.isInteger(maxStoredBytes) || maxStoredBytes <= 0) throw new Error("content-risk-guard: retentionHours and maxStoredBytes must be positive integers");
	const dshHome = process.env.DSH_HOME ?? join(homedir(), ".dsh");
	const privateRoot = config.privateRoot || join(dshHome, "private-content-risk");
	if (!isAbsolute(privateRoot)) throw new Error("content-risk-guard: privateRoot must be absolute");
	const store = new LocalResultStore(privateRoot, retentionHours * 60 * 60 * 1e3, maxStoredBytes);
	const profiles = new LocalNetworkProfileExecutor(config.profiles ?? [], privateRoot, maxStoredBytes);
	ctx.on("llm/stream", (options, next) => {
		let safe = false;
		try {
			safe = !hasSensitiveNetworkContent(JSON.stringify({
				messages: options.messages,
				system: options.system,
				tools: options.tools
			}));
		} catch {}
		if (safe) return next();
		return (async function* () {
			await Promise.resolve();
			yield {
				type: "finish",
				reason: {
					kind: "error",
					failure: {
						code: "LOCAL_PRIVATE_CONTENT_BLOCKED",
						message: "Local privacy check stopped this model request. Start a new session if earlier turns contain a network profile; keep private configuration in local tools."
					}
				}
			};
		})();
	}, {
		global: true,
		prepend: true
	});
	async function isolate(content, sessionId, callId, force = false) {
		let changed = false;
		const mapped = [];
		for (const block of content) {
			if (block.type !== "text" || !force && !hasSensitiveNetworkContent(block.text)) {
				mapped.push(block);
				continue;
			}
			const handle = await store.save(sessionId, callId, block.text);
			changed = true;
			mapped.push({
				type: "text",
				text: `local-result:${handle} — network configuration held on this machine. Use inspect_local_network_result for safe facts.`
			});
		}
		return {
			changed,
			content: changed ? mapped : [...content]
		};
	}
	ctx.on("tools/post-execute", async (exec, result, next) => {
		const decision = await next();
		if (decision.kind !== "accept") return decision;
		const profileRead = profiles.referencesConfiguredPath(exec.arguments);
		try {
			if (hasSensitiveNetworkContent(JSON.stringify([...result.additionalContexts ?? [], ...decision.additionalContexts ?? []]))) return {
				kind: "block",
				feedback: [{
					type: "text",
					text: "Sensitive deferred context was not sent to the model."
				}]
			};
		} catch {
			return {
				kind: "block",
				feedback: [{
					type: "text",
					text: "Uninspectable deferred context was not sent to the model."
				}]
			};
		}
		if (Object.hasOwn(decision, "value")) {
			let sensitive = profileRead;
			try {
				sensitive ||= hasSensitiveNetworkContent(JSON.stringify(decision.value));
			} catch {
				sensitive = true;
			}
			return sensitive ? {
				kind: "block",
				feedback: [{
					type: "text",
					text: "Sensitive structured result was not sent to the model."
				}]
			} : decision;
		}
		const content = decision.content ?? result.content;
		if (!content.some((block) => block.type === "text" && (profileRead || hasSensitiveNetworkContent(block.text)))) return decision;
		const sessionId = exec.agent?.session.header.id;
		if (sessionId === void 0) return {
			kind: "block",
			feedback: [{
				type: "text",
				text: "Sensitive result has no owning session; raw content was not sent."
			}]
		};
		try {
			return {
				kind: "accept",
				content: (await isolate(content, sessionId, exec.callId, profileRead)).content,
				...decision.additionalContexts ? { additionalContexts: decision.additionalContexts } : {}
			};
		} catch {
			return {
				kind: "block",
				feedback: [{
					type: "text",
					text: "Sensitive result could not be stored locally; raw content was not sent."
				}]
			};
		}
	});
	ctx.on("tools/ptc-dispatch-log", async (dispatch, next) => {
		try {
			const content = await next();
			if (!content.some((block) => block.type === "text" && hasSensitiveNetworkContent(block.text))) return content;
			const sessionId = dispatch.agent?.session.header.id;
			if (sessionId === void 0) return [{
				type: "text",
				text: "Sensitive sub-call result omitted: no owning session."
			}];
			return (await isolate(content, sessionId, dispatch.subCallId)).content;
		} catch {
			return [{
				type: "text",
				text: "Sub-call result omitted: log shaping or local storage failed."
			}];
		}
	});
	ctx.effect(() => ctx.tools.register(defineTool({
		name: "inspect_local_network_result",
		description: "Inspect safe counts and flags for a locally held network result by opaque handle. Raw hosts, nodes, and credentials are never returned.",
		parameters: { handle: {
			type: "string",
			required: true
		} },
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					bytes: {
						type: "integer",
						required: true
					},
					proxyEntries: {
						type: "integer",
						required: true
					},
					groupEntries: {
						type: "integer",
						required: true
					},
					protocolLinks: {
						type: "integer",
						required: true
					},
					subscriptionLinks: {
						type: "integer",
						required: true
					},
					hasTunSection: {
						type: "boolean",
						required: true
					},
					hasDnsSection: {
						type: "boolean",
						required: true
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: JSON.stringify(value)
			}]
		},
		async execute(args, exec) {
			const sessionId = exec.agent?.session.header.id;
			if (sessionId === void 0) throw new Error("local result requires an owning session");
			return summarizeRiskContent(await store.load(sessionId, args.handle));
		}
	})), "content-risk-guard: inspect local result");
	if (profiles.list().length === 0) return;
	ctx.on("tools/pre-execute", async (exec, next) => {
		const decision = await next();
		if (decision.kind !== "allow") return decision;
		if (exec.name === "change_local_network_profile" || exec.name === "restore_local_network_profile") return {
			kind: "ask",
			reason: "This changes a local network profile after creating a private backup. Review the requested operation before allowing it."
		};
		return decision;
	});
	const profileOutcome = {
		type: "object",
		additionalProperties: false,
		properties: {
			changed: {
				type: "boolean",
				required: true
			},
			sha256: {
				type: "string",
				required: true
			},
			backupHandle: { type: "string" },
			facts: {
				type: "object",
				additionalProperties: false,
				required: true,
				properties: {
					bytes: {
						type: "integer",
						required: true
					},
					proxyEntries: {
						type: "integer",
						required: true
					},
					groupEntries: {
						type: "integer",
						required: true
					},
					protocolLinks: {
						type: "integer",
						required: true
					},
					subscriptionLinks: {
						type: "integer",
						required: true
					},
					hasTunSection: {
						type: "boolean",
						required: true
					},
					hasDnsSection: {
						type: "boolean",
						required: true
					}
				}
			}
		}
	};
	ctx.effect(() => ctx.tools.register(defineTool({
		name: "list_local_network_profiles",
		description: "List configured local network profile aliases without exposing paths or contents.",
		parameters: {},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: { ids: {
					type: "array",
					required: true,
					items: { type: "string" }
				} }
			},
			render: (_args, value) => [{
				type: "text",
				text: JSON.stringify(value)
			}]
		},
		execute() {
			return Promise.resolve({ ids: profiles.list() });
		}
	})), "content-risk-guard: list local profiles");
	ctx.effect(() => ctx.tools.register(defineTool({
		name: "inspect_local_network_profile",
		description: "Inspect safe counts, flags, and hash of an allowlisted local network YAML profile. No raw content or path is returned.",
		parameters: { profileId: {
			type: "string",
			required: true
		} },
		output: {
			schema: profileOutcome,
			render: (_args, value) => [{
				type: "text",
				text: JSON.stringify(value)
			}]
		},
		async execute(args) {
			try {
				return await profiles.inspect(args.profileId);
			} catch {
				throw new Error("Local network profile inspection failed; no profile content was returned.");
			}
		}
	})), "content-risk-guard: inspect local profile");
	ctx.effect(() => ctx.tools.register(defineTool({
		name: "change_local_network_profile",
		description: "With human approval, set only tun.enable, dns.enable, or mode in an allowlisted local YAML profile; back up the original privately. Do not supply secrets.",
		parameters: {
			profileId: {
				type: "string",
				required: true
			},
			operation: {
				type: "string",
				required: true,
				enum: [
					"set-tun-enabled",
					"set-dns-enabled",
					"set-mode"
				]
			},
			enabled: { type: "boolean" },
			mode: {
				type: "string",
				enum: [
					"rule",
					"global",
					"direct"
				]
			}
		},
		output: {
			schema: profileOutcome,
			render: (_args, value) => [{
				type: "text",
				text: JSON.stringify(value)
			}]
		},
		async execute(args) {
			let change;
			if (args.operation === "set-mode") {
				if (args.mode !== "rule" && args.mode !== "global" && args.mode !== "direct") throw new Error("A supported mode is required.");
				change = {
					operation: "set-mode",
					mode: args.mode
				};
			} else {
				if (typeof args.enabled !== "boolean") throw new Error("An enabled boolean is required.");
				change = {
					operation: args.operation,
					enabled: args.enabled
				};
			}
			try {
				return await profiles.apply(args.profileId, change);
			} catch {
				throw new Error("Local network profile change failed; no profile content was returned.");
			}
		}
	})), "content-risk-guard: change local profile");
	ctx.effect(() => ctx.tools.register(defineTool({
		name: "restore_local_network_profile",
		description: "With human approval, restore a private backup to its originating allowlisted profile; the current file is backed up first.",
		parameters: {
			profileId: {
				type: "string",
				required: true
			},
			backupHandle: {
				type: "string",
				required: true
			}
		},
		output: {
			schema: profileOutcome,
			render: (_args, value) => [{
				type: "text",
				text: JSON.stringify(value)
			}]
		},
		async execute(args) {
			try {
				return await profiles.restore(args.profileId, args.backupHandle);
			} catch {
				throw new Error("Local network profile restore failed; no profile content was returned.");
			}
		}
	})), "content-risk-guard: restore local profile");
}
//#endregion
export { Config, apply, inject, name };
