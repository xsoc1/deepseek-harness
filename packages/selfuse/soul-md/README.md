---
description: "Add a local soul.md persona card to a profile through native prompt sections."
kind: "package-bundle"
---

# @dsh-selfuse/soul-md

English | [中文](README.zh.md)

## Summary

This private workspace layer adds a local Markdown persona card to the system prompt. The official Desktop profile does not include it. Install a built local link through the native CLI; edit its preferences in the official plugin configuration form. The card applies to all agents in the Host, so its contents are trusted instructions.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

### Install into a profile

These local-link operations passed against a disposable profile through the built native CLI. They do not establish npm publication or installed Desktop activation.

```sh
pnpm --filter @dsh-selfuse/soul-md run build
DSH_HOME=/absolute/scratch/dsh node apps/cli/lib/bin.js plugin --profile soul-md-acceptance add link:/absolute/checkout/packages/selfuse/soul-md
DSH_HOME=/absolute/scratch/dsh node apps/cli/lib/bin.js plugin --profile soul-md-acceptance remove @dsh-selfuse/soul-md
```

Initialize the scratch profile first. The patch declaration records this layer in `dsh.profile.bundles`; restart its application after profile changes. Do not apply scratch commands to the real Desktop home.

### What you get

The `soul:persona` section reads an absolute `path`, or a path relative to the immutable launch-time DSH home. A missing file uses `fallback`; an empty card contributes no section. The watcher follows the pathname across creation and atomic-save replacement. Saves and native configuration edits affect later assemblies, not requests already sent.

```yaml
- id: soul-md
  name: '@dsh-selfuse/soul-md'
  config:
    path: soul.md
    fallback: ''
    order: 0
    complete: false
    watch: true
    debounceMs: 300
    maxFileBytes: 131072
```

Omitting the whole `config` object uses these defaults. The read limit is 128 KiB by default, adjustable from 256 bytes to 1 MiB. Invalid UTF-8, oversized files and other read errors fail loading; a watcher reload logs the error and retains the last valid section. Only a missing file activates the fallback.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

[cordis.patch.yml](cordis.patch.yml) inserts one Host row. [src/index.ts](src/index.ts) owns validated volatile configuration, bounded reads, the native prompt contribution and watcher cleanup. [tsdown.config.ts](tsdown.config.ts) emits `lib/index.js` and declarations; there is no separate browser entry or legacy settings API. Configuration uses the official generated form.

The plugin owns only a derived prompt contribution and a file watcher, not a mutable service registry or durable store. Disposal removes its section and cancels pending reloads; no additional service invariant installer is needed.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

See [system prompts](../../core/system-prompt/README.md), [testing](../../../docs/testing.md) and the [native configuration migration](../../../docs/upgrade-guide/v0.2.0-rc.2/selfuse-soul-md/guide.md). The original plugin is [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md); this workspace owns compatibility changes.

<a id="model-experience"></a>
## Model Experience

### Persona card section

#### What the model sees

The model sees the rendered card in `soul:persona`, including substitutions such as `{{model}}` and `{{cwd}}`. It applies to all Host agents, including subagents. The plugin adds no tools.

#### Token effect

The full rendered card adds system-prompt tokens to every assembled request. Long cards increase input cost and displace other context.

#### KV Cache effect

An unchanged card keeps its contribution stable. Editing it changes later requests and may invalidate provider prefix reuse; earlier requests remain unchanged.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- Literal `{{` and `}}` conflict with variable syntax; unknown variables can fail rendering. The card is not an untrusted-document attachment.
- `complete: true` suppresses other system-prompt sections. Review the whole composition before enabling it; default is false.
- File watching uses polling and debounce. Reads are bounded, but network filesystem stalls remain operating-system dependent. The current candidate is DSH 0.2.0-rc.2; Linux tests do not establish installed Windows Desktop acceptance.

<a id="dev-note"></a>
### Dev Note

No invariant companion is published because the owned prompt section is derived directly from the file and native configuration; Loader tests verify refresh and disposal.

<details>
<summary>Working context for maintainers — click to expand</summary>

Run the package build, native Loader/file lifecycle tests and `scripts/selfuse/soul-profile-acceptance.spec.ts` in disposable homes. Keep authored keyless Session replay, full release checks and real Desktop activation as separate evidence. The old Host, Client and settings helper are archived outside the checkout.

</details>
