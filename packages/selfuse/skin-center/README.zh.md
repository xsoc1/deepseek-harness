---
description: "在设置页选择、试穿和应用本地 Web UI 皮肤与壁纸。"
kind: "package-bundle"
---

# 皮肤中心（GUI 内置皮肤中心）

[English](README.md) | 中文

## 概述

皮肤中心允许用户在不重启 DSH 的情况下试穿和应用 Web UI 皮肤。内置和用户皮肤出现在同一个设置页面，壁纸与背景控制也由本地浏览器界面提供。皮肤只改变呈现，不进入模型请求。当前入库的包是预编译快照：`lib/` 与资产存在，但下文的 `src/` 路径指向上游源码，本 checkout 不维护这些文件。

## 目录

- 安装
- 配置
- 安全模型
- 已知限制与待完成工作
- 目录结构
- 验收清单
- 开发备注

`@dsh-selfuse/skin-center`（cordis 插件 id `ui-skin-center`）是 dsh Web GUI 唯一的皮肤包：它把皮肤列表 / 试穿 / 应用做成设置里的一级页面（设置 → 皮肤中心），并且是所有皮肤的唯一加载器与渲染器。皮肤是纯资产目录——没有 package.json、不发 npm、不接 cordis 接线——只与皮肤中心契约（`contracts/`）耦合；皮肤中心把对官方 DSH 的全部耦合吸收在契约之后。卡片自带总开关（关闭即停用试穿、应用与背景控制）。

- 列表：展示「官方默认」加目录册里的每个皮肤（名称、标语、强调色），当前应用目标带「使用中」标记。目录册合并两个来源：随本包内置的皮肤（`skins/<id>/`）与放进 `$DSH_HOME/skins/<id>/` 的用户皮肤（同 id 时用户皮肤遮蔽内置皮肤）。`skin.json` 校验失败的皮肤按 fail-closed 排除，并作为目录诊断上报。
- 试穿 / 应用：两者走同一个原子切换引擎（`src/client/runtime/skin-controller.ts`）。一次切换 = 一个新的 activation identity：取回已限定作用域的样式表，安装样式、背景媒体与可选 hooks，翻转 `html[data-dsh-skin="<id>"]`，然后销毁上一个 activation（append-only 效果账本，幂等清理）。最新请求永远胜出；失败或被淘汰的切换完整保留旧皮肤。试穿是同一个切换但不落盘——「退出试穿」恢复已提交的皮肤。应用会持久化选择（`POST /api/skin-center/v2/active`）。不刷新页面、不改写 `cordis.patch.yml`、不重建启动图。
- 首屏：host 半区注册一个 index.html 转换（`webServer.tapIndex`，单一适配模块 `src/tap-index-adapter.ts`），向每份送达的文档盖 `html[data-dsh-skin]` 属性并插入样式表链接，刷新后直接以当前皮肤启动，无官方原貌闪屏。tap 出任何问题都 fail-closed 回官方原貌。
- 皮肤格式（v2）：`skin.json`（fail-closed 校验，v1 字段 `package`/`wiring`/`bodyAttr` 忽略并给迁移警告）、`skin.css`（L1 token 重映射 + L2 语义选择器）、可选 `patches.css`（L3 自由选择器，高敏感）、可选 `hooks.mjs`（受信逃逸舱，高敏感）、`assets/`、`preview/`。所有 CSS 经过安全管线（`src/core/css-safety/transform.ts`）：每个选择器强制限定在 `html[data-dsh-skin]` 下，`@import` / 远程或协议相对 URL / 越界路径直接报错。见 `contracts/README.md`。
- 覆盖契约：L1 重映射官方 `--dsw-*` 设计 token；L2 样式语义属性（`data-dsh-surface` / `data-dsh-part` / `data-dsh-plugin`，枚举见 `contracts/semantic-attrs-v1.md`），由兼容适配器（`src/client/runtime/semantic-adapter.ts`）从稳定锚点（`data-slot` 出口、`data-chat-flow-kind` 等）为官方壳层 DOM 打标；L3 补丁任意选择器，脆弱性由皮肤作者自负。主动输出语义属性的插件获得完整 L2 覆盖；不输出的只享受 L1。
- 背景优先级：Wallpaper Engine 壁纸永远优先于用户手动背景遮罩，后者优先于皮肤清单背景媒体；开关壁纸会实时重估优先级。
- 背景控制：背景遮蔽滑杆（0–100%）为画背景的皮肤在面板后加纱，两个按状态的高斯模糊滑杆（0–20 px）分别控制空对话与有内容时的背景，输入卡模糊滑杆（0–20 px）只控制输入卡背后的磨砂区域。整张壁纸模糊仍是独立的壁纸设置。背景模糊通过外壳之后的固定 `backdrop-filter` 元素施加；0 完全关闭（无元素、无 GPU 开销）。
- Wallpaper Engine 桥：卡片可把本机 Wallpaper Engine 库用作 GUI 背景。host 半区（`src/we-library.ts` + `src/we-routes.ts`）定位 WE 安装（Steam 应用 431960：Windows 注册表 + `libraryfolders.vdf` + 探测路径），扫描项目与创意工坊内容及可选手动文件夹，经同源 `/api/skin-center/we/*` 路由提供清单、媒体（Range 流式）、预览图、web 壁纸项目文件（注入 WE API shim）与场景壁纸主贴图 PNG（由 `src/pkg-extract.ts` 进程内解码 PKG/TEX，磁盘缓存）。视频壁纸用 `<video>` 渲染，web 壁纸用沙箱 `<iframe>`，场景壁纸经内置 WebGL 播放器实时渲染（2D 图层场景与 3D 模型场景按 WE 材质/着色器语义回放）；「静态帧」模式可为任意类型钉一张零动画开销的图。单张壁纸的导入会把项目复制进 `<harness-home>/skin-center/wallpapers/`，脱离 Steam 库变更也能用，并检测创意工坊原作更新。壁纸都是用户本机文件，从不上传或再分发——创意工坊内容归原作者。没有 WE 安装（如 macOS）？面板的「手动文件夹」行可把任何 `.mp4`/`.webm` 文件夹、单个壁纸项目文件夹或项目合集文件夹加为媒体库（`~` 展开为主目录）。
- 旧版迁移：v2 升级后的首次启动，一次性桥（`src/legacy-bridge.ts`）读取 harness home 根 `cordis.patch.yml`（v1 CLI 写入处；活动 profile 的 `cordis.patch.yml` 作为次级位置也会探测）里已退役的 `dsh-skin` 受管段，把活动皮肤 id 迁进 v2 选择存储，并清除旧行。迁移幂等且 fail-closed（出错时旧状态原样保留）。仅在发生迁移、清理或失败时输出日志，无 legacy 状态的稳态保持静默（issue #788）。

