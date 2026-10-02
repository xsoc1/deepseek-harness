/** Browser-safe response fields shared by the backup Host and settings tab. */

/** Archive name and optional measured file size. */
export interface BackupEntry { name: string
  size: number | null }
/** Settings-tab overview without archive contents. */
export interface BackupStatus {
  destination: string
  dshHome: string
  keepDefault: number
  autoHours: number
  lastAuto: string | null
  downloadAvailable: boolean
  backups: BackupEntry[]
}
/** User-facing completion or failure
  no archive contents are returned. */
export interface BackupSummaryResult { ok: boolean
  summary: string }
/** New archive metadata. */
export interface BackupResult extends BackupSummaryResult {
  path: string
  sha: string
  stale: number
  keep: number
}
/** One checksum comparison. */
export interface VerifyEntry { name: string
  ok: boolean
  note: string }
/** Aggregate checksum comparison. */
export interface VerifyResult extends BackupSummaryResult { results: VerifyEntry[] }
/** Restore preview, completion or failure. */
export interface RestoreResult extends BackupSummaryResult {
  dryRun: boolean
  archive?: string
  files?: number
  sample?: string[]
  aside?: string | null
  snapshotPath?: string | null
}
/** Configured schedule returned even when an update is rejected. */
export interface AutoResult extends BackupSummaryResult { hours: number }
/** Sync destination and credential presence, never the credential value. */
export interface GithubStatus {
  repoRaw: string | null
  repo: string | null
  tokenSet: boolean
  syncDir: string
  lastPush: string | null
  lastError: string | null
}
/** Push result and skipped over-limit archives. */
export interface GithubResult extends BackupSummaryResult { pushed: boolean
  tooBig: string[] }
/** Configured repository returned even when an update is rejected. */
export interface RepoResult extends BackupSummaryResult { repo: string | null }
/** Async operations exposed to the settings tab
  cancellation is Host-owned. */
export interface BackupPanelOps {
  status(this: void): Promise<BackupStatus>
  backup(this: void, keep?: number, signal?: AbortSignal): Promise<BackupResult>
  verify(this: void, selector?: string, signal?: AbortSignal): Promise<VerifyResult>
  restore(this: void, selector?: string, dryRun?: boolean, signal?: AbortSignal): Promise<RestoreResult>
  setAuto(this: void, hours: number): Promise<AutoResult>
  githubStatus(this: void, ): Promise<GithubStatus>
  githubSyncNow(this: void, signal?: AbortSignal): Promise<GithubResult>
  remove(this: void, selector?: string, signal?: AbortSignal): Promise<BackupSummaryResult>
  setGithubRepo(this: void, repo?: string): Promise<RepoResult>
}
