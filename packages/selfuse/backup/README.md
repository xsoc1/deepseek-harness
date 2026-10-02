---
description: "Add local DSH-home backup, verification, restore and an optional settings tab to a profile."
kind: "package-bundle"
---

# @dsh-selfuse/backup

English | [中文](README.zh.md)

## Summary

This private workspace layer adds the `backup_dsh` tool, `/backup` command, persistent scheduling and a settings tab to a profile. The current official Desktop profile does not include it. Install a built local source link for development, or remove it through the native CLI. Archives contain plaintext credentials; checksum verification is not encryption or authentication.

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

From the candidate checkout, build the package, then use an initialized disposable profile and an absolute local package path. These source-link operations were exercised through the native CLI; they are not npm publication or installed Desktop acceptance.

```sh
pnpm --filter @dsh-selfuse/backup run build
DSH_HOME=/absolute/scratch/dsh pnpm exec tsx apps/cli/src/bin.ts plugin --profile backup-acceptance add link:/absolute/checkout/packages/selfuse/backup
DSH_HOME=/absolute/scratch/dsh pnpm exec tsx apps/cli/src/bin.ts plugin --profile backup-acceptance remove @dsh-selfuse/backup
```

The package's patch declaration activates its layer through `package.json`'s `dsh.profile.bundles` list. Restart the owning application after changing the profile. Do not run scratch instructions against the real Desktop home.

### What you get

`/backup` creates an archive; `list`, `verify [prefix|all]`, `restore <prefix|latest> [--dry-run]`, `auto <hours>|off|status` and `github status|sync` provide the other actions. `--keep N` overrides retention for one backup; scheduled backups retain three copies below 24 hours and seven otherwise. The model tool offers backup, list, verify, restore and auto modes. The settings tab adds preview/confirmation, individual deletion and synchronization controls; download appears only when the Host has a Web server and accepts only local requests.

### Configuration and restore

The patch inserts one plugin row. Supply its configuration through the owning profile; the destination must be an absolute Host path outside `DSH_HOME`, with `~/` expanded from the launch environment.

```yaml
- id: '@dsh-selfuse/backup'
  name: '@dsh-selfuse/backup'
  config:
    destination: '~/Backups/dsh'
    keep: 7
    exclude: []
    githubRepo: ''
```

Without a destination, backups use `~/Desktop/@dsh-selfuse/backups`. The data root is `DSH_HOME`, or `~/.dsh` when unset; Windows may resolve the home from `USERPROFILE`. Archives exclude reinstallable `node_modules`; scheduling and Git state persist in `<destination>/auto.json`.

Preview a restore first. Restoration verifies the checksum and rejects escaping paths, links and special files before writes; it snapshots current data, moves that data into a timestamped sibling, then extracts the selected archive. The pre-restore snapshot temporarily increases retention so rotation cannot delete the selected archive. Stop other writers, preserve the sibling on failure, and restart DSH after recovery; this is not a transactional live-session migration.

### Optional Git synchronization

Set `githubRepo` to a dedicated private GitHub repository, a Git URL or a local repository path. For HTTPS authentication, supply `DSH_BACKUP_GITHUB_TOKEN` or `GITHUB_TOKEN` in the launch environment. A local credential file is excluded from commits. Synchronization updates the selected remote and pushes `HEAD:main` with a lease obtained from that remote; use an exclusively backup-owned branch, not an existing project branch. Files above 90 MiB are skipped. A private remote does not encrypt the archive.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

[cordis.patch.yml](cordis.patch.yml) inserts the layer. [src/index.ts](src/index.ts) owns the command, tool, schedule, Typert service and optional download route; [src/storage.ts](src/storage.ts) performs literal unlink/rename and archive-path validation. [src/client/index.ts](src/client/index.ts) owns typed Remote codecs, locale and slot contributions; [src/types.ts](src/types.ts) contains browser-safe response fields.

Explicit Host and Client projects emit declarations separately and share only response source. [tsdown.config.ts](tsdown.config.ts) uses the native client-bundle builder; authored JS and fake-service smoke scripts are not a second source tree. Mutating command, tool, panel and timer operations are serialized within one plugin instance. Downloads require both a loopback Host header and peer address, reject symlinks and stream an already-open regular file.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

See [plugin composition](../../boot/app-boot/README.md), [testing](../../../docs/testing.md) and [defensive patterns](../../../docs/defensive-patterns.md). The original plugin is [dsh-backup](https://github.com/xiaoyuyu6420/dsh-backup); this workspace owns the compatibility changes.

<a id="model-experience"></a>
## Model Experience

### Backup tool result

#### What the model sees

The model receives the `backup_dsh` schema and operation status, with `path` and `sha` for backup success. Archive contents and Git tokens are not included in this plugin's result. Restore mode can replace the local data root; the panel's confirmation does not add an approval step to tool calls.

#### Token effect

The schema and returned status add context tokens. File contents remain on disk unless another tool or the user supplies them to the model.

#### KV Cache effect

Changing local archives alone does not change model context. Tool results become part of the active conversation, so subsequent requests include those results according to the owning agent's context rules.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- A current checkout requires Node matching the root manifest, native subprocess/tools/commands services and `tar` on PATH. The integrated candidate is DSH 0.2.0-rc.2; isolated Linux tests are not Windows tar or installed Desktop activation tests. Actual GitHub HTTPS authentication and Desktop downloads remain unverified; Desktop without a Web server uses local archive files rather than an HTTP download route.
- A complete subprocess capture is bounded to 1 MiB; a larger archive listing stops restore before moving current data. In-process checksum fallback is bounded to 256 MiB. Checksums detect accidental corruption, not malicious replacement of both archive and checksum. Archive rejection is lexical plus tar metadata validation, not a defense against a concurrent process changing files or symlink ancestors. The backup is not encrypted or a consistent snapshot of concurrent writers, and extraction failure does not automatically roll back.

<a id="dev-note"></a>
### Dev Note

No invariant companion is published because archives and scheduling files are external state without a Session projection; native operation and unload tests check their effects.

<details>
<summary>Working context for maintainers — click to expand</summary>

Run the package build, then `pnpm exec vitest run packages/selfuse/backup/tests scripts/selfuse/backup-profile-acceptance.spec.ts` from the checkout. These tests exercise native Loader reload, actual restore, two local Git remotes, the HTTP route and the rebuilt browser factory against disposable files. The Client artifact is minified with its source map; the Host artifact remains readable. Keep full release gates and real Desktop activation as separate acceptance steps; never use the live home for these tests.

</details>
