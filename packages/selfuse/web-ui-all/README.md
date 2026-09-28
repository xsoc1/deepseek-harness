---
description: "Add Git graph, remote Web UI, and Skin Center to the selfuse Web profile."
kind: "package-bundle"
---

# @dsh-selfuse/web-ui-all

English | [中文](README.zh.md)

## Summary

This bundle adds the three selfuse Web features not supplied by the official Web composition: Git graph, remote Web UI, and Skin Center. The official CLI still manages plugin installation. This carrier only wires browser-facing packages and does not add model context.

## Table of Contents

- Use this package
- Known Limitations and Deferred Work
- Dev Note

## Use this package

The carrier mounts Git graph, remote Web UI, and Skin Center. Its client compatibility shim also marks pane elements for the skin. The carrier has no separate host feature.

The official Web bundle provides the plugin inventory/settings, workspace files, right-sidebar PTY terminal, agent presets, skills, and task tools. This profile does not mount older overlapping market, settings, task-board, SSH, or desktop-shell companions. Community plugin installation is handled with the native CLI:

```sh
dsh plugin --profile web list
dsh plugin --profile web add <package>
dsh plugin --profile web remove <package>
```

The local deployment is generated from `config/selfuse/profiles.build.yml`; do not edit its generated `~/.dsh/profiles/web` files by hand. The generator retains dependencies and bundle entries added through the native CLI. The custom remote UI remains necessary for Tailnet/iPad access, and the skin center retains the user's wallpaper. The package source for retired features is preserved for reference but is not part of the active profile.

When upgrading upstream, compare `cordis.patch.yml` with the official Web bundle and retain only custom rows that provide a distinct capability.

## Known Limitations and Deferred Work

- The carrier stores a prebuilt compatibility shim without editable TypeScript source in this checkout; validate the skin hooks against each official Web update.
- Browser layout and iPad behavior require live UI checks after a build; generated profile validation alone does not prove them.

## Dev Note

The retired packages remain in Git history and the workspace for now, but they are not part of the active profile.
