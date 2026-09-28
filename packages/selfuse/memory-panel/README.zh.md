---
description: "在面向用户的 DSH 设置面板中浏览和编辑本地 Markdown 记忆。"
kind: "package-bundle"
---

# @dsh-selfuse/memory-panel

[English](README.md) | 中文

## 概述

这个 bundle 在 DSH 用户目录下为本地 Markdown 知识页和笔记增加 Web 设置面板。它不调用模型，也不把文件加入 Agent 上下文。面板是人工编辑和查看工具，不是 Agent 的记忆检索系统。

## 目录

- 存储与功能
- 安装
- 安全
- 已知限制与待办
- 开发备注

## 存储与功能

知识页位于 `~/.dsh/memory/knowledge/*.md`，笔记位于 `~/.dsh/memory/notes/*.md`。面板显示数量和占用空间，浏览两类文件，创建笔记，并按标题及内容做子串搜索。受控测试可用 `DSH_MEMORY_ROOT` 更改根目录。

## 安装

在目标 Web profile 使用官方插件 CLI：

```sh
dsh plugin --profile web add @dsh-selfuse/memory-panel
```

## 安全

宿主路由读写本地文件。文件 id 只能使用受限字符集且不能包含路径分隔符；访问限制在配置的记忆根目录内。该路由继承 Web 服务的同源与网络保护。

## 已知限制与待办

- 这个面板不会向模型注入、检索、排序或总结记忆。
- 没有部署所需的 Web 身份验证及网络控制时，不应暴露宿主路由。

### 开发备注

整合包包含预构建的宿主和客户端入口。重要笔记投入使用前，应验证浏览器渲染及一次写入—读取往返。
