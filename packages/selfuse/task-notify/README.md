---
description: "Windows task-completion notifications and their delivery limits."
kind: "package-reference"
---

# @dsh-selfuse/task-notify

English | [中文](README.zh.md)

## Summary

This companion listens for completed main-session turns and requests a Windows notification for a human. Subagent sessions and interrupted turns are excluded. Notification failures do not interrupt the Host.

## Table of Contents

- Compatibility role
- Known Limitations and Deferred Work
- Dev Note

## Compatibility role

Notifications report a completed task to the user; they do not create an agent instruction or tool result. The typed source rebuilds `lib/index.js`; event tests do not establish Windows notification delivery. Cached titles are removed when a session is disposed, and plugin disposal removes its listeners and cache. No invariant companion is published because this observer owns no independent persistent state to reconcile.

## Known Limitations and Deferred Work

- Windows notification permission and delivery have not been verified in this candidate.
- A notification is not proof that a remote browser received the final conversation state.

### Dev Note

Use only after a real Windows notification smoke in the intended deployment.
