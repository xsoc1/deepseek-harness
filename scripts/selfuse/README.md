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

## 远程桌面版

详细方案与排障见：

```text
config/selfuse/remote-desktop.md
```

## Windows 控制台 / 管理脚本（已收录于仓库根）

本地运行的 Windows 侧管理脚本已随 selfuse 分支收录：

- `dsh-control.ps1`：start/restart/stop/status/ui/logs/check-update/update
- `dsh-control-gui.ps1`：WinForms 图形控制台
- `dsh-watchdog.ps1` / `dsh-watchdog.vbs`：看门狗
- `ensure-dsh-watchdog.ps1` / `ensure-dsh-watchdog.vbs`：兜底任务
- `run-dsh-web.ps1`：在 WSL 内启动 dsh web
- `scripts/update-dsh.ps1`：检查/更新上游 dsh
- `dsh.ico` / `dsh-icon.png` / `dsh-icon.svg`：控制台/图标资源

用法：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File F:\tools\deepseek-harness\dsh-control.ps1 status
powershell -NoProfile -ExecutionPolicy Bypass -File F:\tools\deepseek-harness\dsh-control.ps1 restart
powershell -NoProfile -ExecutionPolicy Bypass -File F:\tools\deepseek-harness\dsh-control-gui.ps1
```

完整管理脚本副本（含 repair/patch/sync/prune 等）收录于：

```text
scripts/selfuse/management/
```
