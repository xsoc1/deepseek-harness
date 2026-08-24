# dsh-selfuse scripts

## `generate-profile.mjs`
Reads `config/selfuse/profiles.build.yml` and writes a profile under
`$DSH_HOME/profiles/<name>` that references only `@dsh-selfuse/*` bundles.

Because the selfuse packages are registered in `apps/cli/package.json`, the
running dsh installation resolves them first; the generated profile contains
no out-of-tree npm dependencies.

```bash
node scripts/selfuse/generate-profile.mjs --dsh-home /home/user/.dsh
```

## `install.mjs`
One-command local deployment:
1. Checks `apps/cli` has the selfuse dependencies.
2. Runs the profile generator.
3. Copies `config/selfuse/settings.yaml` to `$DSH_HOME/settings.yaml`.
4. Copies vendored skills from `config/selfuse/skills` to `$DSH_HOME/skills`
   (real copies, no junctions).

```bash
node scripts/selfuse/install.mjs --dsh-home /home/user/.dsh --force
node scripts/selfuse/install.mjs --dsh-home /home/user/.dsh --dry-run
```

Restart dsh after installing to load the new profile.

## `update.mjs`

Selfuse-aware updater. It fetches upstream `deepseek-ai/deepseek-harness`
master through the IP fallback, merges it into the current `selfuse` branch
(no history rewrite), reinstalls dependencies, rebuilds absorbed packages,
and refreshes the profile/settings/skills.

```bash
node scripts/selfuse/update.mjs --check
node scripts/selfuse/update.mjs --apply --restart
```

Safety:
- refuses to apply when tracked files are dirty;
- does not restart dsh unless `--restart` is passed;
- backs up generated profile files before refreshing.
