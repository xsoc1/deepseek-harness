---
description: "Legacy Host API-proxy transport artifact retained for selfuse compatibility."
kind: "package-reference"
---

# @deepseek-ai/dsh-host-apiproxy

English | [中文](README.zh.md)

## Summary

This compatibility package carries the older Host API proxy and fetch exports used by selfuse plugins. The checkout contains a manifest and built `lib` artifacts, not its original source. The current official API packages are preferred for new code.

## Table of Contents

- Compatibility role
- Known Limitations and Deferred Work
- Dev Note

## Compatibility role

The manifest exports Host transport, API declarations, a fetch client, and invariant entries. Existing plugin imports use these names until migrated.

## Known Limitations and Deferred Work

- No source or local build recipe is present; this package cannot be independently adapted to an upstream API change.
- A passing typecheck of dependent plugins does not establish runtime compatibility of the frozen transport.

### Dev Note

Track consumers and replace this artifact with current official APIs when each consumer has a runtime test.
