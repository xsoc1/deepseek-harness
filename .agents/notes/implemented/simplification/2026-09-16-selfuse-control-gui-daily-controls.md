# Agent Note: Keep the self-use control GUI to daily local controls

Status: implemented

English | [中文](2026-09-16-selfuse-control-gui-daily-controls.zh.md)

## Problem

The self-use control GUI mixed local DSH start/stop actions with duplicate remote-restart labels, a Tailscale Serve mutator, a whole-WSL shutdown, and an updater tied to an obsolete checkout path and hard-reset/push workflow. Its directory buttons and version row described the Windows mirror as if it were the active WSL deployment. These entries made a small operations console imply more authority than it actually had.

## Decision

The visible controls are local DSH start, stop, restart, Web opening, recent logs, refresh, active configuration directory, diagnostic copy, on-demand remote health, update preflight, and settings. The poller accepts only three state-changing DSH lifecycle actions and two read-only checks; it does not dispatch Tailscale Serve changes, WSL shutdown, or source updates. Tailscale remains read-only status. The duplicate remote-restart button, duplicate log-clearing button, redundant profile-directory button, duplicate banner-menu links, and Windows-mirror version row are absent. A legacy default `%USERPROFILE%\.dsh` setting maps to the active WSL `\\wsl.localhost\Ubuntu\home\huangzy\.dsh` path; custom paths stay intact.

## Alternatives considered

**Keep the dangerous actions behind an advanced menu.** Hiding them would preserve the obsolete updater and broad shutdown/Serve mutation paths without making their preconditions reliable.

**Replace the updater and Serve repair immediately.** Safe source upgrade and remote-access repair need separate, verified workflows with explicit target and rollback checks; neither is a daily GUI action. The existing standalone update scripts remain in the repository but are not reachable from the console.

**Remove every configuration-directory control.** Opening the actual WSL DSH home still helps inspect the active profile and troubleshoot local state, so one correctly targeted entry remains.

## Consequences

The smaller interface retains essential local recovery actions and read-only status while reducing accidental mutation paths. The GUI and poller regression checks pin the retained controls, forbidden commands, and legacy-path mapping. Clearing displayed logs remains available from the log context menu and Ctrl+L. Source updates, Tailscale configuration, and whole-WSL administration require tools outside this console.
