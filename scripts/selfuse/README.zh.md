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

候选组成直接加载 Git 图和皮肤中心。皮肤中心拥有小型 `skin-layout-compat` 叶子包。Settings/community/skins/all、SSH/task-board/MinerU 及其不再使用的 ClientRuntime/ApiProxy SDK 均已归档到工作区外。清单的 `retiredPackages` 防止生成器从旧 profile 恢复这九项依赖，同时保留无关的 CLI 安装插件。SSH 与计划任务优先使用原生能力。不要对官方 Desktop 用户目录运行此开发生成器。

`pnpm run build` 会在官方库构建之后、Web 资源构建之前编译当前启用的私有 selfuse 包。只修改本地私有插件时，可运行 `pnpm run build:selfuse`，无需完整重建。选取范围来自 `config/selfuse/profiles.build.yml`；若选中的私有包没有真实构建脚本，会拒绝继续，不默认为冻结产物已通过。构建失败会使 `update.mjs` 在刷新现用 profile 前停止；`--no-build` 则明确复用已有产物，不能证明兼容性。

## `archive-conditional.mjs`

用户批准退役的 SSH/task-board/MinerU 目录及其闲置 SDK 已保存在源码目录外。`--move` 拒绝覆盖已有目标，校验字面量源码与归档根目录，并在改名前后记录文件哈希和符号链接目标。`--verify` 检查原目录仍不存在且归档清单保持一致。不读取或移动插件数据及会话。

```sh
node scripts/selfuse/archive-conditional.mjs --verify
```

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

## 旧 Windows/Web 管理脚本

这些脚本是已退役的 WSL Web 管理实现，不是官方 Desktop 的启动或更新入口。用户在 2026-09-30 放弃远程插件，旧 Web profile、Serve 映射和看门狗任务均已退役；旧 WinForms 控制台包已从工作区删除。保留管理脚本源码仅供读取旧部署行为，不能据此重新开启远程访问。当前运行方式见 `xsoc1/dsh-selfuse` 的 `docs/current-deployment.md`。
