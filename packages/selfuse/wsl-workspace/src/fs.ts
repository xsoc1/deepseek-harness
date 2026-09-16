/**
 * WSL Service Provider for the `ctx.fs` capability seam. Backed by the host
 * filesystem. On a Windows host it opens the `\\wsl.localhost\<distro>\…`
 * 9P share; inside WSL it opens native Linux paths. Every model/UI-facing
 * path remains the Linux path a WSL process would open (`processPath`,
 * `displayPath`, `fileUrl`). `LocalFileSystem` supplies realpath identity,
 * guarded writes, per-target locks, and version checks in both hosts.
 *
 * Both UNC paths and Linux absolute paths resolve; Windows drive paths
 * resolve through their `/mnt/<drive>` form, so a WSL-composed session can
 * still touch the Windows filesystem coherently.
 * @module @dsh-selfuse/wsl-workspace/fs
 */

import { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { link, lstat, rename } from 'node:fs/promises'
import { FsError } from '@deepseek-ai/dsh-fs'
import type { FsPathInfo, FsTarget } from '@deepseek-ai/dsh-fs'
import { LocalFileSystem } from '@deepseek-ai/dsh-fs-local'
import {
  isAbsoluteLinuxPath,
  joinUnc,
  mntToWindowsPath,
  parseWslUnc,
  windowsToMntPath,
} from './shared/paths.ts'

/** Plugin config. `cwd`/`distro` are optional because UNC workdirs carry both. */
export interface Config {
  /** Base directory for relative paths without a per-call cwd (UNC or Linux). */
  cwd?: string
  /** Default distribution for Linux-absolute paths without a UNC cwd. */
  distro?: string
  /** Exclusive UTF-8 byte limit on each overwrite-diff side (see fs-local). */
  diffBasisMaxBytes?: number
}

/** One translated coordinate: the input the local backend opens plus its cwd. */
interface Translated {
  /** Path to hand to the host-local backend (UNC, Windows drive, or Linux). */
  input: string
  /** Absolute base for relative inputs in the host's native coordinates. */
  cwd: string
}

/**
 * The WSL filesystem backend. Identity keys are host-native realpaths; the
 * Linux display form stays stable across Windows and WSL hosts.
 */
export class WslFileSystem extends LocalFileSystem {
  static override Config: z<Config> = z.object({
    cwd: z.string(),
    distro: z.string(),
    diffBasisMaxBytes: z.number().default(10 * 1024 * 1024),
  })

  private readonly distro: string | undefined
  private readonly nativeLinux = process.platform === 'linux'

  constructor(ctx: Context, config: Config) {
    // schemastery fills the defaults before construction; the parent validates
    // `diffBasisMaxBytes` and stores the resolved shape.
    super(ctx, config)
    this.distro = config.distro
    // Windows opens the 9P share; Linux uses the parent's native publication.
    if (!this.nativeLinux) {
      this.internals = {
        linkFile: WslFileSystem.publishNoReplace,
        replaceFile: WslFileSystem.replaceOverWrite,
        copyFileDacl: WslFileSystem.skipDaclCopy,
      }
    }
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
  private static async publishNoReplace(tempPath: string, destPath: string): Promise<void> {
    try {
      await link(tempPath, destPath)
      return
    } catch (error) {
      let exists = false
      try {
        await lstat(destPath)
        exists = true
      } catch {
        // Absent destination: rename publishes the staged file.
      }
      if (exists) throw error
      await rename(tempPath, destPath)
    }
  }

  /**
   * Security-preserving replacement boundary: Windows rename replaces an
   * existing destination atomically; no DACL preservation is needed over 9P.
   * @param destPath - the file being replaced.
   * @param tempPath - the staged replacement.
   */
  private static async replaceOverWrite(destPath: string, tempPath: string): Promise<void> {
    await rename(tempPath, destPath)
  }

  /** 9P files inherit their directory's DACL; nothing to preserve. */
  private static async skipDaclCopy(): Promise<void> {}

  /** Translate a model/plugin path into coordinates the host Node process can open. */
  private translate(path: string, cwd?: string): Translated {
    if (this.nativeLinux) {
      const base = this.nativeCwd(cwd)
      const unc = parseWslUnc(path)
      if (unc !== null) return { input: this.nativeUncPath(unc.distro, unc.linuxPath), cwd: base }
      const mounted = windowsToMntPath(path)
      if (mounted !== null) return { input: mounted, cwd: base }
      if (/^[A-Za-z]:/.test(path) || path.startsWith('\\\\')) {
        throw new FsError(`wsl-fs: path "${path}" is not an absolute WSL path`, 'FS_IO_ERROR')
      }
      return { input: path, cwd: base }
    }
    const unc = parseWslUnc(path)
    if (unc !== null) {
      return { input: joinUnc(unc.distro, unc.linuxPath), cwd: this.cwdOr(cwd) }
    }
    if (isAbsoluteLinuxPath(path)) {
      // /mnt/<drive>/… names the Windows filesystem inside the Linux world
      // (the dual-access path for migration): open the drive path directly so
      // both worlds stay coherent — the display stays the /mnt form.
      const win = mntToWindowsPath(path)
      if (win !== null) return { input: win, cwd: this.cwdOr(cwd) }
      return { input: joinUnc(this.distroFor(cwd), path), cwd: this.cwdOr(cwd) }
    }
    if (windowsToMntPath(path) !== null) {
      // Windows drive paths open directly; the Linux world reaches them via /mnt.
      return { input: path, cwd: this.cwdOr(cwd) }
    }
    // Relative: resolve against the caller cwd (or the configured base).
    const base = this.uncCwd(cwd)
    return { input: path, cwd: base }
  }

  /** Resolve one UNC coordinate only when it names this Linux host's distribution. */
  private nativeUncPath(distro: string, linuxPath: string): string {
    const hostDistro = process.env.WSL_DISTRO_NAME
    if (hostDistro === undefined || hostDistro.toLowerCase() !== distro.toLowerCase()) {
      throw new FsError(`wsl-fs: distribution "${distro}" is not the local WSL distribution`, 'FS_IO_ERROR')
    }
    return linuxPath
  }

  /** Convert the session cwd into the local Linux filesystem's coordinates. */
  private nativeCwd(cwd?: string): string {
    const base = cwd ?? this.config.cwd ?? process.cwd()
    const unc = parseWslUnc(base)
    if (unc !== null) return this.nativeUncPath(unc.distro, unc.linuxPath)
    const mounted = windowsToMntPath(base)
    if (mounted !== null) return mounted
    if (isAbsoluteLinuxPath(base)) return base
    throw new FsError(`wsl-fs: cwd "${base}" is not an absolute WSL path`, 'FS_IO_ERROR')
  }

  /** A base for absolute inputs (unused by resolution, but the parent needs one). */
  private cwdOr(cwd?: string): string {
    return cwd ?? this.config.cwd ?? process.cwd()
  }

  private uncCwd(cwd?: string): string {
    const base = cwd ?? this.config.cwd
    if (base === undefined || base === '') {
      throw new FsError('wsl-fs: no cwd and no configured base for relative resolution', 'FS_IO_ERROR')
    }
    const unc = parseWslUnc(base)
    if (unc !== null) return joinUnc(unc.distro, unc.linuxPath)
    if (isAbsoluteLinuxPath(base)) return joinUnc(this.distroFor(base), base)
    if (windowsToMntPath(base) !== null) return base
    throw new FsError(`wsl-fs: cwd "${base}" is not in the WSL execution world`, 'FS_IO_ERROR')
  }

  private distroFor(cwd?: string): string {
    const fromCwd = parseWslUnc(cwd ?? '')
    if (fromCwd !== null) return fromCwd.distro
    const distro = this.distro
    if (distro === undefined || distro === '') {
      throw new FsError('wsl-fs: Linux path carries no distribution and none is configured', 'FS_IO_ERROR')
    }
    return distro
  }

  /** The Linux display path for a resolved host-native path. */
  private linuxDisplay(raw: string): string {
    if (this.nativeLinux && isAbsoluteLinuxPath(raw)) return raw
    const unc = parseWslUnc(raw)
    if (unc !== null) return unc.linuxPath
    const mnt = windowsToMntPath(raw)
    if (mnt !== null) return mnt
    throw new FsError(`wsl-fs: resolved path "${raw}" is outside the WSL execution world`, 'FS_IO_ERROR')
  }

  override async resolve(path: string, opts?: { cwd?: string; signal?: AbortSignal }): Promise<FsTarget> {
    if (opts?.signal?.aborted) throw new FsError('resolve aborted', 'FS_ABORTED')
    const { input, cwd } = this.translate(path, opts?.cwd)
    const local = await super.resolve(input, {
      cwd,
      ...opts?.signal !== undefined ? { signal: opts.signal } : {},
    })
    return { targetKey: local.targetKey, displayPath: this.linuxDisplay(String(local.displayPath)) }
  }

  override processPath(target: FsTarget): string {
    const key = String(target.targetKey)
    if (this.nativeLinux && isAbsoluteLinuxPath(key)) return key
    const unc = parseWslUnc(key)
    if (unc !== null) return unc.linuxPath
    const mnt = windowsToMntPath(key)
    if (mnt !== null) return mnt
    throw new FsError(`wsl-fs: target "${target.displayPath}" is outside the WSL execution world`, 'FS_IO_ERROR')
  }

  override fileUrl(target: FsTarget): string {
    const linux = this.processPath(target)
    const encoded = linux.split('/').map(encodeURIComponent).join('/')
    return `file://${encoded}`
  }

  override contains(parent: FsTarget, child: FsTarget): boolean {
    if (this.nativeLinux) return super.contains(parent, child)
    const parentWorld = this.worldPath(parent)
    const childWorld = this.worldPath(child)
    if (parentWorld.distro !== childWorld.distro) return false
    const parentPath = parentWorld.linuxPath
    const childPath = childWorld.linuxPath
    if (childPath === parentPath) return true
    return parentPath === '/' ? true : childPath.startsWith(`${parentPath}/`)
  }

  /** One target's (distro, linuxPath) pair for containment; `undefined` distro = Windows world. */
  private worldPath(target: FsTarget): { distro: string | undefined; linuxPath: string } {
    const key = String(target.targetKey)
    const unc = parseWslUnc(key)
    if (unc !== null) return { distro: unc.distro, linuxPath: unc.linuxPath }
    const mnt = windowsToMntPath(key)
    if (mnt !== null) return { distro: undefined, linuxPath: mnt }
    throw new FsError(`wsl-fs: target "${target.displayPath}" is outside the WSL execution world`, 'FS_IO_ERROR')
  }

  override async lstat(path: string, opts?: { cwd?: string }, signal?: AbortSignal): Promise<FsPathInfo | undefined> {
    if (signal?.aborted) throw new FsError('lstat aborted', 'FS_ABORTED')
    if (path.trim().length === 0) throw new FsError('file_path must be a non-empty string', 'FS_NOT_FOUND')
    const { input, cwd } = this.translate(path, opts?.cwd)
    return super.lstat(input, { cwd }, signal)
  }
}

export default WslFileSystem
