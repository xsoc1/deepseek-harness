# Agent Note: Browser-visible Remote stream heartbeat experiment

Status: implemented

English | [中文](2026-09-13-browser-visible-stream-heartbeat.zh.md)

## Problem

A browser WebSocket can remain `OPEN` while application messages no longer reach JavaScript. Safari and a path-changing VPN or tunnel can keep answering protocol-level Ping frames inside the networking stack even though the page receives neither incremental reasoning nor the terminal Session event. Host-side Ping/Pong therefore reports a healthy carrier, Connection receives no source failure to trigger its retry policy, and the remote page can display a completed Host turn as still thinking indefinitely.

## Decision

The bundled `RemoteStreamMuxClient` does not advertise the `dsh-application-heartbeat-v1` WebSocket subprotocol. `RemoteStreamMuxServer` retains dormant opt-in support and sends a strict `{ type: 'heartbeat', timeoutMs }` text frame beside each WebSocket Ping only if a future specialized Client explicitly negotiates that protocol. Native Ping/Pong remains responsible for Host-side peer detection and intermediary keepalive. The initial experiment, now rolled back, made the bundled Client advertise the protocol because browser JavaScript cannot observe WebSocket control frames.

In that experiment, `RemoteStreamMuxClient` reset one generation-scoped timer on each validated application heartbeat. Expiry produced `RemoteStreamCarrierError`, failed every logical stream on that physical socket, and closed it with the private `4001` heartbeat-timeout code. The existing `$events` source failure then returned control to [`ConnectionController`](../../../../packages/client/connection/src/client/connection.ts), which owns retry timing, replaces the mux socket, and reopens the event generation. This unconditional Client deadline is no longer present.

The wire parser accepts only the exact heartbeat keys and a positive integer timeout inside the browser timer range. A malformed heartbeat remains a protocol failure. No separate recovery scheduler, Session polling loop, or remote-UI-only watchdog is introduced.

## Production rollback

The bundled `RemoteStreamMuxClient` no longer advertises the subprotocol or arms the text-heartbeat deadline. On the production iPad/Tailnet path, missed application frames made that unconditional deadline close the carrier repeatedly and left the UI in continuous reconnect. The Host keeps the opt-in protocol for compatibility, but it remains dormant unless a future specialized Client explicitly negotiates it. Native Ping/Pong and ordinary WebSocket failures continue to drive Connection recovery. A safer half-open recovery mechanism must validate the path without imposing an unconditional mobile close deadline.

## Alternatives considered

**Use only WebSocket Ping/Pong.** Browser code cannot observe control frames, and Safari may answer Pong below the JavaScript layer while business delivery is stalled. This is the failure mode the change must distinguish.

**Treat any ordinary Remote item as activity.** An idle but healthy `$events` stream may legitimately have no business item for an arbitrary period, so silence has no safe domain-level deadline. A dedicated heartbeat separates carrier liveness from Session activity.

**Poll Session state from the remote UI.** Polling duplicates the event transport, repairs only one consumer, and can race with incremental reasoning. Failing the shared carrier lets every Remote stream use the existing generation reset and domain-owned replay semantics.

**Add another reconnect loop inside Gateway.** Connection already owns continuous jittered retries and handshake deadlines. A second scheduler would create overlapping attempts and ambiguous ownership; Gateway reports carrier failure and leaves scheduling to Connection.

## Consequences

Ordinary browser sockets receive no application-heartbeat text frames and have no heartbeat-driven `4001` close deadline. The six-second selfuse experiment detected half-open delivery sooner but repeatedly killed an iPad connection whose Tailnet path had three consecutive probe timeouts before recovering, so stable mobile transport takes precedence. Protocol-level loss remains detectable by Host Ping/Pong and ordinary WebSocket failures. The earlier half-open business-delivery problem is therefore not claimed as solved; any replacement must validate the path without imposing an unconditional mobile deadline.

## Testing

Protocol tests accept the exact heartbeat and reject invalid timeouts or extra keys. Host carrier coverage verifies that a negotiated Client receives both Ping and the derived application timeout, while a Client without the subprotocol receives no application frame; Gateway integration verifies the configured cadence. Client fake-timer coverage reproduces an open socket whose application heartbeat stops and verifies carrier failure plus the `4001` close. A live browser diagnostic drops only Host-to-page WebSocket data while leaving the socket open, waits for Host `turn/end`, and verifies that heartbeat expiry causes a fresh socket and restores the final Session state.

The rollback adds a Client regression proving that the bundled browser does not opt in. Production instrumentation reproduced an abnormal close followed by reconnect, then observed the replacement no-protocol socket remain stable for forty seconds. A clean Tailnet probe subsequently held the production mux open for forty-five seconds, received one ready frame and four native Ping frames, received no application heartbeat, and closed normally only when the probe ended. The temporary instrumentation and probe were removed.
