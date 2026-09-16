import z from "@deepseek-ai/schemastery";
import { link, lstat, rename } from "node:fs/promises";
import { FsError } from "@deepseek-ai/dsh-fs";
import { LocalFileSystem } from "@deepseek-ai/dsh-fs-local";
//#region src/shared/paths.ts
/** The two UNC hosts WSL exposes a distribution's filesystem under. */
const UNC_HOSTS = ["wsl.localhost", "wsl$"];
/**
* Parse a WSL UNC path into its distro and Linux path. Accepts the WSL2
* `\\wsl.localhost\<distro>\<linux>` form, the legacy `\\wsl$\<distro>\<linux>`
* interop form, and forward-slash spellings of either.
* @param raw - candidate absolute path.
* @returns the parsed target, or null when the path is not a WSL UNC.
*/
function parseWslUnc(raw) {
	const normalized = raw.replace(/\\/g, "/").replace(/\/\/+/g, "//");
	if (!normalized.startsWith("//")) return null;
	const segments = normalized.slice(2).split("/");
	const host = (segments[0] ?? "").toLowerCase();
	if (!UNC_HOSTS.includes(host)) return null;
	const distro = segments[1] ?? "";
	if (distro === "") return null;
	return {
		distro,
		linuxPath: `/${segments.slice(2).filter((segment) => segment.length > 0).join("/")}`
	};
}
/**
* Whether a path is an absolute, non-empty Linux path.
* @param path - candidate.
* @returns whether it starts with `/` and contains no NUL.
*/
function isAbsoluteLinuxPath(path) {
	return path.startsWith("/") && !path.includes("\0");
}
/**
* Join a distro and a Linux absolute path into the WSL2 UNC form used as the
* workspace identity (`\\wsl.localhost\<distro>\<linux>`, backslash segments).
* @param distro - distro name.
* @param linuxPath - absolute Linux path (leading `/`).
* @returns the UNC path.
*/
function joinUnc(distro, linuxPath) {
	if (!isAbsoluteLinuxPath(linuxPath)) throw new Error(`wsl-workspace: cannot map a non-absolute Linux path "${linuxPath}" to UNC`);
	if (distro === "" || distro === "." || distro === ".." || /[\\/]/.test(distro)) throw new Error(`wsl-workspace: invalid distribution name "${distro}"`);
	const normalized = linuxPath.replace(/\/+/g, "/").replace(/\/$/, "");
	const windowsSegments = (normalized.startsWith("/") ? normalized.slice(1) : normalized).replace(/\//g, "\\");
	return `\\\\wsl.localhost\\${distro}${windowsSegments === "" ? "" : `\\${windowsSegments}`}`;
}
/**
* Translate a Windows drive path to the drvfs mount path WSL distributions
* conventionally expose it at (`C:\foo` → `/mnt/c/foo`). Only single-letter
* drives under `/mnt` are mapped; custom mount points are out of scope.
* @param path - the candidate Windows path.
* @returns the `/mnt/<drive>/…` path, or `null` for non-drive paths.
*/
function windowsToMntPath(path) {
	const match = /^([A-Za-z]):[\\/](.*)$/.exec(path);
	if (match === null) return null;
	const rest = (match[2] ?? "").replace(/\\/g, "/").replace(/\/+/g, "/").replace(/\/$/, "");
	return `/mnt/${(match[1] ?? "").toLowerCase()}${rest === "" ? "" : `/${rest}`}`;
}
/**
* Translate a `/mnt/<drive>/…` path back to its Windows drive path.
* @param linuxPath - the candidate Linux path.
* @returns the `X:\…` drive path, or `null` when the path is not a drvfs mount.
*/
function mntToWindowsPath(linuxPath) {
	const match = /^\/mnt\/([a-zA-Z])(?:\/(.*))?$/.exec(linuxPath);
	if (match === null) return null;
	const rest = (match[2] ?? "").replace(/\//g, "\\");
	return `${(match[1] ?? "").toUpperCase()}:\\${rest}`;
}
//#endregion
//#region src/fs.ts
/**
* The WSL filesystem backend. Identity keys are host-native realpaths; the
* Linux display form stays stable across Windows and WSL hosts.
*/
var WslFileSystem = class WslFileSystem extends LocalFileSystem {
	static Config = z.object({
		cwd: z.string(),
		distro: z.string(),
		diffBasisMaxBytes: z.number().default(10 * 1024 * 1024)
	});
	distro;
	nativeLinux = process.platform === "linux";
	constructor(ctx, config) {
		super(ctx, config);
		this.distro = config.distro;
		if (!this.nativeLinux) this.internals = {
			linkFile: WslFileSystem.publishNoReplace,
			replaceFile: WslFileSystem.replaceOverWrite,
			copyFileDacl: WslFileSystem.skipDaclCopy
		};
	}
	/**
	* No-replace publication for filesystems without hard links. A real
	* collision (a concurrent external creator won) must still surface as the
	* original EEXIST so the guarded-create failure path classifies it; an
	* absent target falls back to rename, which on Windows publishes without
	* replacing anything. Safe against this backend's own writers because the
	* per-target lock serializes them.
	* @param tempPath - the staged file.
	* @param destPath - the destination to create.
	*/
	static async publishNoReplace(tempPath, destPath) {
		try {
			await link(tempPath, destPath);
			return;
		} catch (error) {
			let exists = false;
			try {
				await lstat(destPath);
				exists = true;
			} catch {}
			if (exists) throw error;
			await rename(tempPath, destPath);
		}
	}
	/**
	* Security-preserving replacement boundary: Windows rename replaces an
	* existing destination atomically; no DACL preservation is needed over 9P.
	* @param destPath - the file being replaced.
	* @param tempPath - the staged replacement.
	*/
	static async replaceOverWrite(destPath, tempPath) {
		await rename(tempPath, destPath);
	}
	/** 9P files inherit their directory's DACL; nothing to preserve. */
	static async skipDaclCopy() {}
	/** Translate a model/plugin path into coordinates the host Node process can open. */
	translate(path, cwd) {
		if (this.nativeLinux) {
			const base = this.nativeCwd(cwd);
			const unc = parseWslUnc(path);
			if (unc !== null) return {
				input: this.nativeUncPath(unc.distro, unc.linuxPath),
				cwd: base
			};
			const mounted = windowsToMntPath(path);
			if (mounted !== null) return {
				input: mounted,
				cwd: base
			};
			if (/^[A-Za-z]:/.test(path) || path.startsWith("\\\\")) throw new FsError(`wsl-fs: path "${path}" is not an absolute WSL path`, "FS_IO_ERROR");
			return {
				input: path,
				cwd: base
			};
		}
		const unc = parseWslUnc(path);
		if (unc !== null) return {
			input: joinUnc(unc.distro, unc.linuxPath),
			cwd: this.cwdOr(cwd)
		};
		if (isAbsoluteLinuxPath(path)) {
			const win = mntToWindowsPath(path);
			if (win !== null) return {
				input: win,
				cwd: this.cwdOr(cwd)
			};
			return {
				input: joinUnc(this.distroFor(cwd), path),
				cwd: this.cwdOr(cwd)
			};
		}
		if (windowsToMntPath(path) !== null) return {
			input: path,
			cwd: this.cwdOr(cwd)
		};
		return {
			input: path,
			cwd: this.uncCwd(cwd)
		};
	}
	/** Resolve one UNC coordinate only when it names this Linux host's distribution. */
	nativeUncPath(distro, linuxPath) {
		const hostDistro = process.env.WSL_DISTRO_NAME;
		if (hostDistro === void 0 || hostDistro.toLowerCase() !== distro.toLowerCase()) throw new FsError(`wsl-fs: distribution "${distro}" is not the local WSL distribution`, "FS_IO_ERROR");
		return linuxPath;
	}
	/** Convert the session cwd into the local Linux filesystem's coordinates. */
	nativeCwd(cwd) {
		const base = cwd ?? this.config.cwd ?? process.cwd();
		const unc = parseWslUnc(base);
		if (unc !== null) return this.nativeUncPath(unc.distro, unc.linuxPath);
		const mounted = windowsToMntPath(base);
		if (mounted !== null) return mounted;
		if (isAbsoluteLinuxPath(base)) return base;
		throw new FsError(`wsl-fs: cwd "${base}" is not an absolute WSL path`, "FS_IO_ERROR");
	}
	/** A base for absolute inputs (unused by resolution, but the parent needs one). */
	cwdOr(cwd) {
		return cwd ?? this.config.cwd ?? process.cwd();
	}
	uncCwd(cwd) {
		const base = cwd ?? this.config.cwd;
		if (base === void 0 || base === "") throw new FsError("wsl-fs: no cwd and no configured base for relative resolution", "FS_IO_ERROR");
		const unc = parseWslUnc(base);
		if (unc !== null) return joinUnc(unc.distro, unc.linuxPath);
		if (isAbsoluteLinuxPath(base)) return joinUnc(this.distroFor(base), base);
		if (windowsToMntPath(base) !== null) return base;
		throw new FsError(`wsl-fs: cwd "${base}" is not in the WSL execution world`, "FS_IO_ERROR");
	}
	distroFor(cwd) {
		const fromCwd = parseWslUnc(cwd ?? "");
		if (fromCwd !== null) return fromCwd.distro;
		const distro = this.distro;
		if (distro === void 0 || distro === "") throw new FsError("wsl-fs: Linux path carries no distribution and none is configured", "FS_IO_ERROR");
		return distro;
	}
	/** The Linux display path for a resolved host-native path. */
	linuxDisplay(raw) {
		if (this.nativeLinux && isAbsoluteLinuxPath(raw)) return raw;
		const unc = parseWslUnc(raw);
		if (unc !== null) return unc.linuxPath;
		const mnt = windowsToMntPath(raw);
		if (mnt !== null) return mnt;
		throw new FsError(`wsl-fs: resolved path "${raw}" is outside the WSL execution world`, "FS_IO_ERROR");
	}
	async resolve(path, opts) {
		if (opts?.signal?.aborted) throw new FsError("resolve aborted", "FS_ABORTED");
		const { input, cwd } = this.translate(path, opts?.cwd);
		const local = await super.resolve(input, {
			cwd,
			...opts?.signal !== void 0 ? { signal: opts.signal } : {}
		});
		return {
			targetKey: local.targetKey,
			displayPath: this.linuxDisplay(String(local.displayPath))
		};
	}
	processPath(target) {
		const key = String(target.targetKey);
		if (this.nativeLinux && isAbsoluteLinuxPath(key)) return key;
		const unc = parseWslUnc(key);
		if (unc !== null) return unc.linuxPath;
		const mnt = windowsToMntPath(key);
		if (mnt !== null) return mnt;
		throw new FsError(`wsl-fs: target "${target.displayPath}" is outside the WSL execution world`, "FS_IO_ERROR");
	}
	fileUrl(target) {
		return `file://${this.processPath(target).split("/").map(encodeURIComponent).join("/")}`;
	}
	contains(parent, child) {
		if (this.nativeLinux) return super.contains(parent, child);
		const parentWorld = this.worldPath(parent);
		const childWorld = this.worldPath(child);
		if (parentWorld.distro !== childWorld.distro) return false;
		const parentPath = parentWorld.linuxPath;
		const childPath = childWorld.linuxPath;
		if (childPath === parentPath) return true;
		return parentPath === "/" ? true : childPath.startsWith(`${parentPath}/`);
	}
	/** One target's (distro, linuxPath) pair for containment; `undefined` distro = Windows world. */
	worldPath(target) {
		const key = String(target.targetKey);
		const unc = parseWslUnc(key);
		if (unc !== null) return {
			distro: unc.distro,
			linuxPath: unc.linuxPath
		};
		const mnt = windowsToMntPath(key);
		if (mnt !== null) return {
			distro: void 0,
			linuxPath: mnt
		};
		throw new FsError(`wsl-fs: target "${target.displayPath}" is outside the WSL execution world`, "FS_IO_ERROR");
	}
	async lstat(path, opts, signal) {
		if (signal?.aborted) throw new FsError("lstat aborted", "FS_ABORTED");
		if (path.trim().length === 0) throw new FsError("file_path must be a non-empty string", "FS_NOT_FOUND");
		const { input, cwd } = this.translate(path, opts?.cwd);
		return super.lstat(input, { cwd }, signal);
	}
};
//#endregion
export { WslFileSystem, WslFileSystem as default };

//# sourceMappingURL=fs.js.map