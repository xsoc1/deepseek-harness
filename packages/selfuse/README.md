---
description: "Map the integrated selfuse package layer and its deployment ownership."
kind: "package-group"
---

# Selfuse packages

English | [中文](README.zh.md)

## Summary

This group contains integrated local and third-party packages used or retained by the selfuse DSH deployment. A package being present here does not mean it is enabled in the active profile. Official DSH source, candidate upgrades, selfuse configuration, and generated runtime state have distinct owners and must not be overwritten interchangeably.

## Table of Contents

- Ownership
- Deployment
- Historical sessions
- Package status
- Dev Note

## Ownership

The official repository is tracked separately from selfuse changes. `config/selfuse/` defines deployment composition and presets; this directory contains integrated package code or compatibility artifacts; `scripts/selfuse/` generates, installs, and checks the deployment. The active DSH home contains generated profiles, settings, skills, and session data and is not the only source of configuration truth.

## Deployment

The live service remains on its existing checkout until an isolated candidate passes build, package tests, full documentation gates, and an application smoke. `scripts/selfuse/generate-profile.mjs` generates a candidate profile; `scripts/selfuse/install.mjs` installs a selected candidate. Neither command should be run against the live DSH home merely to satisfy a documentation gate.

## Historical sessions

Session headers retain their original preset ids. Preserve or remap those ids before resuming old sessions; otherwise a new session may work while resume fails. The pre-start `--presets-only` path fills missing standard presets without overwriting profile settings or skills.

## Package status

The directory includes active selfuse packages, retired or inactive packages such as the old market and WSL workspace bundle, and frozen compatibility artifacts for old desktop integrations. Inspect the generated profile rather than assuming every manifest is loaded. The current official CLI is preferred where it duplicates a browser plugin.

### Dev Note

For this upgrade, use the isolated candidate checkout and a disposable DSH home first. Record the exact official revision, third-party origins, tests, and remaining unverified runtime behavior in `AGENTS.md` and the selfuse deployment guide before a release.
