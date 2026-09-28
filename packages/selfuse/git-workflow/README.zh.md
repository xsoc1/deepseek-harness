---
description: "经当前 DSH shell 策略执行的结构化 Agent Git 工具。"
kind: "package-bundle"
---

# @dsh-selfuse/git-workflow

[English](README.md) | 中文

## 概述

本插件提供结构化的状态、差异、日志、分支和提交工具。Git 命令经当前 DSH shell 与沙箱策略执行；插件不提供 push、pull 或 rebase。Agent 需要可解析的 Git 结果而不是自行组合裸 shell 输出时可使用它。

## 目录

- 工具
- 安装
- 安全
- 模型体验
- 已知限制与待办
- 开发备注

## 工具

| 工具 | 用途 |
| --- | --- |
| `git_status` | 分支、upstream、ahead/behind、暂存、未暂存、未跟踪和冲突状态。 |
| `git_diff` | 工作区或暂存区 diff，可选摘要、路径过滤和输出截断。 |
| `git_log` | 最近提交及可选的改动文件名。 |
| `git_commit` | 校验消息，可选暂存指定路径，然后提交。 |
| `git_branch` | 列出本地分支并标识当前分支。 |

所有工具都接受 `workdir`，默认会话工作目录；相对路径以此为基准解析。

## 安装

在目标 profile 使用官方插件 CLI：

```sh
dsh plugin --profile web add @dsh-selfuse/git-workflow
```

## 安全

插件在会话沙箱策略下经 `ctx.shell.execute()` 执行；缺少 shell 或策略时失败关闭。调用 Git 前会校验提交消息，并拒绝绝对路径或穿越路径。这些校验不能替代负责文件系统执行约束的会话沙箱。

## 模型体验

### 结构化 Git 操作

#### 模型看到什么

Agent 接收五个 Git 工具 schema，调用后得到渲染为可读文本的结构化结果。失败操作返回状态和错误，而不是未解析的 shell 记录。

#### Token 影响

工具可用时 schema 增加提示词 token；调用会增加状态、diff、日志或提交结果的 token。即使有限长约束，大型 diff 仍可能消耗较多结果上下文。

#### KV Cache 影响

工具 schema 在调用之间保持稳定。每次 Git 调用结果延长当前轮上下文；无关仓库变动在下一次工具调用之前不会改变已缓存上下文。

## 已知限制与待办

- 路径检查是词法级的；活跃 DSH 沙箱负责文件系统执行约束。
- `git_commit` 要求仓库已经配置 Git 身份。
- 非常规路径编码可能无法在 `git_log` 文件输出中完整表示。
- 本插件有意不暴露 push、pull 和 rebase。

### 开发备注

升级 DSH shell 接口时应运行本包测试和一个沙箱拒绝案例。开发应以整合后的源码为准，而不是旧版独立 checkout 路径。
