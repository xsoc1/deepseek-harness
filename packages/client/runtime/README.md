---
description: "Legacy browser-runtime compatibility artifact for older selfuse plugins."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-runtime

English | [中文](README.zh.md)

## Summary

This package preserves a pre-0.1.2 browser runtime API for older selfuse plugins. The checkout contains built `lib` artifacts and a manifest, not maintainable source. New code should use the current official client packages instead.

## Table of Contents

- Compatibility role
- Known Limitations and Deferred Work
- Dev Note

## Compatibility role

The manifest exports the root, browser client, and invariant entries. Existing legacy consumers can resolve those names while migration proceeds.

## Known Limitations and Deferred Work

- No source or build recipe is present in this checkout; upstream API compatibility cannot be established from this package alone.
- This compatibility artifact must not become the preferred dependency for new plugins.

### Dev Note

Keep only while a verified legacy consumer requires it; remove after consumers migrate to current official client packages.
