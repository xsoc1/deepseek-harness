---
description: "为自用 Web profile 添加 Git 图、远程 Web UI 和皮肤中心。"
kind: "package-bundle"
---

# @dsh-selfuse/web-ui-all

[English](README.md) | 中文

## 概述

此 bundle 增加官方 Web 组合未提供的三项自用功能：Git 图、远程 Web UI 和皮肤中心。插件安装仍由官方 CLI 管理。该载具只装配面向浏览器的包，不增加模型上下文。

## 目录

- 使用此包
- 已知限制与待完成工作
- 开发备注

## 使用此包

载具装配 Git 图、远程 Web UI 和皮肤中心。客户端兼容层还为皮肤标记面板元素；宿主入口本身没有额外功能。

官方 Web bundle 已提供插件列表与设置、工作区文件、右侧 PTY 终端、预设、技能和任务工具。本 profile 不再挂载与其重叠的旧市场、设置、任务板、SSH、桌面壳配套插件。社区插件改用原生 CLI 管理：

```sh
dsh plugin --profile web list
dsh plugin --profile web add <package>
dsh plugin --profile web remove <package>
```

本地部署由 `config/selfuse/profiles.build.yml` 生成；不要手工修改生成的 `~/.dsh/profiles/web` 文件。生成器会保留通过原生 CLI 新增的依赖与 bundle 行。远程 UI 仍服务于 Tailnet/iPad 访问，皮肤中心保留用户壁纸。退役功能的源码暂时保留供参考，但不在活跃 profile 中。

合入官方更新时，比较 `cordis.patch.yml` 与官方 Web bundle，仅保留有独立用途的自定义行。

## 已知限制与待完成工作

- 此载具保存预编译的兼容层，而本 checkout 没有可编辑的 TypeScript 源码；每次官方 Web 更新后都应核对皮肤挂钩。
- 构建之后仍需真实 UI 检查浏览器布局与 iPad 行为；生成 profile 的校验不能代替它们。

## 开发备注

已退役包暂时仍在 Git 历史与工作区中，但不属于活跃 profile。
