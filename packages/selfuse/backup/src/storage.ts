/** Literal, abortable filesystem operations for plugin-owned backup files. */
import { lstat, rename, unlink } from 'node:fs/promises'
import { join } from 'node:path'

function basenameOnly(name: string): void {
  if (!name || name === '.' || name === '..' || /[/\\:\0]/.test(name)) {
    throw new Error('Backup file operation requires a basename')
  }
}

async function realDirectory(dir: string): Promise<void> {
  const entry = await lstat(dir)
  if (entry.isSymbolicLink()) throw new Error('Backup file operation rejects a symlink root')
  if (!entry.isDirectory()) throw new Error('Backup root is not a directory')
}

/**
 * Unlink exact files, never invoking a shell or removing directories recursively.
 * @param names - basenames validated as a batch before deleting any file.
 * @param dir - existing, non-symlink containing directory.
 * @param signal - optional cancellation checked before each unlink.
 * @returns Completion; absent files are tolerated, other filesystem errors propagate.
 */
export async function removeFiles(names: readonly string[], dir: string, signal?: AbortSignal): Promise<void> {
  for (const name of names) basenameOnly(name)
  signal?.throwIfAborted()
  await realDirectory(dir)
  for (const name of names) {
    signal?.throwIfAborted()
    try { await unlink(join(dir, name)) }
    catch (error) { if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error }
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
export async function renameBeside(dir: string, srcName: string, dstName: string, signal?: AbortSignal): Promise<void> {
  basenameOnly(srcName)
  basenameOnly(dstName)
  signal?.throwIfAborted()
  await realDirectory(dir)
  if ((await lstat(join(dir, srcName))).isSymbolicLink()) throw new Error('Restore source is a symlink')
  let exists = true
  try { await lstat(join(dir, dstName)) }
  catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') exists = false
    else throw error
  }
  if (exists) throw new Error('Restore aside destination already exists')
  signal?.throwIfAborted()
  await rename(join(dir, srcName), join(dir, dstName))
}

/**
 * Reject lexical tar paths outside the expected data directory.
 * @param entries - names emitted by the archive listing.
 * @param base - expected data-root basename.
 * @returns Nothing when names are valid; does not validate archive link metadata.
 */
export function validateArchiveEntries(entries: readonly string[], base: string): void {
  basenameOnly(base)
  if (!entries.length) throw new Error('Archive contains no entries')
  for (const entry of entries) {
    if ((entry !== base && !entry.startsWith(`${base}/`)) || /[\\:\0]/.test(entry)
      || entry.split('/').some(part => part === '..')) {
      throw new Error('Archive contains a path outside the backup data root')
    }
  }
}
