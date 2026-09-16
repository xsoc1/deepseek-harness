---
description: "Operate and inspect the local WSL-hosted DSH Web deployment from the Windows control console."
kind: "package-reference"
---

# @dsh-selfuse/control-gui

English | [中文](README.zh.md)

## Summary

This Windows control console starts and observes the locally deployed, WSL-hosted DSH Web service. It is a companion to the native Web UI, not a Harness plugin or an alternative plugin manager.

## Table of Contents

- [Controls](#controls)
- [Status](#status)
- [Build](#build)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

## Controls

- Start, stop, and restart the local DSH watchdog and Web process chain.
- Open the local Web UI, view recent watchdog and Web logs, and refresh status. The log panel also follows new output; its context menu and Ctrl+L clear only the displayed text.
- Open the active WSL DSH configuration directory, copy a status diagnostic, and adjust the banner and source paths in Settings. The main window size persists across launches.

## Status

The console polls in a background PowerShell process. Web is green only after HTTP 200, and Tailscale is green only when its service and backend are running with a Tailnet IP. A status file older than 15 seconds produces an unknown state. Tailscale status is read-only: the console does not change Serve configuration.

The default DSH configuration path is `\\wsl.localhost\Ubuntu\home\huangzy\.dsh`. Existing settings that still name the old Windows `%USERPROFILE%\.dsh` path are mapped to this WSL path when loaded; an explicitly customized path is preserved. The Windows source directory and WSL DSH configuration directory are different locations.

## Build

From this package directory on Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\build-gui-exe.ps1
```

The resulting `dsh-control-gui.exe` uses `dsh-gui-poller.ps1` beside it or in the configured source checkout. Reopen the console after replacing a running executable.

## Known Limitations and Deferred Work

- The console deliberately has no automatic DSH updater or Tailscale Serve repair button. DSH source upgrades require a reviewed maintenance workflow; plugin management belongs to the native `dsh plugin --profile web` CLI.
- The console controls only this machine's DSH deployment. Its status checks do not verify an iPad or other remote client's browser session.

## Dev Note

`tests/console-features.ps1` checks the visible controls and the removed poller commands. `tests/status-regression.ps1` checks Web and Tailscale status behavior.
