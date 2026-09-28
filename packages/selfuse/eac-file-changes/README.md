---
description: "Legacy session file-change projection retained as a prebuilt artifact."
kind: "package-reference"
---

# @deepseek-ai/dsh-file-changes

English | [中文](README.zh.md)

## Summary

This legacy module projects recorded tool-result diff metadata for a browser file view. The checkout contains only a manifest and built output. It does not itself restore files or add model input.

## Table of Contents

- Compatibility role
- Known Limitations and Deferred Work
- Dev Note

## Compatibility role

The older desktop file view consumes the projection when its corresponding browser module is installed.

## Known Limitations and Deferred Work

- Source is absent, so projection behavior cannot be independently revised for a new Session format here.
- Any migration requires a replay test against current recorded Session events.

### Dev Note

Prefer the official Session projection when it supplies the required file-change data.
