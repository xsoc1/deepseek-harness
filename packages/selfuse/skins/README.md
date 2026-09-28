---
description: "Keep legacy skin package identities resolvable while installs migrate to skin-center."
kind: "package-bundle"
---

# @dsh-selfuse/skins

English | [中文](README.zh.md)

## Summary

This retired compatibility bundle keeps old skin package identities resolvable for one migration cycle. New profiles should install `@dsh-selfuse/skin-center` directly: all skins live there, while this package contributes only empty legacy leaves and no model context.

## Table of Contents

- What it is
- Install
- Known Limitations and Deferred Work
- Dev Note

## What it is

- **Compatibility carrier**: installing or upgrading this package installs the skin center (`skin-center`), which ships the full built-in skin collection (xp / blue-fantasy / dragon-heir / minecraft / miku / trading / whale-song / harbor / whale-mom / matrix / maid-atelier / mint) as pure asset directories.
- **No-op v1 leaves**: `build.mjs` generates asset-free packages for the 11 retired v1 package names. They do not apply a skin; they only keep an existing profile junction importable during one cleanup boot.
- **Removal next cycle**: this package is scheduled for retirement; new installs should use `@dsh-selfuse/skin-center` directly (or the family aggregate `@dsh-selfuse/web-ui-all`).

## Install

### From npm (recommended)

```sh
dsh plugin --profile web add @dsh-selfuse/skin-center
```

### From the repository (development)

```sh
git clone https://github.com/zhu1090093659/dsh-web-ui.git
cd dsh-web-ui
pnpm install && pnpm -r build
dsh plugin --profile web add link:$(pwd)/packages/selfuse/skin-center
```

Switch skins in the GUI's first-level Skin Center section, or with `dsh-skin use <id>`; only one skin is active at a time.

## Known Limitations and Deferred Work

- The browser bundle targets the web only, scoped to the dsh web GUI.
- Skins are presentation-only: they mutate the browser DOM and never touch a model request.
- A profile overlay that is already invalid YAML fails inside DSH before this compatibility package can load; repair that overlay before booting.
- Maid Atelier is licensed separately under CC BY-NC-SA 4.0 and is restricted to non-commercial use; its license and attribution ship inside the skin-center package's skin directory.

## Dev Note

The compatibility window is historical; remove this carrier only after confirming no deployed profile still names a retired v1 skin package.
