# dsh-selfuse 脚本

[English](README.md) | 中文

## `generate-profile.mjs`

读取 `config/selfuse/profiles.build.yml`，并在 `$DSH_HOME/profiles/<name>` 下生成仅引用 `@dsh-selfuse/*` bundle 的 profile。清单里的 `disabledRows` 记录从官方 bundle 继承但本自用 profile 故意不启用的稳定行 id；`rowConfigs` 记录 selfuse 专用配置替换。生成器先写入这两类受管覆盖，再插入普通插件。`rowConfigs` 中以 `${DSH_HOME}/` 开头的路径按指定的 `--dsh-home` 展开，因此临时测试目录不会指向现用记忆。如 profile 含本地账户、模型或权限行，应放在 `# Local instance overrides (preserved by profile generator).` 之后；重新生成会保留该后缀。不要在本地后缀重复受管行 id，否则较后的行可能替换受管配置。清单还把已退役的 selfuse preset id 映射到官方模式，以便历史会话加载，但不能重现旧 preset 的完整工具组成。

selfuse 包已在 `apps/cli/package.json` 注册，所以运行中的 DSH 安装会先解析它们。通过原生 `dsh plugin` CLI 安装的依赖会保留在生成的 profile 中。

```bash
node scripts/selfuse/generate-profile.mjs --dsh-home /home/user/.dsh
```

## `install.mjs`

本地一键部署：

1. 检查 `apps/cli` 中的 selfuse 依赖。
2. 运行 profile 生成器。
3. 把 `config/selfuse/settings.yaml` 复制到 `$DSH_HOME/settings.yaml`。
4. 把 `config/selfuse/agent-presets` 中的规范 preset 复制到 `$DSH_HOME/.agent-presets`。
5. 把 `config/selfuse/skills` 中的 vendored skill 复制到 `$DSH_HOME/skills`（真实副本，不是 junction）。

```bash
node scripts/selfuse/install.mjs --dsh-home /home/user/.dsh --force
node scripts/selfuse/install.mjs --dsh-home /home/user/.dsh --dry-run
node scripts/selfuse/install.mjs --dsh-home /home/user/.dsh --presets-only
```

Web 启动预检使用 `--presets-only`。它只修复缺失的规范 preset，不更改生成的 profile、设置或技能。安装后重启 DSH 以加载新 profile。

## `build:selfuse`

`pnpm run build` 会在官方库构建之后、Web 资源构建之前编译当前启用的私有 selfuse 包。只修改本地私有插件时，可运行 `pnpm run build:selfuse`，无需完整重建。选取范围来自 `config/selfuse/profiles.build.yml`；已提交 `lib/` 产物的第三方包另行同步。构建失败会使 `update.mjs` 在刷新现用 profile 前停止；`--no-build` 则明确复用已有产物。

## `update.mjs`

具有 selfuse 感知的更新器通过正常 TLS 校验获取上游 `deepseek-ai/deepseek-harness` master，把它合并到当前 `selfuse` 分支（不重写历史），重新安装依赖、构建当前启用的私有包，并刷新 profile、设置与技能。若 WSL 无法从远端获取，可将 `DSH_SELFUSE_UPSTREAM_BUNDLE` 设为包含 `refs/remotes/origin/master` 的本地 Git bundle；更新器先检查文件存在，再从其中获取提交历史，不会关闭 TLS 校验。

```bash
node scripts/selfuse/update.mjs --check
node scripts/selfuse/update.mjs --apply --restart
```

安全措施：

- 跟踪文件未提交时拒绝执行更新。
- 只有指定 `--restart` 才会重启 DSH。
- 刷新前备份生成的 profile 文件。

## 远程桌面版

详细方案与排障见：

```text
config/selfuse/remote-desktop.md
```

## Windows 控制台 / 管理脚本（已收录于仓库根）

本地运行的 Windows 管理脚本已收入 selfuse 分支：

- `dsh-control.ps1`：启停、重启、状态、UI、日志、更新检查与更新。
- `packages/selfuse/control-gui/dsh-control-gui.exe`：WinForms 图形控制台。
- `dsh-watchdog.ps1` / `dsh-watchdog.vbs`：看门狗。
- `ensure-dsh-watchdog.ps1` / `ensure-dsh-watchdog.vbs`：兜底任务。
- `run-dsh-web.ps1`：在 WSL 内启动 DSH Web。
- `scripts/update-dsh.ps1`：检查并更新上游 DSH。
- `dsh.ico` / `dsh-icon.png` / `dsh-icon.svg`：控制台图标资源。

用法：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File F:\tools\deepseek-harness\dsh-control.ps1 status
powershell -NoProfile -ExecutionPolicy Bypass -File F:\tools\deepseek-harness\dsh-control.ps1 restart
Start-Process F:\tools\deepseek-harness\packages\selfuse\control-gui\dsh-control-gui.exe
```

完整管理脚本副本（包括 repair、patch、sync、prune）位于：

```text
scripts/selfuse/management/
```
