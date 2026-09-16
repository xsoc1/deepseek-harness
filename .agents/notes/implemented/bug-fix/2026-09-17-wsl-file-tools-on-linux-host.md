# Agent Note: WSL file tools use host-native coordinates

Status: implemented

English | [中文](2026-09-17-wsl-file-tools-on-linux-host.zh.md)

## Problem

The WSL preset variants mount `WslFileSystem` regardless of whether the DSH host runs on Windows or inside WSL. The provider translated Linux and `/mnt/<drive>` paths to Windows UNC and drive coordinates before calling `LocalFileSystem`. On a Linux host, Node interpreted those coordinates as relative paths beneath the process directory. `read`, `write`, `edit`, and `str_replace_editor` then failed before opening the requested file.

## Decision

`WslFileSystem` keeps the existing `wsl-*` preset identities and chooses coordinates at the filesystem boundary. A Windows host retains the UNC/drive and 9P publication behavior. A Linux host opens native Linux paths, maps Windows drive paths to `/mnt/<drive>`, and maps UNC paths only when their distribution matches `WSL_DISTRO_NAME`. Identity and containment use the host-native realpaths from `LocalFileSystem`; model-visible paths remain Linux paths. Linux publication uses the parent's native atomic implementation, while the Windows 9P override remains Windows-only.

The selected shell username does not change the DSH host account that opens files. A Linux-hosted DSH does not silently map an UNC path for another distribution into its own filesystem.

## Alternatives considered

**Remove `WslFileSystem` from WSL presets on Linux hosts.** Rejected because persisted sessions refer to the `wsl-*` presets and need their filesystem and shell composition to remain stable.

**Translate every path through `wslpath` or a Windows host proxy.** Rejected because WSL already exposes the requested files natively to its Node process; another translation or transport would add a failure boundary and obscure the file policy's host identity.

## Consequences

The four file tools and the filesystem service use the same Linux coordinates on a WSL host, including real DrvFs files. Cross-distribution UNC access from a Linux host fails explicitly. The package's focused build emits only the changed `lib/fs.js` artifact; the selfuse updater invokes that build without rebuilding the unrelated browser bundle.

The regression test runs the four tools through a Cordis context and checks the real `/mnt/f` mount when available. Windows 9P behavior is retained by an unchanged branch, but this Linux run does not constitute a Windows runtime test.
