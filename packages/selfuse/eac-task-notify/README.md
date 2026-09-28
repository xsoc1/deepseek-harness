---
description: "Legacy Windows turn-completion notification module retained as built output."
kind: "package-reference"
---

# @deepseek-ai/dsh-task-notify

English | [中文](README.zh.md)

## Summary

This inherited Web companion module listens for completed turns and requests a Windows notification for a human. The manifest excludes subagent sessions. The checkout holds built output only, so current runtime behavior needs a separate test.

## Table of Contents

- Compatibility role
- Known Limitations and Deferred Work
- Dev Note

## Compatibility role

Notifications report a completed task to the user; they do not create an agent instruction or tool result.

## Known Limitations and Deferred Work

- Source is absent, and Windows notification permission and delivery have not been verified in this candidate.
- A notification is not proof that a remote browser received the final conversation state.

### Dev Note

Use only after a real Windows notification smoke in the intended deployment.
