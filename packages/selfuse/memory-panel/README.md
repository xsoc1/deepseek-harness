---
description: "Browse and edit local Markdown memories in a human-facing DSH settings panel."
kind: "package-bundle"
---

# @dsh-selfuse/memory-panel

English | [中文](README.zh.md)

## Summary

This bundle adds a Web settings panel for local Markdown knowledge pages and notes under the DSH home. It does not call a model or add these files to agent context. The panel is a human editor and viewer, not a memory-retrieval system for the agent.

## Table of Contents

- Storage and features
- Install
- Security
- Known Limitations and Deferred Work
- Dev Note

## Storage and features

Knowledge pages live in `~/.dsh/memory/knowledge/*.md`; notes live in `~/.dsh/memory/notes/*.md`. The panel shows counts and storage size, browses both collections, creates notes, and searches titles and content by substring. `DSH_MEMORY_ROOT` can change the root for a controlled test.

## Install

Use the official plugin CLI for the intended Web profile:

```sh
dsh plugin --profile web add @dsh-selfuse/memory-panel
```

## Security

The Host route reads and writes local files. File ids have a restricted character set and cannot contain path separators; access is scoped to the configured memory root. The route inherits the Web server's origin and network protections.

## Known Limitations and Deferred Work

- This panel does not inject, retrieve, rank, or summarize memories for the model.
- The Host route must not be exposed without the deployment's Web authentication and network controls.

### Dev Note

The integrated package contains prebuilt Host and client entries. Verify browser rendering and a write/read round trip before using it on important notes.
