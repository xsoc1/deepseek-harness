---
description: "为 selfuse 兼容而保留的旧版宿主 API 代理传输产物。"
kind: "package-reference"
---

# @deepseek-ai/dsh-host-apiproxy

[English](README.md) | 中文

## 概述

此兼容包提供 selfuse 插件使用的旧版宿主 API 代理和 fetch 导出。当前工作区只有清单和构建后的 `lib` 产物，没有原始源码。新代码应优先使用当前官方 API 包。

## 目录

- 兼容用途
- 已知限制与待办
- 开发备注

## 兼容用途

清单导出宿主传输、API 声明、fetch 客户端和 invariant 入口。现有插件在迁移前仍引用这些名称。

## 已知限制与待办

- 没有源码或本地构建配方，无法独立适配上游 API 变更。
- 依赖插件通过类型检查，不等于冻结的传输层已经通过运行时兼容验证。

### 开发备注

逐一记录消费者；每个消费者有运行测试后，再将其迁移到当前官方 API。
