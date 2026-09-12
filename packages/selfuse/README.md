# dsh-selfuse packages

这一层是从第三方仓库源码以及本机自研插件吸收进本仓库后的自用插件包，统一使用 `@dsh-selfuse/*` 命名。

## 维护边界

- **官方层**：`origin/master` 只用于跟踪 `deepseek-ai/deepseek-harness`；官方升级应单独合并、测试，不把运行态修补直接写进官方分支。
- **selfuse 源码层**：`config/selfuse/` 定义部署配置与预设，`packages/selfuse/` 保存可维护的插件源码，`scripts/selfuse/` 负责生成、安装、升级和回归验证。
- **运行态层**：`DSH_HOME` 下的 profile、settings、skills 和 `.agent-presets` 是可重建的部署结果，不应反向成为唯一源码。

当前本机实际由 Windows 下的 `F:\tools\deepseek-harness` 管理启动脚本与日志，由 WSL 中的 `/home/huangzy/tools/deepseek-harness` 运行 DSH，活跃 `DSH_HOME` 为 `/home/huangzy/.dsh`。`xsoc1/dsh-selfuse` 在本机对应 `F:\tools\dsh-local`，是早期管理仓库；当前运行链的 selfuse 源码已整合进本分支，不应用旧管理仓库直接覆盖它。

## 历史会话预设不变式

会话头会持久记录创建时的 preset id。因此，每次 Web 启动前必须先把 `config/selfuse/agent-presets` 中缺失的标准预设部署到 `$DSH_HOME/.agent-presets`；`wsl-workspace` 再据此生成 `wsl-*` 变体。否则，新会话可能正常，而历史会话会在 resume 时因预设消失而失败。

`run-dsh-web.ps1` 已在进程启动前调用 `install.mjs --presets-only`。该模式只补齐缺失的标准预设，不修改 profile、settings 或 skills。

## 已吸收
- web-ui 家庭：web-ui-all / web-ui-settings / web-ui-community-plugins / web-ui-task-board / web-ui-git-graph / remote-web-ui / ssh / chat-recovery / skin-center / skins
- better-sidebar
- file-upload
- market
- mineru
- backup / git-workflow / undo / wsl-workspace
- 本机自研：memory-panel（本地记忆面板）、skill-router（技能路由提示段）、content-risk-guard（内容风控自动拦截与自愈守卫）
- 人设/桌面配套：soul-md（soul.md 人设卡）、通用 Web 配套（web-shell-bridge / file-changes / client-file-changes / shell-terminal / easy-setup / task-notify）
- 管理控制台：control-gui（WinForms 独立 GUI 控制台，含设置、自动目录感知、横幅定制与状态轮询）

## 使用
- 所有包已加入 `apps/cli/package.json` 的依赖，因此源码模式运行 dsh 时可直接在 profile 的 `dsh.profile.bundles` 中引用 `@dsh-selfuse/*`。
- 生成/更新 profile：`node scripts/selfuse/generate-profile.mjs --dsh-home <DSH_HOME>`
- 一键安装（profile + settings + skills + 目录）：`node scripts/selfuse/install.mjs --dsh-home <DSH_HOME>`
- 只补齐标准预设：`node scripts/selfuse/install.mjs --presets-only --dsh-home <DSH_HOME>`

## 原则
- 保留原 LICENSE 和作者声明。
- 不再依赖第三方仓库；源码在本仓库内构建维护。
- `scripts/selfuse/*` 负责 profile 生成、安装、升级和自检。
