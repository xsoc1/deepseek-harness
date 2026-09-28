---
description: "Legacy browser-to-desktop shell bridge retained as a compatibility artifact."
kind: "package-reference"
---

# @deepseek-ai/dsh-web-shell-bridge

English | [中文](README.zh.md)

## Summary

This inherited bridge filled desktop-shell file restore and system-open operations for a pure Web environment. Only built output is present in this checkout. It should not be enabled without checking the current official desktop and browser APIs.

## Table of Contents

- Compatibility role
- Known Limitations and Deferred Work
- Dev Note

## Compatibility role

The bridge exposes user-triggered shell functions to an older browser integration; it is not an agent tool.

## Known Limitations and Deferred Work

- Source is absent, so the scope and authorization of restore/open operations cannot be audited here.
- A current official desktop shell may already own these functions; duplicate bridges risk conflicting behavior.

### Dev Note

Keep disabled until an explicit integration test establishes a need for this bridge.
