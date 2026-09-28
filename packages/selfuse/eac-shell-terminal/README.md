---
description: "Legacy desktop interactive terminal module retained as built output."
kind: "package-reference"
---

# @deepseek-ai/dsh-shell-terminal

English | [中文](README.zh.md)

## Summary

This inherited desktop module presents a human-operated terminal alongside the conversation. Its manifest describes an SSE stream rather than a PTY. Only built output is present, so it is not a maintainable replacement for the current official terminal features.

## Table of Contents

- Compatibility role
- Known Limitations and Deferred Work
- Dev Note

## Compatibility role

The terminal is a desktop user control, not an agent shell tool.

## Known Limitations and Deferred Work

- Source is absent; command isolation and current-client compatibility have not been audited in this checkout.
- It is not a PTY and should not be assumed to support full terminal behavior.

### Dev Note

Prefer the current official terminal unless a verified legacy workflow requires this module.
