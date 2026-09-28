---
description: "Legacy system-prompt skill router for the selfuse agent preset."
kind: "package-reference"
---

# @dsh-selfuse/skill-router

English | [中文](README.zh.md)

## Summary

This legacy plugin inserts a fixed Chinese skill-routing section into the system prompt of every agent in its Cordis scope. It has no tools and does not install the skills it names. The current official skill catalog and user-selected skills should be checked before enabling this extra prompt.

## Table of Contents

- Configuration
- Model Experience
- Known Limitations and Deferred Work
- Dev Note

## Configuration

The `enabled` Boolean controls whether `apply` registers the `tool:dsh-skill-router` section at order 110. Disabling the plugin removes the section after the composition updates.

## Model Experience

### Static skill-routing section

#### What the model sees

When enabled, every agent in scope receives the fixed Chinese task-bucket and skill-name guide as the `tool:dsh-skill-router` system-prompt section. The plugin does not inspect whether each named skill is installed.

#### Token effect

The whole fixed section adds system-prompt tokens to each assembled request; it adds no tool schema or result tokens.

#### KV Cache effect

The section is stable while enabled, so an unchanged prefix can be reused by the provider's cache. Editing the plugin text or toggling it changes that prefix for later requests.

## Known Limitations and Deferred Work

- The hard-coded skill count and names may be stale relative to the current installed catalog.
- Its prescriptive workflow may conflict with user instructions or current official skill guidance; do not enable it as a substitute for inspecting actual skills.

### Dev Note

Compare the fixed section with the active skill inventory before enabling. The source is `src/index.ts`; the old build-and-inject note was a development path, not a runtime verification.
