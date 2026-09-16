# Agent Note: Read-only remote and update checks in the self-use console

Status: implemented

English | [中文](2026-09-16-control-gui-read-only-checks.zh.md)

## Problem

The console showed local Web and Tailscale state but did not identify whether Serve forwarded the HTTPS root to DSH. Its removed updater also left no safe way to see whether the active WSL checkout already contained the current upstream commit. A green local status could be mistaken for a working iPad session, and a Windows mirror version could be mistaken for the running version.

## Decision

Two on-demand buttons write read-only commands to the existing background poller and return bounded reports in the log panel. Remote health separates local HTTP, Windows Tailscale service and backend, Serve's HTTPS root proxy target and Funnel exposure, and a proxy-free HTTPS request from this PC. It reports keyword counts rather than raw Web log lines and explicitly leaves mobile browser state unverified. Update preflight resolves the stable WSL source link, reports its branch, version, HEAD, dirty count, and an exact-HEAD backup branch if present. It queries `origin` HEAD without fetching and reports ancestry only when that commit already exists locally. Neither check changes DSH, Serve, Git refs, or user configuration.

## Alternatives considered

**Restore one-click update or Serve repair.** An automatic mutator would need a separate reviewed upgrade or network-repair workflow and could erase local work or change remote exposure from a routine console click.

**Treat a successful local HTTPS probe as mobile-session proof.** The PC probe does not use the iPad's browser state, pairing data, or Session stream, so it cannot establish mobile loading or synchronization.

**Fetch upstream objects during preflight.** Fetch would change remote-tracking refs and blur the distinction between a preview and an upgrade preparation step. The report instead states when an exact source diff is unavailable without a later reviewed fetch.

## Consequences

The checks give an actionable local-layer report without restoring removed mutation paths. They can briefly delay the background status poller while a bounded network query runs; timeouts become explicit unknown results. Serve route fixtures, a temporary Git remote, and isolated poller command tests pin the read-only behavior. The reports never claim that a remote device's session works.
