# dsh-selfuse packages

这一层是从第三方仓库源码吸收进本仓库后的自用插件包，统一使用 `@dsh-selfuse/*` 命名。

## 已吸收
- web-ui 家庭：web-ui-all / web-ui-settings / web-ui-community-plugins / web-ui-task-board / web-ui-git-graph / remote-web-ui / ssh / chat-recovery / skin-center / skins
- better-sidebar
- file-upload
- market
- mineru
- backup / git-workflow / undo / wsl-workspace

## 原则
- 保留原 LICENSE 和作者声明。
- 不再依赖第三方仓库；源码在本仓库内构建维护。
- `scripts/selfuse/*` 负责 profile 生成、安装、升级和自检。
