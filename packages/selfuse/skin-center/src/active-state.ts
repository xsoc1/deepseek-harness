/**
 * Active-skin selection persistence (issue #506): a tiny JSON document under
 * $DSH_HOME written by POST /api/skin-center/v2/active and read on every
 * index.html response by the tapIndex adapter. Kept dependency-free and
 * synchronous: the tap runs per response and must never await.
 * @module @linxin666/dsh-client-ui-skin-center/active-state
 */

import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'

import { userSkinsDir } from './skin-repo.ts'

/**
 * Locate the active-selection document beside the user skin directory.
 * @returns absolute path to skin-center-active.json without creating it.
 */
export function defaultActiveStatePath(): string {
  return join(userSkinsDir(), '..', 'skin-center-active.json')
}

/**
 * Read the persisted active skin id; malformed or unreadable files use the stock look.
 * @param path - selection document to read synchronously.
 * @returns persisted string id, or null when absent, malformed or unreadable.
 */
export function readActiveSelection(path: string): string | null {
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as { active?: unknown }
    return typeof parsed.active === 'string' ? parsed.active : null
  } catch {
    return null
  }
}

/**
 * Atomically replace the selection document, creating its parent directory.
 * Filesystem errors propagate; the sibling temporary directory is always removed.
 * @param path - destination JSON document.
 * @param id - selected skin id, or null to restore the stock look.
 */
export function writeActiveSelection(path: string, id: string | null): void {
  const dir = dirname(path)
  mkdirSync(dir, { recursive: true })
  // Atomic replace (issue #678): write a sibling temp file then rename over
  // the target, so a crash mid-write can never leave a half-written JSON that
  // readActiveSelection would silently discard. The temp dir is cleaned up on
  // both success and failure.
  const tmpDir = mkdtempSync(join(dir, `${basename(path)}.tmp-`))
  const tmp = join(tmpDir, basename(path))
  try {
    writeFileSync(tmp, JSON.stringify({ active: id }, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' })
    renameSync(tmp, path)
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
}
