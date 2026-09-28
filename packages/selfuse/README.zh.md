---
description: "说明整合的 selfuse 包层及其部署归属。"
kind: "package-group"
---

# Selfuse 插件包

[English](README.md) | 中文

## 概述

本组包含 selfuse DSH 部署使用或保留的本地与第三方整合包。包在此目录中不代表它已在活跃 profile 启用。DSH 官方源码、候选升级、selfuse 配置和生成的运行态各有归属，不能相互覆盖。

## 目录

- 归属
- 部署
- 历史会话
- 包状态
- 开发备注

## 归属

官方仓库与 selfuse 变更分别跟踪。`config/selfuse/` 定义部署组成和预设；本目录保存整合源码或兼容产物；`scripts/selfuse/` 生成、安装和检查部署。活跃 DSH 用户目录含生成的 profile、设置、技能和会话数据，但不是配置的唯一源码。

## 部署

活跃服务继续使用现有 checkout，直到隔离候选通过构建、包测试、全部文档门禁和应用冒烟。`scripts/selfuse/generate-profile.mjs` 生成候选 profile；`scripts/selfuse/install.mjs` 安装选定候选。不能为了让文档门禁通过而直接对活跃 DSH 用户目录运行这些命令。

## 历史会话

会话头保留创建时的 preset id。恢复旧会话前应保留或重映射这些 id；否则新会话可能正常而恢复失败。启动前的 `--presets-only` 路径只补齐缺失的标准预设，不覆盖 profile 设置或技能。

## 包状态

目录中既有活跃 selfuse 包，也有旧市场、WSL 工作区 bundle 等已退役或未启用包，以及旧桌面集成所需的冻结兼容产物。应检查生成的 profile，而不能假定每份清单都被加载。有功能重叠时优先使用当前官方 CLI。

### 开发备注

本次升级应先在隔离候选 checkout 和可丢弃 DSH 用户目录中验证。发布前在 `AGENTS.md` 和 selfuse 部署指南记录准确的官方修订、第三方来源、测试和仍未验证的运行行为。