## 安装

```sh
dsh plugin --profile web add @dsh-selfuse/skin-center
dsh plugin --profile web add link:$(pwd)/packages/selfuse/skin-center
```

`$(pwd)` 是本仓库根目录。全部内置皮肤随这一个包发布；社区皮肤就是普通目录，放进 `$DSH_HOME/skins/<id>/` 即可（无安装命令、无需重启——重开卡片或刷新页面即收录）。

皮肤中心是符合官方 DSH 插件标准的自包含 bundle（`dsh.bundle.patch` 指向 `cordis.patch.yml`）。此自用层已包含编译后的 `lib/`；本地 `link:` 安装直接使用该包。

## 配置

- **总开关**：开关整张卡片（试穿 / 应用 / 背景控制）；持久化在 `skin-background` 设置命名空间。
- **背景滑杆**：遮蔽（0–100%）、两个背景模糊半径与输入卡模糊（0–20 px），持久化在同一命名空间。
- **壁纸面板**：媒体库文件夹、选择、渲染模式（实时 / 静态帧）、压暗、模糊、隐藏时暂停、声音开关与音量；持久化在 `skin-wallpaper` 命名空间。
- **用户皮肤目录**：`$DSH_HOME/skins/<id>/`；`DSH_SKINS_HOME` 可覆盖根目录（开发与测试用）。

## 安全模型

- 所有 `/api/skin-center/*` 路由仅接受同源请求：写操作拒绝跨站请求（Sec-Fetch-Site / Origin 围栏），资产读取限定在各皮肤目录之内（路径逃逸 fail-closed）。
- 皮肤 CSS 在服务前经白名单净化；`patches.css`（L3）按设计就是任意 CSS 并如实公示——它拥有完整页面样式能力，不构成安全边界。
- `hooks.mjs` 是与本仓库同审同发的受信代码，仅同源 serve，其 import/apply 错误永远不会拖垮静态皮肤。

## 已知限制与待完成工作

- 此工作区副本包含编译后的 `lib/` 与资产，但没有 `src/` 树。下文的源码路径设计说明描述的是上游来源，而不是本 checkout 中可编辑的文件；源码级改动必须先导入并验证对应源码。

- 插件运行时写入的内联样式只能经 L3 `!important` 补丁覆盖。
- 不输出语义属性（且无稳定 DOM 锚点）的插件只享受 L1 token 覆盖。
- 皮肤视频背景不受壁纸「隐藏时暂停」设置影响；该设置仅作用于 Wallpaper Engine 桥。

## 目录结构

```
packages/selfuse/skin-center/
  package.json
  cordis.patch.yml
  lib/index.js
  lib/client.js
  contracts/
  skins/
```

## 验收清单

- [x] 皮肤中心出现在 设置 → 皮肤中心，无控制台报错
- [x] 列表展示官方默认加目录册全部皮肤；当前使用者有标记；非法皮肤以诊断形式呈现
- [x] 试穿即时生效，退出完整恢复已提交皮肤；页面上永远只有一套皮肤
- [x] 一键应用原子切换、无需刷新；后续页面加载直接以该皮肤启动（无 FOUC）
- [x] Wallpaper Engine 桥、背景遮罩与模糊控制不受换肤影响
- [x] e2e 截图在 `docs/e2e/skin-center/`

## 开发备注

验收清单记录的是早先的上游测试；本次升级尚未在用户设备上独立重跑每项视觉检查。
