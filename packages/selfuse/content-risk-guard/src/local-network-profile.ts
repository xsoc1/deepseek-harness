import { createHash, randomBytes } from 'node:crypto'
import { constants } from 'node:fs'
import { lstat, mkdir, open } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'
import { withFileLock, writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { isMap, parseDocument } from 'yaml'
import { summarizeRiskContent, type SafeNetworkFacts } from './sanitizer.js'

const ID_PATTERN = /^[a-z][a-z0-9_-]{0,31}$/i
const HANDLE_PATTERN = /^[a-f0-9]{32}$/

/** One explicitly configured local profile; its path is never model-visible. */
export interface LocalNetworkProfile {
  /** Non-secret alias exposed to the model for this allowlisted profile. */
  id: string
  /** Absolute local YAML path kept out of model-visible responses. */
  path: string
}

/** Constrained edits whose arguments cannot carry network endpoints or credentials. */
export type NetworkProfileChange =
  | { operation: 'set-tun-enabled' | 'set-dns-enabled'; enabled: boolean }
  | { operation: 'set-mode'; mode: 'rule' | 'global' | 'direct' }

/** Metadata returned to the model without profile text, path, names, or credentials. */
export interface NetworkProfileOutcome {
  changed: boolean
  sha256: string
  facts: SafeNetworkFacts
  backupHandle?: string
}

function digest(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

function parseProfile(text: string) {
  const document = parseDocument(text, { strict: true, uniqueKeys: true, merge: false })
  if (document.errors.length > 0 || !isMap(document.contents)) {
    throw new Error('local network profile is not a valid YAML mapping')
  }
  return document
}

async function readRegularFile(path: string, maxBytes: number, privateFile: boolean): Promise<string> {
  const before = await lstat(path)
  if (!before.isFile() || before.isSymbolicLink() || before.size > maxBytes
    || privateFile && ((before.mode & 0o077) !== 0
      || process.getuid !== undefined && before.uid !== process.getuid())) {
    throw new Error('local network profile file is unavailable or unsafe')
  }
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW)
  try {
    const opened = await file.stat()
    if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino || opened.size > maxBytes) {
      throw new Error('local network profile changed during read')
    }
    const text = await file.readFile({ encoding: 'utf8' })
    if (Buffer.byteLength(text, 'utf8') > maxBytes) throw new Error('local network profile exceeds size limit')
    return text
  } finally {
    await file.close()
  }
}

/** Local-only profile executor. It never returns raw YAML or configured paths. */
export class LocalNetworkProfileExecutor {
  private readonly profiles = new Map<string, string>()

  constructor(profiles: LocalNetworkProfile[], private readonly privateRoot: string, private readonly maxBytes: number) {
    for (const profile of profiles) {
      if (!ID_PATTERN.test(profile.id) || !isAbsolute(profile.path) || this.profiles.has(profile.id)) {
        throw new Error('content-risk-guard: profile ids must be unique and paths must be absolute')
      }
      this.profiles.set(profile.id, profile.path)
    }
  }

  /** Return only non-secret aliases configured by the local owner.
   * @returns configured profile aliases, without filesystem paths.
   */
  list(): string[] {
    return [...this.profiles.keys()]
  }

  /** Recognize a direct tool reference to one allowlisted file without exposing its path.
   * @param argumentsValue tool arguments to inspect for an exact configured path.
   * @returns whether an allowlisted profile path appears in those arguments.
   */
  referencesConfiguredPath(argumentsValue: unknown): boolean {
    if (this.profiles.size === 0) return false
    const serialized = JSON.stringify(argumentsValue)
    return [...this.profiles.values()].some(path => serialized.includes(path))
  }

  private pathFor(id: string): string {
    const path = this.profiles.get(id)
    if (path === undefined) throw new Error('local network profile id is not configured')
    return path
  }

  private outcome(text: string, changed: boolean, backupHandle?: string): NetworkProfileOutcome {
    return {
      changed,
      sha256: digest(text),
      facts: summarizeRiskContent(text),
      ...backupHandle === undefined ? {} : { backupHandle },
    }
  }

