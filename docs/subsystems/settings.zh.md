# 插件配置表单

[English](settings.md) | 中文

[设置服务](../../packages/settings/settings/README.zh.md) 从活动 profile 条目投影 volatile Config 字段。[配置编辑器](../../packages/boot/config-editor/README.zh.md) 通过 Cordis patch 持久化编辑。业务消费者对自己的 Config 引用调用 `.get()`。

## 标识与值

表单命名空间是当前 profile 中可唯一定位条目的本地 id。多个插件实例在条目 id 不同时拥有独立表单。普通字段被排除。描述符包含实际值、继承值、显式 profile 覆盖值和乐观修订号。

## 编辑

`update` 合并提交的字段。`replace` 先将即时字段重置为继承配置，再应用提交的字段。`mutate` 操作独立路径，保留客户端响应中未包含的秘密值。每次写入都会验证完整 Config，并在持久化前拒绝过期修订号。

`settings/document-updated` 在 Loader 配置变化后使表单描述符失效。这是 UI 通知；消费者仅在需要刷新注册信息时使用 `loader/volatile-update`。

<!-- BEGIN GENERATED cordis-surface (gen-cordis-catalog.ts) — do not edit between markers -->

<a id="cordis-surface"></a>

## Cordis API

Generated from source by `scripts/gen-cordis-catalog.ts` (verified fresh by `pnpm run verify-cordis-catalog` in doc-sync; regenerate with `pnpm run gen-cordis-catalog`) — the language sides differ only in locale-specific paired document paths. Signature blocks use a `ts cordis-catalog` fence and keep the original source JSDoc; dispatch modes are defined in the [primer](../cordis-primer.zh.md#dispatch-modes), and the framework-inherited `ctx` API lives in [cordis-api/inherited.md](../cordis-api/inherited.md).

<a id="ctxbackuppanel--backuppanelservice"></a>

### `ctx.backupPanel` — `BackupPanelService`

`backupPanel` 宿主服务：Settings 标签页的 RPC 面。方法签名与描述符的 parameters 顺序一致（取消型方法末位是 signal），实现全部委托 ops 闭包， 与 `/backup` 命令、`backup_dsh` 工具共用同一套核心操作。

```ts cordis-catalog
/** Read the current archive and schedule overview.
 * @returns Status without archive contents or credentials.
 */
status(): Promise<BackupStatus>

/** Create an archive and apply retention.
 * @param keep - Optional retention override.
 * @param signal - Optional cancellation for subprocess and filesystem work.
 * @returns Archive metadata or an operation failure.
 */
backup(keep?: number, signal?: AbortSignal): Promise<BackupResult>

/** Verify archive checksum sidecars.
 * @param selector - Archive prefix, all or latest; defaults to latest.
 * @param signal - Optional cancellation.
 * @returns Per-archive verification results.
 */
verify(selector?: string, signal?: AbortSignal): Promise<VerifyResult>

/** Preview or replace the local data root from a verified archive.
 * @param selector - Unique archive name or prefix; defaults to latest.
 * @param dryRun - True previews without writing; false performs restoration.
 * @param signal - Optional cancellation; existing aside data is retained.
 * @returns Preview or restoration metadata, or a failure.
 */
restore(selector?: string, dryRun?: boolean, signal?: AbortSignal): Promise<RestoreResult>

/** Persist a schedule and replace this instance's timer.
 * @param hours - Integer interval from 1 to 720, or zero to disable.
 * @returns Accepted or rejected update with the effective interval.
 */
setAuto(hours: number): Promise<AutoResult>

/** Read the selected remote and last synchronization outcome.
 * @returns Status and credential presence, never a token value.
 */
githubStatus(): Promise<GithubStatus>

/** Synchronize archives to the configured dedicated Git remote.
 * @param signal - Optional cancellation.
 * @returns Push outcome and any skipped large filenames.
 */
githubSyncNow(signal?: AbortSignal): Promise<GithubResult>

/** Unlink one selected archive and its checksum sidecar.
 * @param selector - Unique name or prefix; defaults to latest.
 * @param signal - Optional cancellation checked before each unlink.
 * @returns Deletion summary or a failure.
 */
deleteBackup(selector?: string, signal?: AbortSignal): Promise<BackupSummaryResult>

/** Persist a remote override without performing a push.
 * @param repo - Repository path or URL; empty/off clears the override.
 * @returns Accepted or rejected update with the effective override.
 */
setGithubRepo(repo?: string): Promise<RepoResult>
```

Source: [`packages/selfuse/backup/src/index.ts`](../../packages/selfuse/backup/src/index.ts)

<a id="ctxmemorypanel--memorypanelservice"></a>

### `ctx.memoryPanel` — `MemoryPanelService`

Local Markdown access; only the settings tab consumes this service.

```ts cordis-catalog
/** Read directory counts and bytes.
 * @param signal - Optional cancellation.
 * @returns Metadata without file content.
 */
status(signal?: AbortSignal): Promise<MemoryPanelStatus>

/** List permitted knowledge files.
 * @param signal - Optional cancellation.
 * @returns File names and sizes; IO failures reject.
 */
pages(signal?: AbortSignal): Promise<MemoryPanelPages>

/** Read one knowledge page.
 * @param id - Restricted basename without extension.
 * @param signal - Optional cancellation.
 * @returns Complete bounded UTF-8 content; invalid ids and links reject.
 */
page(id: string, signal?: AbortSignal): Promise<MemoryPanelPage>

/** List a page of notes in descending modification-time order.
 * @param limit - Integer from 1 to 500.
 * @param offset - Integer from 0 to 100000.
 * @param signal - Optional cancellation.
 * @returns Note metadata and total count.
 */
notes(limit: number, offset: number, signal?: AbortSignal): Promise<MemoryPanelNotes>

/** Read one note.
 * @param id - Restricted basename without extension.
 * @param signal - Optional cancellation.
 * @returns Complete bounded UTF-8 content; invalid ids and links reject.
 */
note(id: string, signal?: AbortSignal): Promise<MemoryPanelNote>

/** Search both collections by case-insensitive substring.
 * @param query - At most 1024 characters; empty returns no matches.
 * @param signal - Optional cancellation.
 * @returns Bounded snippets; unreadable or oversized files reject.
 */
search(query: string, signal?: AbortSignal): Promise<MemoryPanelSearch>

/** Create a uniquely named note without overwriting an existing file.
 * @param title - Optional one-line title represented by an empty string.
 * @param text - Non-empty note body.
 * @param signal - Optional cancellation before the write commits.
 * @returns The saved note id and actual configured path.
 */
saveNote(title: string, text: string, signal?: AbortSignal): Promise<MemoryPanelSaved>
```

Source: [`packages/selfuse/memory-panel/src/index.ts`](../../packages/selfuse/memory-panel/src/index.ts)

<a id="ctxsettings--settingsforms"></a>

### `ctx.settings` — `SettingsForms`

Project Config schemas into forms and own optional instance-level UI policy.

```ts cordis-catalog
/** Register the calling plugin instance's page policy without changing its Config.
 * @param presentation Automatic-page policy for this instance; `auto` defaults to true.
 * @param owner Plugin instance the policy belongs to; defaults to the calling fiber.
 * @returns Disposer; register it with the calling plugin's effects.
 * @throws If this instance already has a registered policy.
 */
configure(presentation: { auto?: boolean }, owner: Fiber = this.ctx.fiber): () => void

/** Locate the profile patch for native editing.
 * @returns The existing profile patch path.
 */
prepareDocument(): Promise<string>

/** Read active plugin schemas and their live values.
 * @param options Redaction required for remote callers.
 * @returns Forms keyed by unique profile entry ids.
 */
describe(options?: SettingsDescribeOptions): SettingsDescriptor[]

/** Merge editable fields into an entry's config.
 * @param ns Profile entry id.
 * @param patch Fields to merge.
 * @param expectedRevision Revision returned by describe.
 */
async update(ns: string, patch: object, expectedRevision?: number): Promise<void>

/** Reset all live fields, then set the supplied fields; ordinary config is preserved.
 * @param ns Profile entry id.
 * @param section Complete form values.
 * @param expectedRevision Revision returned by describe.
 */
async replace(ns: string, section: object, expectedRevision?: number): Promise<void>

/** Apply field edits without restating redacted secrets; unsetting an array index removes its element.
 * @param ns Profile entry id.
 * @param ops Ordered form edits.
 * @param expectedRevision Revision returned by describe.
 */
async mutate(ns: string, ops: readonly SettingsPathOp[], expectedRevision?: number): Promise<void>
```

Source: [`packages/settings/settings/src/index.ts`](../../packages/settings/settings/src/index.ts)

<a id="ctxsettingscontroller--settingscontroller"></a>

### `ctx.settingsController` — `SettingsController`

Host service backing the generated `ctx.remote.settings` namespace. Every remote read uses `redactSecrets: true`, so a `role('secret')` field cannot ride a response. Writes expose the settings service's merge, replacement, and path-addressed operations, and classify every provider refusal as `settings/conflict` or `settings/rejected` with the service's message.

```ts cordis-catalog
/**
 * Describe every registered namespace for a configuration page: redacted
 * layered values plus the serialized schema the page renders its form from.
 * @returns provider writability, local-document presence, and one view per namespace.
 * @throws RemoteError when no settings provider is mounted.
 */
@Remote describe(): SettingsDescribeValue

/**
 * Merge a patch into one namespace's stored user section.
 * @param ns - namespace key to write.
 * @param patch - fields to merge into the user section.
 * @param expectedRevision - revision the caller read; `undefined` writes unconditionally.
 * @returns the namespace's redacted view after the write.
 * @throws RemoteError when the request is invalid, no provider is mounted, or the provider refuses the write.
 */
@Remote update( ns: string, patch: Record<string, JsonValue>, expectedRevision: number | undefined, ): Promise<SettingsNamespaceView>

/**
 * Replace one namespace's stored user section wholesale.
 * @param ns - namespace key to write.
 * @param section - complete replacement user section.
 * @param expectedRevision - revision the caller read; `undefined` writes unconditionally.
 * @returns the namespace's redacted view after the write.
 * @throws RemoteError when the request is invalid, no provider is mounted, or the provider refuses the write.
 */
@Remote replace( ns: string, section: Record<string, JsonValue>, expectedRevision: number | undefined, ): Promise<SettingsNamespaceView>

/**
 * Apply path-addressed edits to one namespace's user section, resolved against
 * the section as stored rather than against whatever the caller last read,
 * then answer with that namespace's new redacted view.
 * @param ns - namespace key to write.
 * @param ops - the edits to apply, in order.
 * @param expectedRevision - revision the caller read; `undefined` writes unconditionally.
 * @returns the namespace's redacted view after the write.
 * @throws RemoteError when the request is invalid, no provider is mounted, or the provider refuses the write.
 */
@Remote async mutate( ns: string, ops: SettingsPathOpView[], expectedRevision: number | undefined, ): Promise<SettingsNamespaceView>

/**
 * Materialize the provider-owned settings document and open it in a native text editor.
 * @param signal - caller lifetime; abort terminates preparation or the native command.
 * @returns confirmation after the native opener accepts the document.
 * @throws RemoteError when no document exists, preparation fails, or opening fails.
 */
@Remote async openSettingsDocument(signal: AbortSignal): Promise<SettingsDocumentOpenValue>
```

Source: [`packages/api/settings-controller/src/index.ts`](../../packages/api/settings-controller/src/index.ts)

<a id="settings-events"></a>

### `settings/*` events

<a id="settingsdocument-updated--emit"></a>

#### `settings/document-updated` — emit

One profile entry's form values, availability, or page policy changed. Form clients re-read its schema, resolved values, and revision.

```ts cordis-catalog
/**
 * One profile entry's form values, availability, or page policy changed.
 * Form clients re-read its schema, resolved values, and revision.
 * @param ns Profile entry id.
 * @param revision The entry's new revision.
 * @mode emit
 */
'settings/document-updated'(ns: SettingsNamespace, revision: number): void
```

Source: [`packages/settings/settings/src/types.ts`](../../packages/settings/settings/src/types.ts)
<!-- END GENERATED cordis-surface -->
