---
description: "Browse and search local Markdown knowledge pages and create notes through an optional human-facing settings tab."
kind: "package-bundle"
---

# @dsh-selfuse/memory-panel

English | [中文](README.zh.md)

## Summary

This optional layer lets you browse local Markdown knowledge pages, create notes and search both collections from Settings. Files stay in the configured Host directory. The panel does not call a model, inject context or replace an agent memory-retrieval system. It is not included in the default official Desktop profile.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

### Install into a profile

This is a private source package, not a published npm package. Build it in the current checkout. The native CLI accepts `link:<absolute-package-directory>` for a selected scratch profile; replace the example path below with this package's actual absolute directory. The installation test exercises that add/remove path and verifies the profile layer metadata without changing your normal profile.

```sh
node --import tsx apps/cli/src/bin.ts plugin --profile memory-acceptance add link:/absolute/path/to/memory-panel
node --import tsx apps/cli/src/bin.ts plugin --profile memory-acceptance remove @dsh-selfuse/memory-panel
```

The [patch](cordis.patch.yml) inserts one Host row; native Client discovery loads its settings tab. Installation alone does not prove the installed Desktop runtime can activate it.

### Storage and controls

The store contains `knowledge/*.md` and `notes/*.md`. Existing files keep their contents and permissions. The tab reports counts and size, lists knowledge pages, pages through notes, reads documents, creates notes and searches titles or content by case-insensitive substring. Note creation uses a unique filename and exclusive creation; it does not edit an existing note or knowledge page. Refresh and successful saves reload the list and counts. Markdown is displayed as text, not executed as HTML.

The configured `root` takes precedence over the launch snapshot's `DSH_MEMORY_ROOT`, then `$DSH_HOME/memory`. Without a `DSH_HOME` override, the panel uses the native bootstrap's Harness-home resolver for the `memory` directory. Paths must be absolute Host paths. Scratch contexts must supply an isolated home resolver or an explicit store; the plugin does not independently resolve the machine's user home.

| Config field | Default | Meaning |
| --- | --- | --- |
| `root` | Empty | Use the launch environment's store selection or the native Harness home's memory directory. |
| `maxFileBytes` | `262144` | Complete UTF-8 bytes per file or composed note; valid range 256–1048576. |
| `searchLimit` | `50` | Matches across both collections; valid range 1–500. |

The panel uses the native authenticated RPC connection. It does not expose `/memory/api/*` routes. File ids cannot contain path separators; files and collection directories must not be links. Errors are visible to the caller rather than silently omitting an unreadable file. Cancelling an uncommitted note removes that newly created file. Unloading removes the tab, dictionaries, styles and RPC methods and waits for this instance's active file calls to settle.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The Host binds file operations to one validated store and publishes a Typert service. The Client mounts strict codecs, locale-owned labels and an owned settings contribution. Host and Client compile independently from real TypeScript sources; the Client factory is minified with a source map. The store remains a plain Markdown collection, not model memory, a vector index or a cloud service. This package has no independent duplicated state requiring an invariant companion.

See the [Host](src/index.ts), [store](src/storage.ts) and [Client](src/client/index.ts) for implementation details.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Profile and bundle composition](../../../docs/architecture.md)
- [Native settings services](../../../docs/subsystems/settings.md)

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- This panel does not inject, retrieve, rank or summarize memories for the model. It contributes no prompts, tool schemas or Session events, so editing local files alone changes neither request tokens nor KV Cache input.
- Reads reject non-UTF-8 or oversized documents. Search stops at its configured match limit; it is a local substring scan, not semantic retrieval. Lists and byte counts are not a consistent snapshot of concurrent writers.
- Link rejection checks the store, collection and file entries; it does not protect against a malicious process replacing ancestors or paths concurrently. Windows descriptor behavior and signed Desktop activation require separate acceptance. The current tests use Linux files, native Loader/CLI and a real browser factory in jsdom.

<a id="dev-note"></a>
### Dev Note

No invariant companion is published because every RPC reads the filesystem directly; the panel maintains no independent durable or Session-derived state to reconcile.

<details>
<summary>Working context for maintainers — click to expand</summary>

Run `pnpm --filter @dsh-selfuse/memory-panel run build`, then `pnpm exec vitest run packages/selfuse/memory-panel/tests scripts/selfuse/memory-panel-profile-acceptance.spec.ts`. All writable fixtures use temporary stores and profiles. The Client test executes the rebuilt factory against the official module table, native renderer and RPC codecs, with a file-backed carrier fixture. Keep full release checks and real Desktop activation separate; never use the live memory root for testing.

</details>
