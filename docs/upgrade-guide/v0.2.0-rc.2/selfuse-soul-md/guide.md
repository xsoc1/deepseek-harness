---
kind: upgrade-guide
description: "Private soul-md replaces its legacy Client settings with native profile configuration."
---

# Native soul-md configuration

English | [中文](guide.zh.md)

## Change

The private `@dsh-selfuse/soul-md` layer now loads `lib/index.js` and exposes native Loader configuration. The old `client.js` and settings helper no longer activate a separate settings page. The card path, order, fallback, watch and complete options remain; `maxFileBytes` defaults to 131072.

Only a missing file uses the fallback. Invalid UTF-8, oversized files and other read errors fail initial loading; watcher errors retain the previous valid card and log a warning.

## Migration

1. Preserve the persona file. Build the local package and install its profile layer through the native CLI, following the [package guide](../../../../packages/selfuse/soul-md/README.md#use-this-package).
2. Remove manually inserted Client/helper rows referring to the old package entry points. Keep the `soul-md` Host row and its configuration; use the official plugin configuration form rather than the retired page.
3. Set `maxFileBytes` if the card exceeds 128 KiB, up to 1 MiB. Use valid UTF-8. Leave `complete: false` unless intentionally replacing other prompt sections.
4. Restart the profile, check that its Loader row activates, and confirm a saved card affects subsequent prompts. A missing card can be created after startup; atomic file replacement remains watched. No Session or persona file migration is performed.
