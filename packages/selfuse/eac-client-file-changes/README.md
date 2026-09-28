---
description: "Legacy browser file-change view retained for desktop compatibility."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-file-changes

English | [中文](README.zh.md)

## Summary

This inherited browser module presents session file changes and a restore control for the older desktop integration. It is a built artifact with no source in this checkout. The current official desktop and file-change features should be evaluated before re-enabling it.

## Table of Contents

- Compatibility role
- Known Limitations and Deferred Work
- Dev Note

## Compatibility role

The browser view reads the file-change projection; restoration depends on a desktop shell bridge.

## Known Limitations and Deferred Work

- Source is absent, so behavior cannot be safely revised for the current client API here.
- Restore must be tested in a disposable workspace before this module is enabled.

### Dev Note

Keep disabled unless a verified active profile requires the legacy view.
