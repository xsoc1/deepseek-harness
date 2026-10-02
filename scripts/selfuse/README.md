# dsh-selfuse scripts

English | [中文](README.zh.md)

## `generate-profile.mjs`
Reads `config/selfuse/profiles.build.yml` and writes a profile under
`$DSH_HOME/profiles/<name>` that references only `@dsh-selfuse/*` bundles.
The manifest's `disabledRows` list records stable row IDs inherited from
official bundles that this personal profile intentionally leaves inactive,
while `rowConfigs` records selfuse-specific configuration replacements. The
generator writes both kinds of managed override before ordinary plugin inserts.
In `rowConfigs`, paths beginning with `${DSH_HOME}/` resolve against the
selected `--dsh-home`, so a disposable test home never points at live memory.
If a profile contains local account, model, or permission rows, place them after
`# Local instance overrides (preserved by profile generator).`; regeneration
keeps that suffix. Do not duplicate managed row IDs in the local suffix: the
later row can replace the managed configuration. The manifest maps retired
selfuse preset IDs to official modes for existing sessions; this restores
loading, but cannot reproduce the retired preset's exact tool composition.

Because selfuse packages are registered in `apps/cli/package.json`, the
running DSH installation resolves them first. Dependencies installed through
the native `dsh plugin` CLI remain in the generated profile.

```bash
node scripts/selfuse/generate-profile.mjs --dsh-home /home/user/.dsh
```

## `install.mjs`
One-command local deployment:
1. Checks `apps/cli` has the selfuse dependencies.
2. Runs the profile generator.
3. Copies `config/selfuse/settings.yaml` to `$DSH_HOME/settings.yaml`.
4. Copies canonical presets from `config/selfuse/agent-presets` to
   `$DSH_HOME/.agent-presets`.
5. Copies vendored skills from `config/selfuse/skills` to `$DSH_HOME/skills`
   (real copies, no junctions).

```bash
node scripts/selfuse/install.mjs --dsh-home /home/user/.dsh --force
node scripts/selfuse/install.mjs --dsh-home /home/user/.dsh --dry-run
node scripts/selfuse/install.mjs --dsh-home /home/user/.dsh --presets-only
```

`--presets-only` is used by the Web startup preflight. It repairs missing
canonical presets without changing the generated profile, settings, or skills.

Restart dsh after installing to load the new profile.

## `build:selfuse`

The candidate composition loads Git graph and Skin Center directly. Skin Center owns the small `skin-layout-compat` leaf. Settings/community/skins/all, SSH/task-board/MinerU and their unused ClientRuntime/ApiProxy SDKs are archived outside the workspace. The manifest's `retiredPackages` prevents regeneration from restoring these nine dependencies from an old profile, while unrelated CLI-installed plugins remain intact. SSH and scheduled work use native capabilities. Do not run this development generator against the official Desktop home.

`pnpm run build` compiles the active private selfuse packages after the official libraries and before Web assets. Run `pnpm run build:selfuse` after a local private-plugin edit when a complete rebuild is unnecessary. Selection comes from `config/selfuse/profiles.build.yml`; a private selected package without a real build script is rejected, not silently accepted as a frozen artifact. A build failure stops `update.mjs` before it refreshes the live profile; `--no-build` explicitly reuses existing artifacts and does not establish compatibility.

## `archive-conditional.mjs`

The user-approved SSH/task-board/MinerU directories and their unused SDKs are preserved outside the checkout. `--move` refuses existing destinations, checks literal source and archive roots, and records file hashes and symlink targets before and after renaming. `--verify` checks that the originals remain absent and the archived inventory is unchanged. It never reads or moves plugin data or sessions.

```sh
node scripts/selfuse/archive-conditional.mjs --verify
```

## `update.mjs`

Selfuse-aware updater. It fetches upstream `deepseek-ai/deepseek-harness`
master over verified TLS, merges it into the current `selfuse` branch
(no history rewrite), reinstalls dependencies, rebuilds active private packages,
and refreshes the profile/settings/skills.
When WSL cannot fetch the remote, set `DSH_SELFUSE_UPSTREAM_BUNDLE` to a locally transferred Git bundle carrying `refs/remotes/origin/master`; the updater verifies that the file exists and uses its commit history without disabling TLS verification.

```bash
node scripts/selfuse/update.mjs --check
node scripts/selfuse/update.mjs --apply --restart
```

Safety:
- refuses to apply when tracked files are dirty;
- does not restart dsh unless `--restart` is passed;
- backs up generated profile files before refreshing.

## Legacy Windows/Web management scripts

These scripts implement the retired WSL Web launcher and watchdog; they do not start or update the official Desktop. On 2026-09-30 the user abandoned the remote plugin, the Web profile, Serve mapping, and watchdog tasks were retired, and the WinForms console package was removed from this checkout. The scripts remain only to inspect the old deployment behavior. See `xsoc1/dsh-selfuse/docs/current-deployment.md` for the current installation.