  /** Inspect one allowlisted YAML file without revealing its values.
   * @param id non-secret alias configured by the local owner.
   * @returns a digest and bounded, non-identifying facts.
   */
  async inspect(id: string): Promise<NetworkProfileOutcome> {
    const text = await readRegularFile(this.pathFor(id), this.maxBytes, false)
    parseProfile(text)
    return this.outcome(text, false)
  }

  private async backup(id: string, raw: string): Promise<string> {
    const root = join(this.privateRoot, 'profile-backups')
    await mkdir(root, { recursive: true, mode: 0o700 })
    const parent = await lstat(this.privateRoot)
    const info = await lstat(root)
    if (!parent.isDirectory() || parent.isSymbolicLink() || (parent.mode & 0o077) !== 0
      || process.getuid !== undefined && parent.uid !== process.getuid()
      || !info.isDirectory() || info.isSymbolicLink() || (info.mode & 0o077) !== 0
      || process.getuid !== undefined && info.uid !== process.getuid()) {
      throw new Error('local network backup directory is not private')
    }
    const record = JSON.stringify({ profileId: id, raw })
    if (Buffer.byteLength(record, 'utf8') > this.maxBytes) throw new Error('local network backup exceeds size limit')
    const handle = randomBytes(16).toString('hex')
    await writeFileAtomic(join(root, `${handle}.json`), record, { mode: 0o600, dirMode: 0o700 })
    return handle
  }

  /** Apply an approved non-secret edit after backing up the complete original.
   * @param id alias of the allowlisted YAML file.
   * @param change constrained edit approved by the human-approval channel.
   * @returns facts about the resulting file and a rollback handle when changed.
   */
  async apply(id: string, change: NetworkProfileChange): Promise<NetworkProfileOutcome> {
    const path = this.pathFor(id)
    return withFileLock(path, async () => {
      const original = await readRegularFile(path, this.maxBytes, false)
      const document = parseProfile(original)
      if (change.operation === 'set-mode') {
        document.set('mode', change.mode)
      } else if (change.operation === 'set-tun-enabled') {
        document.setIn(['tun', 'enable'], change.enabled)
      } else {
        document.setIn(['dns', 'enable'], change.enabled)
      }
      const updated = String(document)
      parseProfile(updated)
      if (Buffer.byteLength(updated, 'utf8') > this.maxBytes) throw new Error('local network profile exceeds size limit')
      if (updated === original) return this.outcome(original, false)
      const backupHandle = await this.backup(id, original)
      await writeFileAtomic(path, updated, { mode: 0o600 })
      return this.outcome(updated, true, backupHandle)
    })
  }

  /** Restore an approved backup belonging to the same configured profile.
   * @param id alias of the allowlisted YAML file.
   * @param handle opaque handle for a backup belonging to that profile.
   * @returns facts about the restored file and a backup of the replaced state when changed.
   */
  async restore(id: string, handle: string): Promise<NetworkProfileOutcome> {
    if (!HANDLE_PATTERN.test(handle)) throw new Error('invalid local network backup handle')
    const path = this.pathFor(id)
    return withFileLock(path, async () => {
      const recordText = await readRegularFile(join(this.privateRoot, 'profile-backups', `${handle}.json`),
        this.maxBytes, true)
      let record: unknown
      try {
        record = JSON.parse(recordText) as unknown
      } catch {
        throw new Error('local network backup is invalid')
      }
      if (record === null || typeof record !== 'object' || !('profileId' in record) || !('raw' in record)
        || record.profileId !== id || typeof record.raw !== 'string') {
        throw new Error('local network backup does not belong to this profile')
      }
      parseProfile(record.raw)
      const current = await readRegularFile(path, this.maxBytes, false)
      if (current === record.raw) return this.outcome(current, false)
      const backupHandle = await this.backup(id, current)
      await writeFileAtomic(path, record.raw, { mode: 0o600 })
      return this.outcome(record.raw, true, backupHandle)
    })
  }
}
