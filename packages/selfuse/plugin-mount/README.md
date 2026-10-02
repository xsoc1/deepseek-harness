---
description: "Deduplicate optional Host plugin copies within one Cordis root."
kind: "package-reference"
---

# @dsh-selfuse/plugin-mount

English | [中文](README.zh.md)

## Summary

This private utility owns the lifecycle guard shared by Skin Center and Git graph. It suppresses a duplicate package mount only within the same Cordis root, not across independent applications. The first fiber removes its marker on disposal; duplicate fibers do not own the marker. It adds no prompt, model tool, UI or independently activated Loader row.

## Table of Contents

- [Behavior](#behavior)
- [Dev Note](#dev-note)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)

<a id="behavior"></a>
## Behavior

Wrap an apply function with `mountOnce(packageName, apply)`. Linked and installed copies share a symbol-keyed WeakMap of roots; roots can be collected after disposal. The utility invokes the first apply synchronously and keeps its configuration type. This implementation is adapted from the upstream dsh-web-ui Host guard; its original BSD license is retained in [LICENSE](LICENSE).

<a id="dev-note"></a>
## Dev Note

Run `scripts/selfuse/mount-once.spec.ts` for independent roots, duplicate disposal and remount. Build this dependency before the two consuming Host bundles. No invariant companion is published because the guard owns its marker directly and has no independently observable service state or Session projection.

<a id="model-experience"></a>
## Model Experience

### Mount guard

#### What the model sees

None. `mountOnce` registers no tools, prompts, resources or Session events.

#### Token effect

The guard adds no model tokens; consuming plugins own their contributions.

#### KV Cache effect

The guard does not change model request content or provider cache reuse.

## Known Limitations and Deferred Work
<a id="known-limitations-and-deferred-work"></a>

- This is a lifetime guard, not leader election. A suppressed duplicate does not activate automatically when the owner unloads; reload it explicitly.
- Failed apply functions rely on Cordis fiber disposal to release their marker. The helper does not retry or conceal activation errors.
