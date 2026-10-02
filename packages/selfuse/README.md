---
description: "Map the integrated selfuse package layer and its deployment ownership."
kind: "package-group"
---

# Selfuse packages

English | [中文](README.zh.md)

## Summary

This group contains retained local and third-party integrations for development and compatibility testing. Directory presence does not imply activation in the official Windows Desktop. The Desktop runtime, this WSL source checkout, and generated candidate profiles have separate owners. Retired integrations are archived outside the build workspace.

## Table of Contents

- [Packages](#packages)
- [Related documentation](#related-documentation)
- [Dev Note](#dev-note)

-----

<a id="packages"></a>
## Packages

Retained packages have independent activation and verification requirements:

| Package | Role |
|---|---|
| [backup](backup/README.md) | Backup and restore controls |
| [content-risk-guard](content-risk-guard/README.md) | Local private-content checks |
| [task-notify](task-notify/README.md) | Retained turn-completion notifications |
| [git-workflow](git-workflow/README.md) | Git workflow integration |
| [memory-panel](memory-panel/README.md) | Local Markdown memory management |
| [skin-center](skin-center/README.md) | Skin and wallpaper management |
| [skin-layout-compat](skin-layout-compat/README.md) | Skin-only layout attribute adapter |
| [soul-md](soul-md/README.md) | Personal context file integration |
| [plugin-mount](plugin-mount/README.md) | Root-scoped Host activation guard |
| [web-ui-git-graph](web-ui-git-graph/README.md) | Git graph and branch selection |

<a id="related-documentation"></a>
## Related documentation

- [Selfuse configuration](../../config/selfuse/profiles.build.yml) — development candidate composition and legacy preset aliases.
- [Selfuse scripts](../../scripts/selfuse/README.md) — isolated generation and installation; not the live Desktop launcher.
- `xsoc1/dsh-selfuse/docs/current-deployment.md` — official Desktop installation and archived sessions.

<a id="dev-note"></a>
## Dev Note

Five retired EAC integrations, market, skill-router and wsl-workspace are outside this checkout in the local `dsh-retired-20261001/source-packages` archive. task-notify remains a candidate dependency. Use disposable homes for source tests; preserve historical session headers and verify Desktop behavior independently. Full gates must pass before publication.

The old settings group, community catalog, skins carrier and web-ui-all are archived in `dsh-retired-20261001/native-ui-packages`. Candidate profiles load Git graph and Skin Center directly. SSH, task-board, MinerU and their obsolete ClientRuntime/ApiProxy packages are archived in `dsh-retired-20261001/conditional-packages`; use official SSH and scheduled tasks instead. Plugin data and sessions remain untouched.
