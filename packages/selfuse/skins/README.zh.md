---
description: "迁移至皮肤中心期间，让旧皮肤包标识仍可解析。"
kind: "package-bundle"
---

# @dsh-selfuse/skins

[English](README.md) | 中文

## 概述

这个已退役的兼容 bundle 让旧皮肤包标识在一个迁移周期内仍可解析。新 profile 应直接安装 `@dsh-selfuse/skin-center`：所有皮肤都在该包中，本包只提供空的旧版叶包，不贡献模型上下文。

## 目录

- 是什么
- 安装
- 已知限制与待完成工作
- 开发备注

## 是什么

- **兼容载具**：安装或升级本包即装上皮肤中心（`skin-center`），全部内置皮肤（xp / blue-fantasy / dragon-heir / minecraft / miku / trading / whale-song / harbor / whale-mom / matrix / maid-atelier / mint）以纯资产目录形态随它分发。
- **空 v1 叶包**：`build.mjs` 为 11 个已退役的 v1 包名生成不含资产的空包。它们不会应用皮肤，只用于让现有 profile junction 在一次清理启动期间仍可 import。
- **下个周期移除**：本包计划退役；新安装请直接用 `@dsh-selfuse/skin-center`（或全家桶聚合包 `@dsh-selfuse/web-ui-all`）。

## 安装

### 从 npm 安装（推荐）

```sh
dsh plugin --profile web add @dsh-selfuse/skin-center
```

### 从仓库安装（开发调试）

```sh
git clone https://github.com/zhu1090093659/dsh-web-ui.git
cd dsh-web-ui
pnpm install && pnpm -r build
dsh plugin --profile web add link:$(pwd)/packages/selfuse/skin-center
```

在 GUI 一级菜单「皮肤中心」里切换皮肤，或用 `dsh-skin use <id>`；同一时刻只激活一个皮肤。

## 已知限制与待完成工作

- 浏览器 bundle 仅面向 Web，作用域限定在 dsh web GUI。
- 皮肤只做呈现：只改浏览器 DOM，不触及模型请求。
- 已经是非法 YAML 的 profile overlay 会在此兼容包加载前由 DSH 报错，需先修复 overlay 再启动。
- Maid Atelier 单独采用 CC BY-NC-SA 4.0，仅限非商业使用；完整许可与署名随皮肤中心包内的皮肤目录分发。

## 开发备注

兼容周期只是历史约定；确认所有已部署 profile 都不再引用旧 v1 皮肤包后，才能移除此载具。
