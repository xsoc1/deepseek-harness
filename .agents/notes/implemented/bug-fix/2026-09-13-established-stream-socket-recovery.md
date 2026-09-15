# Agent Note: Recover an established Remote stream socket once

Status: implemented

English | [中文](2026-09-13-established-stream-socket-recovery.zh.md)

## Problem

After an iPad had repeatedly reconnected through Tailnet, the full Web shell rendered but its Workspace browser stayed at an empty state even though the same production endpoint returned seven Workspaces and 295 Sessions. A fresh WebKit context loaded all seven Workspaces, so Host persistence, Tailnet reachability, and the current bundle were available. The stale page had lost its established Gateway stream socket while the independent unary Connection generation still looked connected. `RemoteStreamMuxClient.lost()` failed active logical streams but did not create another socket, so their isolated retry waited forever for a physical carrier and the Workspace opening baseline never arrived.

## Decision

When an already established mux socket is lost unexpectedly, `RemoteStreamMuxClient` immediately starts exactly one replacement candidate. Active logical streams still fail first, allowing `RemoteStream` to open a fresh physical generation with a new wire stream id and accept a replacement baseline. Initial connection failures remain owner-driven, and a replacement candidate that fails before opening does not schedule itself recursively. Explicit reconnect and disposal detach the old socket before closing it, so their close events cannot create an unwanted candidate.

## Alternatives considered

**Restore the browser-visible heartbeat deadline.** That deadline caused the continuous iOS reconnect regression and is not required to replace a socket that the browser already reports as closed.

**Retry every failed connection indefinitely inside Gateway.** Connection already owns capped retry timing. Recursive candidate retries would create a second scheduler and recreate the reconnect storm.

**Add a Workspace-only refresh button or polling loop.** The physical mux is shared by Workspace, Session, and forwarded event streams. Repairing the carrier boundary restores every logical stream through its existing domain baseline instead of hiding one symptom.

## Consequences

A transient loss after successful WebSocket establishment now causes one immediate new handshake. If that handshake succeeds, snapshot consumers replace their state from the Host baseline; if it fails before opening, Gateway stops and leaves subsequent scheduling to Connection. No application heartbeat, unbounded retry loop, Session polling, or mutation replay is introduced.

## Testing

The regression drives the real `RemoteStream` over a fake `RemoteStreamMuxClient`: after the first established socket drops before the Workspace baseline, it expects a second socket and a generation-two baseline. Before the fix it failed because the socket count remained one; after the fix it passes. Lifecycle coverage also proves an initial failed candidate remains owner-driven, one established drop creates one candidate, a failed candidate does not recurse, and disposal cancels a pending replacement. After deployment, a production WebKit probe at the iPad viewport suppressed the first `workspace/follow` send and closed that mux socket. It observed the first socket close, one replacement stay open, seven Workspace rows and thirteen tree items, with no page exception or failed request. The probe was then removed.
