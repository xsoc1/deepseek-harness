# Agent Note: Trust the configured Tailnet host after an offline boot

Status: implemented

English | [中文](2026-09-16-tailnet-host-offline-boot.zh.md)

## Problem

The Windows launcher obtained the DSH `--trusted-host` value only from `tailscale status --json`. If Tailscale was unavailable when DSH started, the Web server omitted the Tailnet hostname. Starting Tailscale later restored HTTPS, but `/api/remote.mux` still rejected the Tailnet Host and Origin with HTTP 403, leaving the remote page reconnecting.

## Decision

The launcher also reads `remote-web-ui.publicBaseUrl` from the active WSL `settings.yaml` after starting WSL. It accepts only an HTTPS root URL with a hostname under `*.ts.net`, no credentials, query, fragment, or non-default port. A live Tailscale CLI hostname takes precedence; otherwise the configured hostname becomes `--trusted-host`. Tailscale Serve management remains conditional on the live CLI.

## Alternatives considered

**Wait for Tailscale before starting DSH.** This would make local DSH availability depend on a separate network service and still leave a restart-order race.

**Trust every Tailnet hostname.** A wildcard would enlarge the Web server's accepted Host and Origin set beyond the configured remote endpoint.

## Consequences

DSH can start while Tailscale is down and accept the configured remote hostname when the private Serve path returns. The regression test rejects unrelated and malformed URLs. The observed WebSocket handshake changed from HTTP 403 to open through the Tailnet HTTPS endpoint after restarting DSH with the new argument. This server-side result does not establish the iPad's current connection quality.
