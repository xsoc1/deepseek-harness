---
description: "Add pairing-gated remote desktop access, device revocation, and optional tunnel management to a dsh Web profile."
kind: "package-bundle"
---

# @dsh-selfuse/remote-web-ui

English | [中文](README.zh.md)

## Summary

This profile layer lets another computer open the complete dsh Web UI through a one-time pairing link. The primary computer can issue QR links, inspect device presence, revoke devices, and optionally run a Cloudflare tunnel. Install it directly or through `@dsh-selfuse/web-ui-all`; remove the layer to disable its pairing and remote-proxy routes. It does not provide a separate mobile UI.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

### Install into a profile

Install this bundle directly, or install the family aggregate that already carries it:

```text
dsh plugin --profile <name> add @dsh-selfuse/remote-web-ui
dsh plugin --profile <name> remove @dsh-selfuse/remote-web-ui
```

The package manifest declares `dsh.bundle.patch`, and profile reconciliation mounts the Host and Web faces from one `cordis.patch.yml` row.

### Pair a remote computer

1. Open the primary Web UI from `http://127.0.0.1:3080` and select **Remote access**.
2. Select the reachable network address, refresh the QR code when necessary, and copy the remote-device pairing link.
3. Open the link on the other computer. A successful accept stores the revocable device cookie, removes the one-time token from the address bar, and reloads the complete Web UI.
4. Use **Stop** to revoke every device, or revoke one device from the authorized-device list.

The pairing link points to `/?pair=...`. The package does not serve `/m`, `/m/`, `/m/api/*`, a mobile bundle, or a PWA worker.

### Choose the network path

A LAN address works only while both computers can reach that address. `publicBaseUrl` can name an HTTPS reverse tunnel. `autoTunnel` starts an anonymous Cloudflare quick tunnel, whose hostname changes whenever the tunnel restarts.

Tailscale Serve can proxy the stable tailnet hostname to `http://127.0.0.1:3080`. That hostname is tailnet-only: the remote computer must be online in the same Tailnet, even when the dsh Host and Serve process are healthy. Do not use `--trusted-host` merely to enable pairing; it opens the normal `/api` channel for that Host and bypasses the plugin's paired `/remote/api` channel.

### Configuration

| Field | Default | Effect |
|---|---:|---|
| `enabled` | `true` | Mount the entry, pairing routes, remote routes, and access fence. |
| `tokenTtlMs` | `600000` | Lifetime of a one-time pairing token. |
| `offlineAfterMs` | `25000` | Time without activity before a paired device appears offline. |
| `maxDevices` | `4` | Maximum stored device sessions; the oldest is evicted. |
| `idleExpireMs` | `604800000` | Delete a device session after this idle period. |
| `cookieName` | `dsh_pair` | Cookie that carries the device-session id. |
| `requirePairingForLan` | `true` | Route non-loopback desktop traffic through paired `/remote/api`. |
| `publicBaseUrl` | unset | Base URL used for pairing links when no automatic tunnel runs. |
| `devicesFile` | `$DSH_HOME/remote-web-ui-devices.json` | Persistent device-session file. |
| `autoTunnel` | `false` | Start and manage a Cloudflare quick tunnel. |

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

[`cordis.patch.yml`](cordis.patch.yml) inserts one dual-face plugin. [`src/index.ts`](src/index.ts) owns pairing state, route installation, the access fence, presence, tunnel lifecycle, and remote desktop proxy routes. [`src/client/index.ts`](src/client/index.ts) owns the settings and pairing panels, accepts pairing links, sends presence heartbeats from non-loopback desktop pages, and selects the paired remote channel when configured.

The Host refuses unpaired `/remote/api` requests before buffering their request body. Remote requests are re-issued to loopback without forwarding the remote Origin or pairing cookie. Settings, credentials, update controls, native dialogs, and plugin-management control endpoints remain loopback-only.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Profile composition](../../../docs/architecture.md)
- [Cordis configuration](../../../docs/cordis-primer.md)

-----

<a id="model-experience"></a>
## Model Experience

### Remote desktop transport

#### What the model sees

Nothing from this package enters a model request. The bundle only chooses whether a paired browser reaches the existing Web runtime through `/remote/api`; it does not add prompts, tools, messages, attachments, or session events.

#### Token effect

None. Pairing state, presence heartbeats, and browser transport metadata are handled outside the conversation, so they consume no model input or output tokens.

#### KV Cache effect

None. The package does not change the model prompt prefix or conversation content, so it does not invalidate or expand the model KV cache.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- A paired request already in flight can finish after revocation; the next request is rejected.
- The one-time pairing token is not persisted. Device sessions are persisted and remain valid across a Web restart until revoked or idle-expired.
- Cloudflare quick-tunnel addresses are temporary and have no uptime guarantee. Use a named tunnel or Tailscale Serve for a stable hostname.
- Tailscale Serve does not make the page public. A remote computer that is offline from the Tailnet cannot open the tailnet hostname.
- The complete desktop UI is the only remote interface. Small-screen layout follows the main Web UI and has no separate mobile optimization.
- The locally maintained deployment can disable the paired remote channel and trust a Tailscale Host directly. That mode relies entirely on Tailnet membership and must not be exposed as a public URL.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

Reintroduce a separate mobile client only when a current user and an end-to-end mobile verification owner exist. A new client must not share privileged desktop control routes by default.

</details>
