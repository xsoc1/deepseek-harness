# Agent Note: Bound the self-use remote cold-boot payload

Status: implemented

English | [中文](2026-09-13-remote-cold-boot-payload.zh.md)

## Problem

The complete Web UI could return its HTML over the iPad Tailnet path but remain on `Loading plugins…` without reaching the workspace screen. The live peer alternated between direct IPv6 and Hong Kong DERP and frequently timed out, so the failure needed to be separated from Safari syntax compatibility and server availability.

A cold root advertised 18 startup bundles. Official WebServer gzip was already active, but those bundles still transferred 4,708,460 bytes. One four-entry bundle containing `ui-sidebar-documentpreview` accounted for 3,248,434 compressed bytes because that optional preview eagerly embeds PDF.js, its Worker, CMaps, fonts, and WASM even when no document is opened.

## Decision

The self-use profile manifest owns a `disabledRows` list of stable Cordis row IDs inherited from official bundles. Its generator emits these overrides before the ordinary self-use plugin inserts. The list disables `ui-sidebar-documentpreview` for this deployment.

This is a profile-level customization, not a fork of the official document-preview implementation or the WebServer. The official file tree and right Sidebar remain enabled. The generator regression test also asserts that the disabled row still exists in the current official Web bundle, so an upstream rename fails visibly during maintenance.

## Alternatives considered

**Add compression in client-modules.** Rejected after inspecting the current official composition: `dsh-host-webserver` already negotiates gzip for the complete HTTP surface. A second bundle-specific compressor would duplicate the transport layer and would not remove the multi-megabyte eager PDF payload.

**Treat Safari as incompatible.** Rejected by current WebKit probes, including a run without `Promise.withResolvers`; both reached the workspace screen without script or resource failures.

**Change MTU or force a Tailscale relay path.** Packet-size probes did not correlate failures with payload size, and a temporary Windows proxy-bypass experiment did not improve the iPad peer's endpoint churn. Those experimental network changes were reverted.

**Rewrite PDF preview for lazy assets.** This is a broader upstream architecture change. The self-use deployment has no requirement strong enough to justify carrying that fork while the profile can omit the optional viewer cleanly.

## Consequences

Cold startup bundle transfer falls from 4,708,460 to 1,516,914 compressed bytes. Under the same deterministic 1 Mbps download, 400 ms latency probe, the pre-change page remained on `Loading plugins…` after 26.4 seconds; the configured profile reached the workspace chooser in 16.1 seconds with no failed resources or JavaScript exceptions. Current WebKit reached the same UI in 2.0 seconds on the unthrottled Tailnet URL.

The right Sidebar no longer previews Markdown, code, images, HTML, or PDF through the official document-preview tab. Files remain navigable, and the change is reversible by removing the row ID from `disabledRows` and regenerating the profile. Tailnet endpoint instability remains an independent network condition; the smaller bounded startup reduces its impact but does not claim to repair the iPad's link.
