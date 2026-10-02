---
description: "在 DSH Web 客户端显示分支选择器和 Git 图谱。"
kind: "package-bundle"
---

# dsh-git-graph

[English](README.md) | 中文

## 概述

此 bundle 为 Web 空白会话增加分支选择器和 Git 图谱面板。切换分支前会检查冲突与其他 worktree 的占用，工作区选择仍由官方入口负责。它不增加模型工具或提示词上下文。自用候选 profile 直接加载此包。

## 目录

- 仓库布局与构建
- 激活
- 卸载
- 设计说明
- 检查链
- 已知限制与待完成工作
- 开发备注

外部 dsh Web GUI 插件：**git 分支选择器**与**Git 图谱**面板。分支选择器只在空白会话显示，挂在官方输入选择器行的 context 洞（`conversation.input.selector.context`，session-maybe list 槽位）中，与官方工作区选择胶囊并排。若运行 shell 未声明该槽位（npm SDK rc.6 删除了它），等待 `CONTEXT_FALLBACK_MS` 后回退到 `conversation.input.dock`；在其空白会话 hero 相位，chip 会提升进官方 hero 行，紧贴 agent-preset 座位右侧，采用与官方工作区/预设胶囊一致的透明 28px 胶囊配方和 `--dsw-*` 主题 token。active 会话不提供分支选择控件。git 能力在 host 进程执行（磁盘工作树 `git switch`），UI 在浏览器 React；工作区选择保留官方入口。

行为对齐 ZCode 的 `GitBranchSwitcher`：可搜索弹层、当前项打勾、「创建并检出新分支… / Git 图谱」底部操作、切换守卫（未解决冲突 / 进行中操作 / 目标分支被其他 worktree 检出）与可读报错。

## 仓库布局与构建

此包已经整合到当前工作区，而不是放在同级的独立 checkout 中：

```text
packages/selfuse/web-ui-git-graph/   # integrated package
packages/client/                    # official Web client packages
```

工作区依赖由当前 monorepo 解析。从此包目录运行时，manifest 提供以下检查命令：

```sh
pnpm install
pnpm run typecheck
pnpm test
pnpm run build
```

`lib/client.js` 是浏览器 bundle（闭包工厂产物，`window.__ModuleLoader__.load`），由 host 的 client-modules 按 `/plugins/<id>/client.js` 提供。此包直接导入工作区的 `packages/client/tsdown.client.ts`，不再维护构建预设副本。

自用 profile 使用工作区包。此整合树尚未验证独立 Git 安装或其 prepare 路径。

## 激活

本包是 dsh profile bundle（`package.json` 声明 `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }`）。激活后，下次启动 `dsh web`（或对应 profile）时，bundle patch 的 insert 行把 `ui-git-graph`（host half：git 服务 + `/git/*` 路由）与浏览器 half（dsh.client 声明）一起装进 Web 组合；页面刷新后，空白会话的分支胶囊显示在 hero 行的 agent-preset 座位右侧，active 会话不显示该控件。

### 自用部署

此分叉是私有工作区包，不是已发布的 `@dsh-selfuse/...@latest` npm 版本。候选 profile 生成器从当前工作区的 CLI 安装解析它。原生 Desktop 安装及视觉交互仍未验收，不能凭 bundle 构建成功就修改真实 profile。全家桶聚合包已经退役，此 bundle 与皮肤中心是独立条目。

## 卸载

```sh
dsh plugin --profile web remove @dsh-selfuse/web-ui-git-graph
```

## 设计要点

- 插件边界与加载链的关键决策概述如下；旧 ADR 文件未随本包提供。
- host half 的 `/git/*` 只接受已注册 workspace 的路径（realpath 校验）与受信任客户端（loopback socket + loopback Host，与 dsh-ssh 相同的 fence，同时装了 `dsh-remote-web-ui` 时有效的已配对设备 cookie 也是放行路径）；浏览器无法对任意目录执行 git，LAN 暴露的 dsh web 对未配对的非 loopback 客户端返回 403。
- 切换语义是工作区级：`git switch --no-guess <branch>` 作用于 repoRoot 磁盘树，影响该工作区所有会话；项目切换 = 激活目标工作区并打开其（复用或新建的）空白会话，不给既有会话换 cwd。
- 挂载 seam：`conversation.input.selector.context`（官方声明的 session-maybe list 槽位）是输入选择器行的 context 洞，与官方工作区胶囊并排。分支胶囊只在空白会话显示；无会话 cwd 或非 Git 工作区时自行隐藏。声明感知回退会等待该槽位声明 `CONTEXT_FALLBACK_MS`（npm SDK rc.6 的 shell 已删除此声明）；超时未声明时，改在 `conversation.input.dock` 的空白会话 hero 相位挂载。此时 chip 重新定位到官方 hero 行 agent-preset 座位右侧（官方 2px 行间距、垂直居中，胶囊尺寸与 token 对齐官方工作区/预设胶囊），弹层向下打开、对齐官方工作区菜单。active 会话没有分支选择控件。只挂一个座位，回退后迟到的 context 声明被忽略。
- 工作区选择不在此插件内：官方工作区胶囊（`conversation.input.selector.workspace`）是唯一入口，本插件只提供 git 分支上下文。
- 分支状态刷新：空白会话 chip 挂载、弹层打开、切换成功后拉取，加上 host SSE（`/git/events`，订阅期间每 30s 轮询 workspace 状态，单次探测有 15s 超时兜底，挂起的 git 不会卡死推送流）推送外部变更和 window focus 刷新（5s 节流）。active 会话不订阅。SSE 流经跨标签页选主中继共享（Web Locks + BroadcastChannel），同一 URL 全浏览器只保留一条流，多开标签页不会挤占同源 HTTP 连接池（#383）。

## 检查链

```sh
pnpm run typecheck
pnpm test
pnpm run build
```

## 已知限制与待完成工作

- 此包切换的是整个工作区 checkout 的分支，而非单个会话的分支。
- 旧版独立安装与同级 checkout 指令属于历史说明，不是此自用树经验证的部署路径。

## 开发备注

包载荷包括 Host、客户端 bundle 和类型声明；`lib/types/` 下的中间 JavaScript 不是运行入口。不发布不变量 companion，因为 Git 状态位于会话日志外，此包没有维护可独立观察的会话状态关系。原来的空安装器已经移除。每次官方 Web 客户端更新后需重跑浏览器交互检查；仅有构建成功不能证明视觉位置正确。
