# Agent Note: Retire the remote mobile client

Status: implemented

English | [中文](2026-09-13-retire-remote-mobile-client.zh.md)

## Problem

The self-use deployment has no user for the standalone `/m/` client. Keeping it required a second application bundle, a separate RPC and SSE transport, a PWA cache, mobile-only settings, duplicated conversation rendering, and a second verification path. That maintenance cost did not improve the complete remote desktop workflow that is actually used.

## Decision

`@dsh-selfuse/remote-web-ui` provides one remote interface: the complete dsh Web UI. Pair issuance returns `/?pair=...`, successful acceptance reloads the same Web application, and the paired browser uses the existing remote desktop channel when that channel is enabled.

The Host does not register `/m`, `/m/`, `/m/api/*`, mobile static routes, or a mobile RPC transport. The build does not emit or publish a mobile bundle or PWA assets. The settings schema and settings card do not expose mobile-only composer options.

The desktop pairing panel presents one QR code and one remote-device link. Device cookies, presence heartbeats, revocation, LAN addresses, Tailscale Serve, and Cloudflare tunnel support remain part of the desktop workflow.

## Alternatives considered

**Keep `/m/` disabled but retain its source.** This would reduce runtime exposure but keep the largest maintenance and testing costs. No current consumer justifies a dormant second application.

**Redirect `/m/` to the desktop UI.** A redirect would preserve a legacy entry without a current compatibility requirement and could hide stale saved links. Returning the normal absence response makes the retired interface explicit.

**Repair both interfaces.** The mobile transport can be made resilient, but that work still leaves two conversation clients and two synchronization implementations. The deployment uses only the complete Web UI.

## Consequences

Remote computers have one pairing and rendering path, and the package has one browser build. `/m` links, installed mobile PWAs, and mobile-only settings stop working. Small screens receive the complete Web UI without a dedicated layout. Reintroduction requires a current consumer, a separately justified privilege set, and end-to-end ownership for mobile networking and session synchronization.

The route regression test pins root pairing links, and runtime verification pins the absence of the retired HTTP paths while exercising the complete desktop boot through the configured remote hostname.
