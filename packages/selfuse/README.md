# dsh-selfuse packages

这一层是从第三方仓库源码以及本机自研插件吸收进本仓库后的自用插件包，统一使用 `@dsh-selfuse/*` 命名。

## 已吸收
- web-ui 家庭：web-ui-all / web-ui-settings / web-ui-community-plugins / web-ui-task-board / web-ui-git-graph / remote-web-ui / ssh / chat-recovery / skin-center / skins
- better-sidebar
- file-upload
- market
- mineru
- backup / git-workflow / undo / wsl-workspace
- 本机自研：memory-panel（本地记忆面板）、skill-router（技能路由提示段）

## 使用
- 所有包已加入 `apps/cli/package.json` 的依赖，因此源码模式运行 dsh 时可直接在 profile 的 `dsh.profile.bundles` 中引用 `@dsh-selfuse/*`。
- 生成/更新 profile：`node scripts/selfuse/generate-profile.mjs --dsh-home <DSH_HOME>`
- 一键安装（profile + settings + skills + 目录）：`node scripts/selfuse/install.mjs --dsh-home <DSH_HOME>`

## 原则
- 保留原 LICENSE 和作者声明。
- 不再依赖第三方仓库；源码在本仓库内构建维护。
- `scripts/selfuse/*` 负责 profile 生成、安装、升级和自检。
