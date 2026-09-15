# @dsh-selfuse/web-ui-all

English | [中文](README.zh.md)

The self-use Web UI carrier mounts only three custom browser features: Git graph, remote Web UI, and skin center. Its client compatibility shim also marks pane elements for the skin. The carrier has no separate host feature.

The official Web bundle provides the plugin inventory/settings, workspace files, right-sidebar PTY terminal, agent presets, skills, and task tools. This profile does not mount older overlapping market, settings, task-board, SSH, or desktop-shell companions. Community plugin installation is handled with the native CLI:

```sh
dsh plugin --profile web list
dsh plugin --profile web add <package>
dsh plugin --profile web remove <package>
```

The local deployment is generated from `config/selfuse/profiles.build.yml`; do not edit its generated `~/.dsh/profiles/web` files by hand. The generator retains dependencies and bundle entries added through the native CLI. The custom remote UI remains necessary for Tailnet/iPad access, and the skin center retains the user's wallpaper. The package source for retired features is preserved for reference but is not part of the active profile.

When upgrading upstream, compare `cordis.patch.yml` with the official Web bundle and retain only custom rows that provide a distinct capability.
