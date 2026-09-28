---
description: "Browse the bundled community plugin index in the Web settings page."
kind: "package-bundle"
---

# @dsh-selfuse/web-ui-community-plugins

English | [中文](README.zh.md)

## Summary

This optional bundle adds a searchable community plugin index to Web settings. It does not run model tools or change prompt context. When a compatible plugin manager is present and the browser is local, cards can request installation; otherwise they only display copyable CLI commands. The active selfuse profile does not load this bundle and uses the official CLI instead.

## Table of Contents

- What it does
- Install
- Config
- Known Limitations and Deferred Work
- License
- Dev Note

## What it does

- **First-level section**: registers one settings section next to General / Models / Plugins / Agent presets and the Web UI Plugins, Skin Center and Pet sections. The content renders directly expanded (no disclosure fold), with its own enable switch backed by the community-plugins settings namespace.
- **Marketplace display**: entries render as a searchable, category-filterable card grid — a search box over names, descriptions and authors, category pills with per-category counts, and a two-column card layout (name, npm/repo marker, a `category · author` meta line, a two-line description, and a repository link).
- **In-GUI install and uninstall**: when the Plugin manager plugin provides its `pluginManager` cordis service and that face reports loopback (local browser), each card gains an Install button with a live stage line (fetch / download / extract / write) polled from the host, an "installed, takes effect after restart" badge, and an Uninstall button behind a confirmation dialog. Installs and uninstalls write through the Plugin manager's own channels, so the card stays in sync with the Plugin manager tab (via the service's change subscription). Only one mutation runs at a time; while one is in flight the other cards' buttons are disabled.
- **Graceful degradation**: without the Plugin manager plugin, or from a remote (non-loopback) browser, the section renders the read-only index exactly as before — every card keeps its copy-install-command button in all states as a fallback, and a subtle hint explains what enables in-GUI install.
- **Index only**: every entry links to the contributor's own repository; the package never vendors the listed code. The registry lives in community.json and is compiled into the client bundle by scripts/community-index.

## Install

### From npm (recommended)

```sh
dsh plugin --profile web add @dsh-selfuse/web-ui-community-plugins@latest
```

### From the repository (development)

```sh
git clone https://github.com/zhu1090093659/dsh-web-ui.git
cd dsh-web-ui
pnpm install && pnpm -r build
dsh plugin --profile web add link:$(pwd)/packages/dsh-community-plugins
```

Restart `dsh web` for the card to appear in the settings page.

## Config

- **Enable switch**: inside the Community Plugins first-level section itself (the section carries its own switch). Turning it off hides the index list until it is turned back on; the choice persists in the community-plugins settings namespace.
- **Category filter**: entries may carry a `category` in community.json — one of the fixed marketplace categories `ui`, `agent`, `tools`, `knowledge`, `integration`, `security` or `utility`. The card renders them as filter pills with counts, plus a search box over names, descriptions and authors; the "npm published / repo install" marker on each card comes from the `npm` field.
- **Running a listed plugin**: with the Plugin manager plugin installed and a local (loopback) browser, click Install on a card — the entry's npm package is used when published, else the contributor repository URL. Without it, copy the card's install command into a terminal, e.g. `dsh plugin --profile web add <name>`. Either way the install takes effect after restarting `dsh web`, and the plugin then provides its own switch and config (if any) in the plugin configuration section. Uninstall from a card requires the same confirmation and likewise applies on restart.

## Known Limitations and Deferred Work

- The card shows on the dsh settings page only when its prerequisite (`@deepseek-ai/dsh-client-ui-settings`) is present.
- In-GUI install/uninstall requires the Plugin manager plugin (`@linxin666/dsh-client-ui-plugin-manager`) and a local browser; remote browsers get the read-only copy-command index.
- Installs and uninstalls staged from the card take effect only after restarting `dsh web` (the "installed" badge says so on the card).
- Entries are curated by maintainers in community.json; the card ships the build-time snapshot.

## License

BSD-3-Clause.

## Dev Note

The catalog snapshot and upstream manager compatibility described above have not been revalidated for the current official DSH release; keep this bundle inactive until they are.
