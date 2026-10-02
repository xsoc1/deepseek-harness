---
description: "Keep detected network configuration local, block contaminated model requests, and inspect or change allowlisted YAML profiles without exposing their secrets."
kind: "package-reference"
---

# @dsh-selfuse/content-risk-guard

English | [中文](README.zh.md)

## Summary

Keep recognized network configurations out of model requests while retaining their originals in a private local directory. Inspect safe facts through a session-scoped handle, or configure an allowlisted YAML profile for approved local-only changes. Earlier sessions containing raw network text stop before provider dispatch; start a clean session instead of resuming them. The classifier is not a universal secret detector or a way to disable provider policy.

## Table of Contents

- [Behavior](#behavior)
- [Configuration](#configuration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

<a id="behavior"></a>
## Behavior

The plugin detects proxy configuration blocks, proxy protocol links, and subscription links in tool text. Before a result enters model-visible tool history, it stores the original text under the local DSH home with private file permissions and substitutes an opaque `local-result:<handle>` notice. Unrelated text results remain unchanged. The model can call `inspect_local_network_result` with that handle to obtain counts and flags; the tool never returns the original hostnames, node names, URLs, or credentials. Handles are scoped to the originating session, and old files are removed opportunistically after the configured retention period.

The same rule covers numbered `read` output, JSON-wrapped `run_code` text, and sub-call log copies. A direct tool reference to an allowlisted profile path isolates even a partial result without a recognizable header. If a selected result cannot be saved, the plugin returns a safe error instead of the original text. Immediately before any adapter receives a request, the plugin checks model-bound messages, system text, and tool schemas; recognized network content or an uninspectable request produces `LOCAL_PRIVATE_CONTENT_BLOCKED` without dispatch. It neither edits old session logs nor retries an upstream rejection.

With an explicit `profiles` allowlist, the model can list profile aliases and inspect counts, flags, and a SHA-256 hash without seeing a path or raw YAML. Changing `tun.enable`, `dns.enable`, or `mode`, and restoring a backup, require the Harness human-approval channel; absence of approval denies the write. Each changed file gets an owner-only backup before an atomic replacement. The tool does not accept endpoints, node names, or credentials as edit arguments.

<a id="configuration"></a>
## Configuration

Mount the plugin with the normal Cordis loader. The development selfuse profile includes it; the retired Web service and the signed Windows Desktop profile are not updated by editing that candidate:

```yaml
- name: '@dsh-selfuse/content-risk-guard'
  config:
    enabled: true
    profiles: []
```

Optional plugin config fields:

| Field | Default | Meaning |
|---|---|---|
| `enabled` | `true` | Enable local result isolation and request checking. |
| `privateRoot` | `$DSH_HOME/private-content-risk` | Absolute owner-only storage directory. |
| `retentionHours` | `24` | Opportunistic expiry of retained tool results. |
| `maxStoredBytes` | `5000000` | Maximum UTF-8 bytes per retained result or profile. |
| `profiles` | `[]` | Unique non-secret aliases paired with absolute local YAML paths; only configured files permit local profile tools. |

An empty `privateRoot` selects `$DSH_HOME/private-content-risk`; a non-empty value must be absolute. Each `profiles` item has an `id` and an absolute `path`; keep the profile on a local, non-synced filesystem when possible. The private directory must belong to the current user and deny group/other access; retained results and backups use mode `0600`. Same-account processes can still read them. To change credential values, use a local editor or user-controlled interface outside the model chat; this package intentionally has no credential-edit tool.

## Model Experience

### Detected network tool result

#### What the model sees

The selected text block is replaced by `local-result:<handle> — network configuration held on this machine. Use inspect_local_network_result for safe facts.` Other blocks and ordinary tool results remain unchanged. The inspection tool returns only byte size, proxy/group/link counts, and `tun`/`dns` flags. The profile tools return aliases, safe facts, hashes, and backup handles. A contaminated historical request stops with `LOCAL_PRIVATE_CONTENT_BLOCKED` before provider dispatch.

#### Token effect

One fixed-size notice replaces each detected text block. A later inspection or profile call adds one tool request and one bounded JSON result; no raw network text enters those results through this plugin. A blocked request produces no provider tokens.

#### KV Cache effect

Each new tool result appends a notice rather than the original text. The handle changes per execution; a repeated identical tool result therefore does not reuse the same appended suffix. A blocked old session cannot reuse its prior provider cache until the user starts a clean session.

## Known Limitations and Deferred Work

- **Classifier coverage:** The pattern detector can miss unknown or fragmented formats and can select harmless examples. Matching an allowlisted file path covers direct references only; indirect scripts can still hide the file they read. This does not predict an upstream provider's policy decision or guarantee that every secret stays local.
- **Local isolation:** Private file permissions do not isolate other processes running as the same user. `inspect_local_network_result` deliberately cannot provide the full original to the model.
- **Profile edits:** The allowlisted executor changes three non-secret fields only. It does not collect new credentials in a local UI, and other YAML edits still require user-controlled local tooling.

### Dev Note

No invariant companion is published because private handle files are intentionally opaque to observers; real Agent pipeline tests verify interception, dispatch refusal and disposal.

This is a local privacy boundary, not a provider-policy bypass. The Host project inherits strict workspace source resolution and builds with `tsc -b` and tsdown; it no longer uses built Cordis declarations as a compiler-path override. Tests compose real Agent, Session, tools and approval services in disposable contexts; the Loader test controls module resolution only and checks disable/re-enable cleanup. Approval tests observe the real audit events, not a fabricated approval object. Re-run `pnpm exec vitest run packages/selfuse/content-risk-guard/tests` after pipeline changes; source composition does not establish signed Windows Desktop activation or real-provider acceptance.
