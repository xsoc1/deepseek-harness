# Agent Note: Control GUI status requires live service evidence

Status: implemented

English | [中文](2026-09-16-control-gui-live-status.zh.md)

## Problem

The self-use Windows control GUI reported DSH as running when only the Windows-side port bridge listened on 3080. It also reported Tailscale as connected when its command failed, because any output except explicit login text counted as a connection. A stopped GUI poller left its last green status file visible indefinitely.

## Decision

The poller marks Web ready only after its port check and an HTTP 200 response. It reports the listener PID as a port PID, not the WSL DSH process. Tailscale is connected only when its Windows service runs, `tailscale status --json` succeeds with `BackendState=Running`, and `Self.TailscaleIPs` contains an IPv4 address. Command execution has a 2.5-second bound. The GUI refuses status files older than 15 seconds and clears previously green indicators when the poller stops or a read fails. The build script waits for the compiler process and reads its actual exit code.

## Alternatives considered

**Treat an open TCP port as DSH health.** The Windows port bridge can remain listening after the WSL application stops, so TCP success does not prove the application responds.

**Infer Tailscale connection from human-readable CLI output.** Daemon errors are not login messages; text matching cannot distinguish those failures from a valid connection. The JSON backend state and assigned Tailnet IP supply explicit evidence.

**Keep displaying the last snapshot until a new one arrives.** A dead poller could leave green labels forever. The file timestamp gives a bounded freshness decision without adding another IPC channel.

## Consequences

Startup and transient probe failures now show an amber unknown or not-ready state instead of a false green. The status regression exercises stopped/error/running Tailscale states and the GUI's port-only, healthy, and stale snapshots; an isolated poller probe confirmed that a TCP-only listener does not make Web ready. The compiled EXE passes its smoke exit check. These checks do not claim a live user-window visual inspection or a Tailscale on/off action on the user's current connection.
