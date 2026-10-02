import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { copyFile, lstat, mkdir, open, readFile, readdir, rename, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import z from "@deepseek-ai/schemastery";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
//#region lib/types/storage.js
/** Literal, abortable filesystem operations for plugin-owned backup files. */
function basenameOnly(name) {
	if (!name || name === "." || name === ".." || /[/\\:\0]/.test(name)) throw new Error("Backup file operation requires a basename");
}
async function realDirectory(dir) {
	const entry = await lstat(dir);
	if (entry.isSymbolicLink()) throw new Error("Backup file operation rejects a symlink root");
	if (!entry.isDirectory()) throw new Error("Backup root is not a directory");
}
/**
* Unlink exact files, never invoking a shell or removing directories recursively.
* @param names - basenames validated as a batch before deleting any file.
* @param dir - existing, non-symlink containing directory.
* @param signal - optional cancellation checked before each unlink.
* @returns Completion; absent files are tolerated, other filesystem errors propagate.
*/
async function removeFiles(names, dir, signal) {
	for (const name of names) basenameOnly(name);
	signal?.throwIfAborted();
	await realDirectory(dir);
	for (const name of names) {
		signal?.throwIfAborted();
		try {
			await unlink(join(dir, name));
		} catch (error) {
			if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
		}
	}
}
/**
* Move a data directory beside itself without replacing an existing destination.
* @param dir - non-symlink parent directory.
* @param srcName - existing source basename.
* @param dstName - absent destination basename; callers serialize operations.
* @param signal - optional cancellation checked before renaming.
* @returns Completion or a filesystem error, preserving an existing destination.
*/
async function renameBeside(dir, srcName, dstName, signal) {
	basenameOnly(srcName);
	basenameOnly(dstName);
	signal?.throwIfAborted();
	await realDirectory(dir);
	if ((await lstat(join(dir, srcName))).isSymbolicLink()) throw new Error("Restore source is a symlink");
	let exists = true;
	try {
		await lstat(join(dir, dstName));
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") exists = false;
		else throw error;
	}
	if (exists) throw new Error("Restore aside destination already exists");
	signal?.throwIfAborted();
	await rename(join(dir, srcName), join(dir, dstName));
}
/**
* Reject lexical tar paths outside the expected data directory.
* @param entries - names emitted by the archive listing.
* @param base - expected data-root basename.
* @returns Nothing when names are valid; does not validate archive link metadata.
*/
function validateArchiveEntries(entries, base) {
	basenameOnly(base);
	if (!entries.length) throw new Error("Archive contains no entries");
	for (const entry of entries) if (entry !== base && !entry.startsWith(`${base}/`) || /[\\:\0]/.test(entry) || entry.split("/").some((part) => part === "..")) throw new Error("Archive contains a path outside the backup data root");
}
//#endregion
//#region lib/types/index.js
/** Local DSH-home archives, checksum verification and optional Git synchronization. */
/** Stable Loader row name. */
const name = "@dsh-selfuse/backup";
/** Native Host services required before activation. */
const inject = [
	"subprocess",
	"commands",
	"timer",
	"tools",
	"launchEnvironment"
];
/** POSIX archives receive owner-only permissions. */
const IS_WIN = process.platform === "win32";
/** sha256 回退路径（node:fs 读取 + node:crypto）的内存上限。 */
const HASH_MAX_BYTES = 256 * 1024 * 1024;
/** Native Loader configuration schema. */
const Config = z.object({
	destination: z.string().default("~/Desktop/@dsh-selfuse/backups"),
	keep: z.number().min(1).step(1).default(7),
	exclude: z.array(z.string()).default([]),
	githubRepo: z.string().default("")
});
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function errorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}
/** GitHub 单个文件 100MB 上限，留 10MB 余量。 */
const MAX_GITHUB_BYTES = 90 * 1024 * 1024;
/** 同步工作树目录名（位于备份目录下）。 */
const SYNC_DIR = ".github-sync";
/** Web 下载路由前缀（无尾斜杠：prefix 匹配语义为 pathname.startsWith(prefix + '/')）。 */
const DOWNLOAD_PREFIX = "/backup-download";
/**
* `backupPanel` Remote 命名空间的调用描述符（src-json codec）。手工经
* `ctx.typert.register()` 注册——运行时 registry 接受 src-json，免去 zod
* 依赖；Web 客户端半边（lib/client.js）携带同一套端点的 strict zod 定义。
*/
function panelDescriptor(method, parameters, cancellation = false, implementation) {
	return Object.freeze({
		id: `@dsh-selfuse/backup#backupPanel/${method}`,
		service: "backupPanel",
		namespace: "backupPanel",
		method,
		...implementation ? { implementation } : {},
		invocation: Object.freeze({ kind: "direct" }),
		parameters: Object.freeze(parameters.map((p) => Object.freeze({
			name: p,
			wire: p,
			source: "json",
			codec: Object.freeze({ mode: "src-json" }),
			...p === "hours" ? {} : { acceptsUndefined: true }
		}))),
		...cancellation ? { cancellation: Object.freeze({ parameter: "signal" }) } : {},
		result: Object.freeze({ mode: "src-json" })
	});
}
const PANEL_INVOCATIONS = Object.freeze([
	panelDescriptor("status", []),
	panelDescriptor("backup", ["keep"], true),
	panelDescriptor("verify", ["selector"], true),
	panelDescriptor("restore", ["selector", "dryRun"], true),
	panelDescriptor("setAuto", ["hours"]),
	panelDescriptor("githubStatus", []),
	panelDescriptor("githubSyncNow", [], true),
	panelDescriptor("deleteBackup", ["selector"], true),
	panelDescriptor("setGithubRepo", ["repo"])
]);
/**
* `backupPanel` 宿主服务：Settings 标签页的 RPC 面。方法签名与描述符的
* parameters 顺序一致（取消型方法末位是 signal），实现全部委托 ops 闭包，
* 与 `/backup` 命令、`backup_dsh` 工具共用同一套核心操作。
*/
var BackupPanelService = class extends TypertRemoteService {
	ops;
	/**
	* Bind operations owned by one backup plugin instance.
	* @param ctx - Context owning this service's registrations.
	* @param ops - Shared command, tool and panel operations.
	*/
	constructor(ctx, ops) {
		super(ctx, "backupPanel");
		this.ops = ops;
	}
	/** Read the current archive and schedule overview.
	* @returns Status without archive contents or credentials.
	*/
	status() {
		return this.ops.status();
	}
	/** Create an archive and apply retention.
	* @param keep - Optional retention override.
	* @param signal - Optional cancellation for subprocess and filesystem work.
	* @returns Archive metadata or an operation failure.
	*/
	backup(keep, signal) {
		return this.ops.backup(keep, signal);
	}
	/** Verify archive checksum sidecars.
	* @param selector - Archive prefix, all or latest; defaults to latest.
	* @param signal - Optional cancellation.
	* @returns Per-archive verification results.
	*/
	verify(selector, signal) {
		return this.ops.verify(selector, signal);
	}
	/** Preview or replace the local data root from a verified archive.
	* @param selector - Unique archive name or prefix; defaults to latest.
	* @param dryRun - True previews without writing; false performs restoration.
	* @param signal - Optional cancellation; existing aside data is retained.
	* @returns Preview or restoration metadata, or a failure.
	*/
	restore(selector, dryRun, signal) {
		return this.ops.restore(selector, dryRun, signal);
	}
	/** Persist a schedule and replace this instance's timer.
	* @param hours - Integer interval from 1 to 720, or zero to disable.
	* @returns Accepted or rejected update with the effective interval.
	*/
	setAuto(hours) {
		return this.ops.setAuto(hours);
	}
	/** Read the selected remote and last synchronization outcome.
	* @returns Status and credential presence, never a token value.
	*/
	githubStatus() {
		return this.ops.githubStatus();
	}
	/** Synchronize archives to the configured dedicated Git remote.
	* @param signal - Optional cancellation.
	* @returns Push outcome and any skipped large filenames.
	*/
	githubSyncNow(signal) {
		return this.ops.githubSyncNow(signal);
	}
	/** Unlink one selected archive and its checksum sidecar.
	* @param selector - Unique name or prefix; defaults to latest.
	* @param signal - Optional cancellation checked before each unlink.
	* @returns Deletion summary or a failure.
	*/
	deleteBackup(selector, signal) {
		return this.ops.remove(selector, signal);
	}
	/** Persist a remote override without performing a push.
	* @param repo - Repository path or URL; empty/off clears the override.
	* @returns Accepted or rejected update with the effective override.
	*/
	setGithubRepo(repo) {
		return this.ops.setGithubRepo(repo);
	}
};
async function apply(ctx, pluginConfig) {
	async function spawnRun(argv, cwd, signal) {
		const proc = ctx.subprocess.spawn({
			argv,
			cwd,
			graceMs: 5e3,
			signal,
			stdio: {
				stdin: "ignore",
				stdout: {
					maxBytes: 8192,
					spill: { maxBytes: 1 << 20 }
				},
				stderr: {
					maxBytes: 8192,
					spill: { maxBytes: 1 << 20 }
				}
			}
		});
		const outcome = await proc.done;
		signal?.throwIfAborted();
		const stdout = proc.collected.stdout?.readFrom(0);
		if (stdout?.lossy && !stdout.spillPath) throw new Error("Backup command output exceeded the complete capture limit; operation stopped");
		const out = stdout?.lossy && stdout.spillPath ? await readFile(stdout.spillPath, "utf8") : stdout?.text ?? "";
		signal?.throwIfAborted();
		const err = proc.collected.stderr?.readFrom(0).text ?? "";
		if (outcome.exitCode !== 0) throw new Error(`命令失败 exit=${outcome.exitCode}: ${err || out}`);
		return {
			out,
			err
		};
	}
	function paths() {
		const env = ctx.get("launchEnvironment");
		const toFwd = (p) => p.includes("\\") ? p.split("\\").join("/") : p;
		const homeRaw = env?.get("HOME")?.value || env?.get("USERPROFILE")?.value;
		const home = homeRaw ? toFwd(homeRaw.replace(/\/+$/, "")) : void 0;
		const dshHome = env?.get("DSH_HOME")?.value || (home ? `${home}/.dsh` : void 0);
		if (!home || !dshHome) throw new Error("无法解析 HOME/USERPROFILE 或 DSH_HOME（launchEnvironment 缺失）");
		const raw = typeof pluginConfig.destination === "string" && pluginConfig.destination.trim() ? pluginConfig.destination.trim() : "~/Desktop/@dsh-selfuse/backups";
		const root = raw.startsWith("~/") ? `${home}${raw.slice(1)}` : toFwd(raw);
		if (!isAbsolute(root) || !isAbsolute(dshHome)) throw new Error("Backup destination and DSH_HOME must be absolute host paths");
		const nested = relative(resolve(dshHome), resolve(root));
		if (nested === "" || !nested.startsWith("..") && !isAbsolute(nested)) throw new Error("Backup destination must be outside DSH_HOME");
		return {
			home,
			dshHome: toFwd(resolve(dshHome)),
			root: toFwd(resolve(root))
		};
	}
	function defaultKeep() {
		const k = pluginConfig.keep;
		return Number.isFinite(k) && k > 0 ? Math.floor(k) : 7;
	}
	function extraExcludes() {
		return (Array.isArray(pluginConfig.exclude) ? pluginConfig.exclude : []).filter((p) => typeof p === "string" && p.length > 0).map((p) => `--exclude=${p}`);
	}
	function stampNow() {
		const now = /* @__PURE__ */ new Date();
		const pad = (n, w = 2) => String(n).padStart(w, "0");
		return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${pad(now.getMilliseconds(), 3)}`;
	}
	/** Enumerate regular archive files; never follow archive symlinks. */
	async function listBackups() {
		const { root } = paths();
		let dirents;
		try {
			dirents = await readdir(root, { withFileTypes: true });
		} catch (error) {
			if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
			throw error;
		}
		const backups = [];
		for (const d of dirents) {
			if (!d.isFile() || !/^dsh-[A-Za-z0-9._-]+\.tar\.gz$/.test(d.name)) continue;
			let size;
			try {
				size = (await stat(`${root}/${d.name}`)).size;
			} catch {
				size = void 0;
			}
			backups.push({
				name: d.name,
				size
			});
		}
		return backups.sort((a, b) => a.name < b.name ? 1 : a.name > b.name ? -1 : 0);
	}
	async function writeOwned(p, content) {
		await mkdir(dirname(p), { recursive: true });
		await writeFile(p, content, {
			encoding: "utf8",
			mode: 384
		});
	}
	async function sha256File(absPath, home, signal) {
		for (const candidate of [["sha256sum", []], ["shasum", ["-a", "256"]]]) try {
			const h = (await spawnRun([
				await ctx.subprocess.resolveExecutable(candidate[0]),
				...candidate[1],
				absPath
			], home, signal)).out.trim().split(/\s+/)[0] ?? "";
			if (/^[0-9a-f]{64}$/.test(h)) return h;
			throw new Error(`无法解析 ${candidate[0]} 输出`);
		} catch {
			signal?.throwIfAborted();
		}
		const info = await stat(absPath);
		if (info.size > HASH_MAX_BYTES) throw new Error(`计算 sha256 失败：文件 ${Math.floor(info.size / 1048576)}MB 超过 ${Math.floor(HASH_MAX_BYTES / 1048576)}MB 回退上限`);
		const bytes = await readFile(absPath);
		signal?.throwIfAborted();
		return createHash("sha256").update(bytes).digest("hex");
	}
	async function doBackup(keep, signal) {
		const { home, dshHome, root } = paths();
		const keepN = keep && keep > 0 ? Math.floor(keep) : defaultKeep();
		await saveAutoState();
		const name = `dsh-${stampNow()}.tar.gz`;
		const out = `${root}/${name}`;
		const base = basename(dshHome);
		const parent = dshHome.slice(0, -(base.length + 1)) || "/";
		await spawnRun([
			await ctx.subprocess.resolveExecutable("tar"),
			"--exclude=*node_modules*",
			"--exclude=.system",
			...extraExcludes(),
			"-czf",
			name,
			"-C",
			parent,
			base
		], root, signal);
		const shaText = await sha256File(out, home, signal);
		await writeOwned(`${out}.sha256`, `${shaText}  ${out}\n`);
		if (!IS_WIN) await spawnRun([
			await ctx.subprocess.resolveExecutable("chmod"),
			"600",
			out,
			`${out}.sha256`
		], home, signal);
		const all = await listBackups();
		const stale = all.slice(keepN).map((b) => b.name);
		if (stale.length) await removeFiles(stale.flatMap((n) => [n, `${n}.sha256`]), root, signal);
		let sync = null;
		try {
			sync = await githubSync(signal);
			if (sync.pushed) {
				githubState = {
					...githubState,
					lastPush: sync.at ?? null,
					lastError: null
				};
				await saveAutoState();
			} else if (sync.error) {
				githubState = {
					...githubState,
					lastError: sync.error
				};
				await saveAutoState();
			}
		} catch (err) {
			const message = errorMessage(err);
			sync = { error: message };
			githubState = {
				...githubState,
				lastError: message
			};
			await saveAutoState();
		}
		return {
			path: out,
			sha: shaText,
			total: all.length,
			stale: stale.length,
			keep: keepN,
			sync
		};
	}
	function githubConfig() {
		const raw = typeof githubState.repo === "string" && githubState.repo.trim() ? githubState.repo.trim() : typeof pluginConfig.githubRepo === "string" && pluginConfig.githubRepo.trim() ? pluginConfig.githubRepo.trim() : "";
		if (!raw) return null;
		const env = ctx.get("launchEnvironment");
		const token = env?.get("DSH_BACKUP_GITHUB_TOKEN")?.value || env?.get("GITHUB_TOKEN")?.value;
		return {
			repo: (raw.includes("://") || /^[A-Za-z]:[\\/]|^\//.test(raw) ? raw : `https://github.com/${raw}.git`).split("\\").join("/"),
			token
		};
	}
	/** 校验仓库地址格式（owner/repo、完整 URL 或本地路径），非法返回原因。 */
	function validateRepo(raw) {
		if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(raw)) return null;
		if (raw.includes("://") || /^[A-Za-z]:[\\/]|^\//.test(raw)) return null;
		return "仓库地址应为 owner/repo、完整 URL（http(s)://...）或本地路径";
	}
	/**
	* 把当前备份集推送到 GitHub 仓库。工作树位于 `<备份目录>/.github-sync`：
	* 归档与边车复制进去，git add -A 同时记录轮换删除，commit 后
	* `push HEAD:main --force-with-lease`。https 远端的 token 只写入工作树内
	* 的 .git-credentials（credential helper），不进进程参数。
	*/
	async function githubSync(signal) {
		const { root } = paths();
		const cfg = githubConfig();
		if (!cfg) return { skipped: "未配置 githubRepo（cordis.yml config.githubRepo）" };
		if (cfg.repo.startsWith("https://") && !cfg.token) return { skipped: "https 远端缺少 token（环境变量 DSH_BACKUP_GITHUB_TOKEN 或 GITHUB_TOKEN）" };
		const syncDir = `${root}/${SYNC_DIR}`;
		const git = await ctx.subprocess.resolveExecutable("git");
		await mkdir(syncDir, { recursive: true });
		if (!await stat(`${syncDir}/.git`).then(() => true, () => false)) try {
			await spawnRun([
				git,
				"init",
				"-b",
				"main"
			], syncDir, signal);
		} catch {
			await spawnRun([git, "init"], syncDir, signal);
			await spawnRun([
				git,
				"branch",
				"-M",
				"main"
			], syncDir, signal);
		}
		if (!(await spawnRun([
			git,
			"remote",
			"-v"
		], syncDir, signal)).out.includes("origin")) await spawnRun([
			git,
			"remote",
			"add",
			"origin",
			cfg.repo
		], syncDir, signal);
		else await spawnRun([
			git,
			"remote",
			"set-url",
			"origin",
			cfg.repo
		], syncDir, signal);
		if (cfg.token) {
			const creds = `${syncDir}/.git-credentials`;
			await writeOwned(creds, `https://x-access-token:${cfg.token}@github.com\n`);
			if (!IS_WIN) await spawnRun([
				await ctx.subprocess.resolveExecutable("chmod"),
				"600",
				creds
			], syncDir, signal);
			await spawnRun([
				git,
				"config",
				"credential.helper",
				`store --file=${creds}`
			], syncDir, signal);
		}
		await writeOwned(`${syncDir}/.gitignore`, ".git-credentials\n");
		const keep = new Set([".gitignore", ".git-credentials"]);
		for (const b of await listBackups()) {
			keep.add(b.name);
			keep.add(`${b.name}.sha256`);
		}
		let entries = [];
		try {
			entries = await readdir(syncDir, { withFileTypes: true });
		} catch {
			entries = [];
		}
		const stale = entries.filter((e) => e.isFile() && !keep.has(e.name)).map((e) => e.name);
		if (stale.length) await removeFiles(stale, syncDir, signal);
		const tooBig = [];
		for (const b of await listBackups()) {
			if ((b.size ?? await stat(`${root}/${b.name}`).then((s) => s.size, () => 0)) > MAX_GITHUB_BYTES) {
				tooBig.push(b.name);
				continue;
			}
			await copyFile(`${root}/${b.name}`, `${syncDir}/${b.name}`);
			await copyFile(`${root}/${b.name}.sha256`, `${syncDir}/${b.name}.sha256`);
		}
		await spawnRun([
			git,
			"add",
			"-A"
		], syncDir, signal);
		if ((await spawnRun([
			git,
			"status",
			"--porcelain"
		], syncDir, signal)).out.trim()) await spawnRun([
			git,
			"-c",
			"user.name=@dsh-selfuse/backup",
			"-c",
			"user.email=@dsh-selfuse/backup@users.noreply.github.com",
			"commit",
			"-m",
			`backup ${(/* @__PURE__ */ new Date()).toISOString()}`
		], syncDir, signal);
		const expected = (await spawnRun([
			git,
			"ls-remote",
			"--heads",
			"origin",
			"refs/heads/main"
		], syncDir, signal)).out.trim().split(/\s+/)[0] ?? "";
		if (expected !== "" && !/^[a-f0-9]{40,64}$/.test(expected)) throw new Error("Cannot parse remote main revision");
		if (expected === (await spawnRun([
			git,
			"rev-parse",
			"HEAD"
		], syncDir, signal)).out.trim()) return {
			skipped: "无变更",
			tooBig
		};
		await spawnRun([
			git,
			"push",
			"origin",
			"HEAD:main",
			`--force-with-lease=refs/heads/main:${expected}`
		], syncDir, signal);
		return {
			pushed: true,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			tooBig
		};
	}
	function summarizeSync(s) {
		if (s.error) return `⚠️ GitHub 同步失败: ${s.error}`;
		if (s.pushed) return `✅ GitHub 同步完成: ${s.at}${s.tooBig?.length ? `\n跳过超大文件: ${s.tooBig.join(", ")}` : ""}`;
		return `GitHub 同步: ${s.skipped || "无变更"}${s.tooBig?.length ? `\n跳过超大文件: ${s.tooBig.join(", ")}` : ""}`;
	}
	async function handleDownload(req, res) {
		let file;
		try {
			const host = req.headers.host || "";
			const address = req.socket.remoteAddress;
			if (!/^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(host) || ![
				"127.0.0.1",
				"::1",
				"::ffff:127.0.0.1"
			].includes(address ?? "")) {
				res.writeHead(403);
				res.end("forbidden");
				return;
			}
			const pathname = new URL(req.url || "", "http://x").pathname;
			const name = decodeURIComponent(pathname.slice(16).replace(/^\//, ""));
			if (!/^dsh-[A-Za-z0-9._-]+\.tar\.gz$/.test(name)) {
				res.writeHead(400);
				res.end("bad name");
				return;
			}
			const { root } = paths();
			const abs = `${root}/${name}`;
			if (!(await lstat(root)).isDirectory() || !(await lstat(abs)).isFile()) throw new Error("Not a regular backup file");
			file = await open(abs, constants.O_RDONLY | constants.O_NOFOLLOW);
			if (!(await file.stat()).isFile()) throw new Error("Not a regular backup file");
			res.writeHead(200, {
				"Content-Type": "application/gzip",
				"Content-Disposition": `attachment; filename="${name}"`
			});
			file.createReadStream().on("error", () => {
				res.destroy();
			}).pipe(res);
			file = void 0;
		} catch {
			if (!res.headersSent) res.writeHead(404);
			res.end();
		} finally {
			await file?.close();
		}
	}
	async function verifyOne(name, home, signal) {
		const { root } = paths();
		const archive = `${root}/${name}`;
		let expected = "";
		try {
			expected = (await readFile(`${archive}.sha256`, "utf8")).trim().split(/\s+/)[0] ?? "";
		} catch {}
		if (!/^[0-9a-f]{64}$/.test(expected)) return {
			name,
			ok: false,
			note: "缺少或无效的 .sha256 边车文件"
		};
		const actual = await sha256File(archive, home, signal);
		return {
			name,
			ok: actual === expected,
			note: actual === expected ? "完整" : "sha256 不匹配（归档已损坏）"
		};
	}
	async function pickArchive(selector) {
		const all = await listBackups();
		const latest = all[0];
		if (latest === void 0) throw new Error("暂无备份");
		if (!selector || selector === "latest") return latest;
		const exact = all.filter((b) => b.name === selector);
		const hits = exact.length ? exact : all.filter((b) => b.name.startsWith(selector));
		const hit = hits[0];
		if (hits.length === 1 && hit !== void 0) return hit;
		if (!hits.length) throw new Error(`没有匹配 "${selector}" 的备份，/backup list 查看`);
		throw new Error(`"${selector}" 匹配多份备份，请加长前缀：\n${hits.slice(0, 5).map((b) => `  ${b.name}`).join("\n")}`);
	}
	/** 删除指定备份（归档 + 校验边车）；选择器经 pickArchive 精确匹配，杜绝路径穿越。 */
	async function removeBackup(selector, signal) {
		const { root } = paths();
		const picked = await pickArchive(selector);
		await removeFiles([picked.name, `${picked.name}.sha256`], root, signal);
		return {
			ok: true,
			name: picked.name,
			summary: `已删除备份: ${picked.name}`
		};
	}
	async function restoreArchive(selector, dryRun, signal) {
		const { home, dshHome, root } = paths();
		const picked = await pickArchive(selector);
		const archive = `${root}/${picked.name}`;
		const v = await verifyOne(picked.name, home, signal);
		if (!v.ok) throw new Error(`校验未通过（${v.note}），恢复已中止`);
		const base = basename(dshHome);
		const parent = dshHome.slice(0, -(base.length + 1)) || "/";
		const tar = await ctx.subprocess.resolveExecutable("tar");
		const entries = (await spawnRun([
			tar,
			"-tzf",
			picked.name
		], root, signal)).out.split("\n").map((s) => s.trim()).filter(Boolean);
		validateArchiveEntries(entries, base);
		if ((await spawnRun([
			tar,
			"-tvzf",
			picked.name
		], root, signal)).out.split("\n").filter(Boolean).some((line) => !/^[-d]/.test(line))) throw new Error("Restore rejects archives containing symbolic links, hard links or special files");
		if (dryRun) return {
			archive,
			files: entries.length,
			sample: entries.slice(0, 12),
			aside: null,
			snapshotPath: null,
			dryRun: true
		};
		const snapshot = await doBackup(Math.max(defaultKeep(), (await listBackups()).length + 1), signal);
		let aside = null;
		let current = false;
		try {
			await stat(dshHome);
			current = true;
		} catch {
			current = false;
		}
		if (current) {
			const asideName = `${base}.pre-restore-${stampNow()}`;
			await renameBeside(parent, base, asideName, signal);
			aside = `${parent}/${asideName}`;
		}
		await spawnRun([
			tar,
			"-xzf",
			picked.name,
			"-C",
			parent
		], root, signal);
		return {
			archive,
			files: entries.length,
			sample: [],
			aside,
			snapshotPath: snapshot.path,
			dryRun: false
		};
	}
	let autoDispose = null;
	let autoHours = 0;
	let lastAuto = null;
	let githubState = {
		repo: null,
		lastPush: null,
		lastError: null
	};
	async function saveAutoState() {
		const { root } = paths();
		await writeOwned(`${root}/auto.json`, `${JSON.stringify({
			hours: autoHours,
			github: githubState
		})}\n`);
	}
	async function loadAutoState() {
		try {
			const { root } = paths();
			const parsed = JSON.parse(await readFile(`${root}/auto.json`, "utf8"));
			if (!isRecord(parsed)) return 0;
			const h = Number(parsed.hours);
			if (isRecord(parsed.github)) githubState = {
				repo: typeof parsed.github.repo === "string" ? parsed.github.repo : null,
				lastPush: typeof parsed.github.lastPush === "string" ? parsed.github.lastPush : null,
				lastError: typeof parsed.github.lastError === "string" ? parsed.github.lastError : null
			};
			return Number.isFinite(h) && h >= 1 && h <= 720 ? Math.floor(h) : 0;
		} catch {
			return 0;
		}
	}
	function autoSummary() {
		if (!autoDispose) return "自动备份未开启（/backup auto <N小时> 开启）";
		const next = new Date(Date.now() + autoHours * 3600 * 1e3).toLocaleString();
		return `自动备份已开启：每 ${autoHours} 小时一次（已持久化，重启续跑），下次约 ${next}${lastAuto ? `；上次自动备份: ${lastAuto}` : ""}`;
	}
	async function runAutoBackup() {
		try {
			const r = await doBackup(autoHours >= 24 ? 7 : 3);
			lastAuto = r.path.split("/").pop() ?? null;
			console.log(`[@dsh-selfuse/backup] 自动备份完成: ${r.path} (sha ${r.sha.slice(0, 12)}…)`);
		} catch (err) {
			console.error(`[@dsh-selfuse/backup] 自动备份失败: ${errorMessage(err)}`);
		}
	}
	async function setAuto(h) {
		if (autoDispose) {
			autoDispose();
			autoDispose = null;
		}
		autoHours = h;
		if (h > 0) autoDispose = ctx.interval(() => {
			serial(runAutoBackup);
		}, h * 3600 * 1e3);
		await saveAutoState();
	}
	let pending = Promise.resolve();
	function serial(job) {
		const result = pending.then(job, job);
		pending = result.catch(() => void 0);
		return result;
	}
	ctx.commands.register({
		name: "backup",
		description: "备份/恢复 DSH 数据；子命令: list | verify [前缀|all] | restore <前缀|latest> [--dry-run] | auto [N小时|off] | [--keep N]",
		handler: (invocation) => serial(async () => {
			const input = invocation.rawInput.trim();
			try {
				const parts = input.split(/\s+/).filter(Boolean);
				const head = parts[0] || "";
				const { home } = paths();
				if (head === "list") {
					const all = await listBackups();
					const total = all.reduce((s, b) => s + (b.size || 0), 0);
					const lines = all.map((b) => `  ${b.name}${b.size !== void 0 ? `  ${(b.size / 1048576).toFixed(1)}MB` : ""}`);
					return {
						kind: "success",
						text: all.length ? `已有备份 (${all.length} 份，共 ${(total / 1048576).toFixed(1)}MB):\n${lines.join("\n")}\n\n${autoSummary()}` : `暂无备份。输入 /backup 执行首次备份。\n\n${autoSummary()}`
					};
				}
				if (head === "verify") {
					const sel = parts[1] || "latest";
					const names = sel === "all" ? (await listBackups()).map((b) => b.name) : [(await pickArchive(sel)).name];
					const results = [];
					for (const n of names) results.push(await verifyOne(n, home, invocation.signal));
					const bad = results.filter((r) => !r.ok);
					const text = results.map((r) => `${r.ok ? "✅" : "❌"} ${r.name} — ${r.note}`).join("\n");
					return bad.length ? {
						kind: "error",
						text: `${text}\n${bad.length} 份校验失败；损坏归档可删除后重新 /backup。`
					} : {
						kind: "success",
						text: text || "暂无备份可校验。"
					};
				}
				if (head === "restore") {
					const dryRun = parts.includes("--dry-run");
					const r = await restoreArchive(parts.slice(1).find((t) => !t.startsWith("--")) || "latest", dryRun, invocation.signal);
					if (r.dryRun) return {
						kind: "success",
						text: `📦 恢复预览（未写入）\n  归档: ${r.archive}\n  条目: ${r.files} 项\n${r.sample.map((s) => `    ${s}`).join("\n")}`
					};
					return {
						kind: "success",
						text: `✅ 恢复完成\n  来源: ${r.archive}（${r.files} 项）\n  恢复前快照: ${r.snapshotPath}\n${r.aside ? `  旧数据已移至: ${r.aside}\n` : ""}  请重启 dsh 使恢复的会话与配置生效。`
					};
				}
				if (head === "github") {
					const arg = parts[1] || "status";
					if (arg === "repo") {
						const value = parts.slice(2).join(" ");
						if (!value || value === "off") {
							githubState = {
								...githubState,
								repo: null,
								lastError: null
							};
							await saveAutoState();
							return {
								kind: "success",
								text: "GitHub 同步仓库已清除（回退到 cordis.yml 配置，若有）。"
							};
						}
						const invalid = validateRepo(value);
						if (invalid) return {
							kind: "error",
							text: invalid
						};
						githubState = {
							...githubState,
							repo: value,
							lastError: null
						};
						await saveAutoState();
						return {
							kind: "success",
							text: `GitHub 同步仓库已设为: ${value}\n${autoSummary()}`
						};
					}
					if (arg === "sync") {
						const s = await githubSync(invocation.signal);
						if (s.pushed) {
							githubState = {
								...githubState,
								lastPush: s.at ?? null,
								lastError: null
							};
							await saveAutoState();
						} else if (s.error) {
							githubState = {
								...githubState,
								lastError: s.error
							};
							await saveAutoState();
						}
						return {
							kind: "success",
							text: summarizeSync(s)
						};
					}
					if (arg === "status") {
						const cfg = githubConfig();
						return {
							kind: "success",
							text: cfg ? `GitHub 同步: ${cfg.repo}\n  token: ${cfg.token ? "已配置" : "未配置（https 远端需要）"}\n  ${githubState.lastPush ? `上次推送: ${githubState.lastPush}` : "尚未推送过"}\n  ${githubState.lastError ? `上次错误: ${githubState.lastError}` : ""}\n  /backup github repo <地址> 可修改` : "GitHub 同步未配置：/backup github repo <owner/repo> 设置，或在 cordis.yml 的 config.githubRepo 配置。"
						};
					}
					return {
						kind: "error",
						text: "用法: /backup github status|sync|repo <地址|off>"
					};
				}
				if (head === "delete" || head === "rm") {
					const sel = parts[1];
					if (!sel) return {
						kind: "error",
						text: "用法: /backup delete <归档名前缀|latest>"
					};
					return {
						kind: "success",
						text: `🗑️ ${(await removeBackup(sel, invocation.signal)).summary}`
					};
				}
				if (head === "auto") {
					const arg = parts[1];
					if (!arg || arg === "status") return {
						kind: "success",
						text: autoSummary()
					};
					if (arg === "off" || arg === "0") {
						await setAuto(0);
						return {
							kind: "success",
							text: "自动备份已关闭。"
						};
					}
					const h = Number(arg);
					if (!Number.isFinite(h) || h < 1 || h > 720) return {
						kind: "error",
						text: "小时数需为 1~720 之间的数字（如 /backup auto 12）"
					};
					await setAuto(h);
					return {
						kind: "success",
						text: `✅ 自动备份已开启：每 ${h} 小时执行一次（保留 ${h >= 24 ? 7 : 3} 份，已持久化）。\n${autoSummary()}`
					};
				}
				let keep;
				const m = input.match(/--keep\s+(\d+)/);
				if (m) keep = Number(m[1]);
				const r = await doBackup(keep, invocation.signal);
				return {
					kind: "success",
					text: `✅ 备份完成\n  文件: ${r.path}\n  校验和: ${r.sha.slice(0, 16)}…\n  轮换: 删除 ${r.stale} 份旧备份（保留 ${r.keep} 份）\n  ${autoSummary()}`
				};
			} catch (err) {
				return {
					kind: "error",
					text: `备份失败: ${errorMessage(err)}`
				};
			}
		})
	});
	ctx.tools.register(defineTool({
		name: "backup_dsh",
		description: "备份、校验或恢复 DSH 用户数据（~/.dsh 的会话、配置、技能、凭据）。mode=backup 立即备份（keep 指定保留份数）；mode=list 列出备份；mode=verify 校验完整性（selector=前缀或 all，缺省最新一份）；mode=restore 恢复（selector=前缀或 latest，dryRun 仅预览；恢复前自动校验并快照当前数据）；mode=auto 设置定时备份（hours 间隔小时数，0=关闭，缺省查询）。注意：备份包含明文凭据，请勿将备份目录同步到不受信位置。",
		parameters: {
			mode: {
				type: "string",
				required: true,
				enum: [
					"backup",
					"list",
					"verify",
					"restore",
					"auto"
				],
				description: "backup=执行备份，list=列出备份，verify=校验完整性，restore=恢复，auto=定时备份"
			},
			keep: {
				type: "number",
				description: "保留的备份份数（mode=backup，默认 7）"
			},
			hours: {
				type: "number",
				description: "定时备份间隔小时数（mode=auto；0=关闭；缺省=查询状态）"
			},
			selector: {
				type: "string",
				description: "备份选择器（mode=verify/restore）：归档名前缀、latest 或 all"
			},
			dryRun: {
				type: "boolean",
				description: "mode=restore 时仅预览恢复内容，不写入"
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					ok: {
						type: "boolean",
						required: true
					},
					summary: {
						type: "string",
						required: true
					},
					path: { type: "string" },
					sha: { type: "string" }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.summary
			}]
		},
		execute: (args, exec) => serial(async () => {
			const mode = args.mode;
			const signal = exec.signal;
			const selector = typeof args.selector === "string" && args.selector ? args.selector : void 0;
			try {
				if (mode === "list") {
					const all = await listBackups();
					return {
						ok: true,
						summary: `已有 ${all.length} 份备份:\n${all.map((b) => `  ${b.name}`).join("\n") || "（无）"}\n\n${autoSummary()}`
					};
				}
				if (mode === "verify") {
					const { home } = paths();
					const sel = selector || "latest";
					const names = sel === "all" ? (await listBackups()).map((b) => b.name) : [(await pickArchive(sel)).name];
					const lines = [];
					let bad = 0;
					for (const n of names) {
						const r = await verifyOne(n, home, signal);
						if (!r.ok) bad += 1;
						lines.push(`${r.ok ? "✅" : "❌"} ${r.name} — ${r.note}`);
					}
					return {
						ok: bad === 0,
						summary: lines.join("\n") || "暂无备份可校验。"
					};
				}
				if (mode === "restore") {
					const r = await restoreArchive(selector || "latest", Boolean(args.dryRun), signal);
					if (r.dryRun) return {
						ok: true,
						summary: `恢复预览（未写入）: ${r.archive}\n条目 ${r.files} 项，含:\n${r.sample.map((s) => `  ${s}`).join("\n")}`
					};
					return {
						ok: true,
						path: r.archive,
						summary: `恢复完成: ${r.archive}（${r.files} 项）\n恢复前快照: ${r.snapshotPath}\n${r.aside ? `旧数据已移至: ${r.aside}\n` : ""}请重启 dsh 生效。`
					};
				}
				if (mode === "auto") {
					const h = args.hours !== void 0 ? args.hours : null;
					if (h === null) return {
						ok: true,
						summary: autoSummary()
					};
					if (h === 0) {
						await setAuto(0);
						return {
							ok: true,
							summary: "自动备份已关闭。"
						};
					}
					if (!Number.isFinite(h) || h < 1 || h > 720) return {
						ok: false,
						summary: "hours 需为 1~720"
					};
					await setAuto(h);
					return {
						ok: true,
						summary: `自动备份已开启：每 ${h} 小时一次（已持久化）。\n${autoSummary()}`
					};
				}
				const r = await doBackup(args.keep ? args.keep : void 0, signal);
				return {
					ok: true,
					path: r.path,
					sha: r.sha,
					summary: `备份完成: ${r.path}\nsha256: ${r.sha}\n轮换删除 ${r.stale} 份（保留 ${r.keep} 份）`
				};
			} catch (err) {
				return {
					ok: false,
					summary: `操作失败: ${errorMessage(err)}`
				};
			}
		})
	}));
	const panelOps = {
		status: async () => {
			const all = await listBackups();
			const { root, dshHome } = paths();
			return {
				destination: root,
				dshHome,
				keepDefault: defaultKeep(),
				autoHours,
				lastAuto,
				downloadAvailable: ctx.get("webServer") !== void 0,
				backups: all.map((b) => ({
					name: b.name,
					size: typeof b.size === "number" ? b.size : null
				}))
			};
		},
		backup: async (keep, signal) => {
			const r = await doBackup(keep, signal);
			return {
				ok: true,
				summary: `备份完成: ${r.path}\nsha256: ${r.sha}\n轮换删除 ${r.stale} 份（保留 ${r.keep} 份）`,
				path: r.path,
				sha: r.sha,
				stale: r.stale,
				keep: r.keep
			};
		},
		verify: async (selector, signal) => {
			const { home } = paths();
			const sel = selector || "latest";
			const names = sel === "all" ? (await listBackups()).map((b) => b.name) : [(await pickArchive(sel)).name];
			const results = [];
			let bad = 0;
			for (const n of names) {
				const r = await verifyOne(n, home, signal);
				if (!r.ok) bad += 1;
				results.push({
					name: r.name,
					ok: r.ok,
					note: r.note
				});
			}
			return {
				ok: bad === 0,
				summary: results.map((r) => `${r.ok ? "✅" : "❌"} ${r.name} — ${r.note}`).join("\n") || "暂无备份可校验。",
				results
			};
		},
		restore: async (selector, dryRun, signal) => {
			try {
				const r = await restoreArchive(selector || "latest", Boolean(dryRun), signal);
				if (r.dryRun) return {
					ok: true,
					dryRun: true,
					archive: r.archive,
					files: r.files,
					sample: r.sample,
					summary: `归档 ${r.files} 项`
				};
				return {
					ok: true,
					dryRun: false,
					archive: r.archive,
					files: r.files,
					aside: r.aside,
					snapshotPath: r.snapshotPath,
					summary: `恢复完成（${r.files} 项）${r.aside ? `\n旧数据已移至 ${r.aside}` : ""}\n请重启 dsh 生效。`
				};
			} catch (err) {
				return {
					ok: false,
					dryRun: Boolean(dryRun),
					summary: errorMessage(err)
				};
			}
		},
		setAuto: async (hours) => {
			if (hours === 0) {
				await setAuto(0);
				return {
					ok: true,
					hours: 0,
					summary: "自动备份已关闭。"
				};
			}
			if (!Number.isFinite(hours) || hours < 1 || hours > 720) return {
				ok: false,
				hours: autoHours,
				summary: "hours 需为 1~720（0=关闭）"
			};
			await setAuto(Math.floor(hours));
			return {
				ok: true,
				hours: Math.floor(hours),
				summary: autoSummary()
			};
		},
		githubStatus: () => {
			const cfg = githubConfig();
			const { root } = paths();
			return Promise.resolve({
				repoRaw: githubState.repo ?? pluginConfig.githubRepo,
				repo: cfg ? cfg.repo : null,
				tokenSet: Boolean(cfg?.token),
				syncDir: `${root}/${SYNC_DIR}`,
				lastPush: githubState.lastPush,
				lastError: githubState.lastError
			});
		},
		githubSyncNow: async (signal) => {
			try {
				const s = await githubSync(signal);
				if (s.pushed) {
					githubState = {
						repo: githubState.repo ?? null,
						lastPush: s.at ?? null,
						lastError: null
					};
					await saveAutoState();
				} else if (s.error) {
					githubState = {
						...githubState,
						lastError: s.error
					};
					await saveAutoState();
				}
				return {
					ok: true,
					summary: summarizeSync(s),
					pushed: Boolean(s.pushed),
					tooBig: s.tooBig ?? []
				};
			} catch (err) {
				const message = errorMessage(err);
				githubState = {
					...githubState,
					lastError: message
				};
				await saveAutoState();
				return {
					ok: false,
					summary: message,
					pushed: false,
					tooBig: []
				};
			}
		},
		remove: async (selector, signal) => {
			try {
				return {
					ok: true,
					summary: (await removeBackup(selector || "latest", signal)).summary
				};
			} catch (err) {
				return {
					ok: false,
					summary: errorMessage(err)
				};
			}
		},
		setGithubRepo: async (repo) => {
			const raw = typeof repo === "string" ? repo.trim() : "";
			if (!raw) {
				githubState = {
					...githubState,
					repo: null,
					lastError: null
				};
				await saveAutoState();
				return {
					ok: true,
					repo: null,
					summary: "GitHub 同步仓库已清除（回退到 cordis.yml 配置，若有）。"
				};
			}
			const invalid = validateRepo(raw);
			if (invalid) return {
				ok: false,
				repo: githubState.repo,
				summary: invalid
			};
			githubState = {
				...githubState,
				repo: raw,
				lastError: null
			};
			await saveAutoState();
			return {
				ok: true,
				repo: raw,
				summary: `GitHub 同步仓库已设为: ${raw}`
			};
		}
	};
	ctx.inject(["typert"], (scope) => {
		scope.effect(() => scope.typert.register({
			package: "@dsh-selfuse/backup",
			face: "host",
			schemas: [],
			invocations: PANEL_INVOCATIONS,
			model: Object.freeze({
				services: Object.freeze([]),
				events: Object.freeze([]),
				objects: Object.freeze([])
			})
		}), "@dsh-selfuse/backup: typert invocations");
		function queued(operation) {
			return (...args) => serial(() => operation(...args));
		}
		scope.plugin(BackupPanelService, {
			...panelOps,
			backup: queued(panelOps.backup),
			verify: queued(panelOps.verify),
			restore: queued(panelOps.restore),
			setAuto: queued(panelOps.setAuto),
			githubSyncNow: queued(panelOps.githubSyncNow),
			remove: queued(panelOps.remove),
			setGithubRepo: queued(panelOps.setGithubRepo)
		});
	});
	ctx.inject(["webServer"], (scope) => {
		scope.effect(() => scope.webServer.register({
			kind: "prefix",
			path: DOWNLOAD_PREFIX,
			handler: (req, res) => {
				handleDownload(req, res);
			}
		}), "@dsh-selfuse/backup: download route");
	});
	{
		const h = await loadAutoState();
		if (h > 0) {
			autoHours = h;
			autoDispose = ctx.interval(() => {
				serial(runAutoBackup);
			}, h * 3600 * 1e3);
		}
	}
}
//#endregion
export { BackupPanelService, Config, apply, inject, name };
