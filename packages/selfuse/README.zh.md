---
description: "说明整合的 selfuse 包层及其部署归属。"
kind: "package-group"
---

# Selfuse 插件包

[English](README.md) | 中文

## 概述

本组保存用于开发和兼容测试的本地与第三方集成。目录存在不代表它已在官方 Windows Desktop 激活。桌面运行态、本 WSL 源码工作树和生成的候选 profile 分别归属不同状态。退役集成归档在构建工作区之外。

## 目录

- [插件包](#packages)
- [相关文档](#related-documentation)
- [开发备注](#dev-note)

-----

<a id="packages"></a>
## 插件包

保留包的激活与验收要求相互独立：

| 包 | 职责 |
|---|---|
| [backup](backup/README.zh.md) | 备份与恢复操作 |
| [content-risk-guard](content-risk-guard/README.zh.md) | 本地私密内容检查 |
| [task-notify](task-notify/README.zh.md) | 保留的运行结束通知 |
| [git-workflow](git-workflow/README.zh.md) | Git 工作流集成 |
| [memory-panel](memory-panel/README.zh.md) | 本地 Markdown 记忆管理 |
| [skin-center](skin-center/README.zh.md) | 皮肤和壁纸管理 |
| [skin-layout-compat](skin-layout-compat/README.zh.md) | 仅用于皮肤的布局属性适配 |
| [soul-md](soul-md/README.zh.md) | 个人上下文文件集成 |
| [plugin-mount](plugin-mount/README.zh.md) | 宿主根作用域激活保护 |
| [web-ui-git-graph](web-ui-git-graph/README.zh.md) | Git 图和分支选择 |

<a id="related-documentation"></a>
## 相关文档

- [Selfuse 配置](../../config/selfuse/profiles.build.yml) — 开发候选组成和旧预设别名。
- [Selfuse 脚本](../../scripts/selfuse/README.zh.md) — 隔离生成和安装；不是现用 Desktop 启动器。
- `xsoc1/dsh-selfuse/docs/current-deployment.md` — 官方 Desktop 安装与会话归档。

<a id="dev-note"></a>
## 开发备注

五个退役 EAC 集成、market、skill-router 和 wsl-workspace 已移到本工作树以外的本地 `dsh-retired-20261001/source-packages` 归档。task-notify 仍为候选依赖。源码测试使用可丢弃用户目录；保留旧会话头，独立验收 Desktop 功能。发布前须通过完整门禁。

旧设置聚合页、社区目录、skins 载具和 web-ui-all 已归档到 `dsh-retired-20261001/native-ui-packages`。候选配置直接加载 Git 图和皮肤中心。SSH、任务板、MinerU 及其旧 ClientRuntime/ApiProxy 包归档到 `dsh-retired-20261001/conditional-packages`；改用官方 SSH 和计划任务。插件数据和会话保持不变。
