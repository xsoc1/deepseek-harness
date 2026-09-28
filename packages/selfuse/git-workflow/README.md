---
description: "Structured agent Git tools routed through the current DSH shell policy."
kind: "package-bundle"
---

# @dsh-selfuse/git-workflow

English | [中文](README.zh.md)

## Summary

This plugin gives the agent structured status, diff, log, branch, and commit tools. Git commands run through the current DSH shell and sandbox policy; the plugin does not provide push, pull, or rebase. It is useful when an agent needs parseable Git results instead of composing raw shell output.

## Table of Contents

- Tools
- Install
- Safety
- Model Experience
- Known Limitations and Deferred Work
- Dev Note

## Tools

| Tool | Purpose |
| --- | --- |
| `git_status` | Branch, upstream, ahead/behind, staged, unstaged, untracked, and conflict status. |
| `git_diff` | Working-tree or staged diff, with optional stat, path filter, and output limit. |
| `git_log` | Recent commits and optional changed-file names. |
| `git_commit` | Validate a message, optionally stage selected paths, then commit. |
| `git_branch` | List local branches and identify the current branch. |

All tools accept `workdir`, defaulting to the session work directory. Relative paths resolve from that directory.

## Install

Use the official plugin CLI for the intended profile:

```sh
dsh plugin --profile web add @dsh-selfuse/git-workflow
```

## Safety

The plugin uses `ctx.shell.execute()` under the session sandbox policy and fails closed if the shell or policy is missing. It validates commit messages and rejects absolute or traversal paths before calling Git. These checks do not replace the session sandbox, which remains responsible for filesystem enforcement.

## Model Experience

### Structured Git operations

#### What the model sees

The agent receives five Git tool schemas, including `git_status`, and after a call a structured result rendered as readable text. A failed operation returns a status and error instead of an unparsed shell transcript.

#### Token effect

The schemas add prompt tokens when available; a call adds tokens for the status, diff, log, or commit result. A large diff can consume substantial result context despite output limits.

#### KV Cache effect

The tool schemas remain stable across calls. Each returned Git result extends the current turn's context; unrelated repository changes do not alter cached context until a tool is called.

## Known Limitations and Deferred Work

- Path checks are lexical; the active DSH sandbox performs filesystem enforcement.
- `git_commit` needs the repository's Git identity configured.
- Unusual path encodings may not be fully represented in `git_log` file output.
- Push, pull, and rebase are deliberately not exposed by this plugin.

### Dev Note

Run the package tests and a sandbox-denial case when upgrading DSH's shell interface. The integrated source, not an older standalone checkout path, is the development authority.
