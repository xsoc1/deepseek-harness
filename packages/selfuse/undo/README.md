---
description: "Snapshot and restore DSH configuration and user-plugin code."
kind: "package-bundle"
---

# @dsh-selfuse/undo

English | [中文](README.zh.md)

## Summary

This bundle snapshots profile configuration and selected user-plugin files, then offers restore, comparison, import, export, and safe-mode controls. It also ships offline tools for recovery when DSH does not start. Restores are destructive changes to local configuration: inspect the diff and preserve an independent backup first.

## Table of Contents

- Use the bundle
- Recovery scope
- Model Experience
- Known Limitations and Deferred Work
- Dev Note

## Use the bundle

Install into a chosen profile using the official CLI, then restart DSH:

```sh
dsh plugin --profile web add @dsh-selfuse/undo
```

The Host registers `undo_snapshot`, `undo_list`, `undo_diff`, `undo_restore`, `undo_prune`, `undo_export`, `undo_import`, `undo_recent`, and `undo_safe_mode`. Use `undo_diff` before `undo_restore`; the restore path saves the current state first. Offline PowerShell helpers live under `tools/` for a DSH startup failure.

## Recovery scope

Snapshots target profile files such as `cordis.patch.yml` and `package.json`, DSH-home settings, and selected user-plugin code. Snapshot stores are profile-scoped by default. `.env` and credentials require special handling: local restore may preserve secrets in a local vault, but exports and archives must still be treated as sensitive until inspected.

## Model Experience

### Configuration recovery tools

#### What the model sees

The agent receives recovery-tool schemas such as `undo_list` and result text from any call, including snapshot names, diffs, or restore status. An optional system-prompt section gives tool-use guidance; inspect it before enabling the plugin.

#### Token effect

Tool schemas and the optional guidance add request tokens. A diff or snapshot list adds result tokens when called; snapshot file contents are not automatically added to context.

#### KV Cache effect

Unchanged schemas and guidance can retain a stable prompt prefix. A tool result extends the active turn; restoring configuration changes later runtime composition and therefore later prompts, not earlier cached requests.

## Known Limitations and Deferred Work

- A restore changes local profile files and may require a restart; it is not a substitute for an independent backup of the DSH home.
- The inherited offline GUI is Windows-specific; package tests do not prove it works in the current desktop deployment.
- Secret-redaction claims need explicit export inspection before sharing any archive.
- This package overlaps some official configuration and session-history capabilities; retain it only for verified recovery needs.

### Dev Note

`README.en.md` is an inherited long-form upstream document and may describe older behavior. The current `lib/index2.js` and `tools/` contents are the implementation evidence; run package tests and a disposable-profile restore before activation.
