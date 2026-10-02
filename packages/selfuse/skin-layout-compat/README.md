---
description: "Keep the layout attributes required by retained Skin Center assets."
kind: "package-reference"
---

# Skin layout compatibility

English | [中文](README.zh.md)

## Summary

This browser-only leaf replaces the layout shim formerly carried by `web-ui-all`. Skin Center loads it as a dependency; it adds no settings page, plugin catalog, model tools or prompt text. The Host entry has no behavior.

## Table of Contents

- [Behavior](#behavior)
- [Verification](#verification)
- [Known Limitations and Deferred Work](#limitations)
- [Dev Note](#dev-note)

-----

<a id="behavior"></a>
## Behavior

The client marks existing sidebar, conversation and legacy details columns with `data-pane`, and the sidebar parent with `data-dsh-frame`. Existing attributes are left untouched. One animation frame batches child-list mutations; unload cancels pending work, disconnects the observer and removes only attributes still owned by this plugin. Detached subtrees are released.

There is no `./invariant` companion: this package owns only disposable DOM attributes, with no independent authoritative state whose observations can diverge. Loader lifecycle tests verify attribute ownership and teardown instead.

<a id="verification"></a>
## Verification

From the repository root, run `pnpm exec vitest run packages/selfuse/skin-layout-compat/tests/layout.client.spec.ts` and `pnpm --filter @dsh-selfuse/skin-layout-compat run build`. Tests cover real Loader activation, disable/re-enable, replaced layout nodes, attribute ownership and cancellation. These checks do not establish visual acceptance of the prebuilt Skin Center or activation in the signed Desktop.

After building, `node --test packages/selfuse/skin-layout-compat/tests/built-client.spec.mjs` executes the emitted browser factory and verifies activation and disposal in jsdom.

<a id="limitations"></a>
## Known Limitations and Deferred Work

- Selectors still depend on official layout class fragments. An upstream DOM change requires adapter tests and visual verification. This leaf does not restore retired settings or community pages, rebuild Skin Center's missing source, or install any plugin into the user's Desktop profile.

<a id="dev-note"></a>
## Dev Note

No invariant companion is published because the owned DOM attributes are browser-only; Loader lifecycle tests verify ownership and cleanup.

Keep this adapter limited to attributes consumed by Skin Center assets. Build and test it from this workspace; do not copy the retired aggregate back into the active package graph.
