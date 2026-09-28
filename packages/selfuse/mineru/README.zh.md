---
description: "通过五个工具向 DSH Agent 提供 MinerU 文档解析能力。"
kind: "package-bundle"
---

# @dsh-selfuse/mineru

[English](README.md) | 中文

## 概述

这个 bundle 为另行部署的 MinerU 文档解析服务增加五个 Agent 工具。它可把 PDF、图片与办公文件解析为 Markdown 或结构化结果。服务地址与 API key 必须按目标部署配置；自带的本机地址只是默认值。

## 目录

- 安装
- 配置
- 工具
- 模型体验
- 已知限制与待办
- 开发备注

## 安装

在目标 profile 使用官方插件 CLI：

```sh
dsh plugin --profile web add @dsh-selfuse/mineru
```

## 配置

将 `baseURL` 设为可访问的 MinerU 服务。`apiKeyEnv` 选择凭据引用；不要把密钥写进 profile patch。`defaultBackend`、`defaultParseMethod` 和 `defaultLang` 选择解析行为。`pollIntervalMs`、`pollTimeoutMs` 和 `requestTimeoutMs` 限制等待及 HTTP 调用。`maxMdOutputChars` 限制内联 Markdown，完整输出另存临时文件。

## 工具

| 工具 | 结果 |
| --- | --- |
| `mineru_parse_document` | 提交本地文档、轮询并返回解析后的 Markdown。 |
| `mineru_submit_parse_job` | 异步提交并返回任务 id。 |
| `mineru_get_parse_status` | 返回 pending、processing、completed 或 failed 状态。 |
| `mineru_get_parse_result` | 返回已完成解析及完整结构化输出的路径。 |
| `mineru_health` | 报告服务健康与队列信息。 |

## 模型体验

### 文档解析结果

#### 模型看到什么

Agent 接收五个工具 schema 和每次调用的结果。`mineru_parse_document` 或 `mineru_get_parse_result` 可返回提取的文档文本；内联 Markdown 受 `maxMdOutputChars` 限制。

#### Token 影响

工具可用时 schema 增加提示词 token。调用返回的解析文本可能很长，在配置的内联上限以内消耗结果 token。

#### KV Cache 影响

每次解析结果延长当前轮上下文；外部文档或 MinerU 任务在工具结果返回前不会影响已缓存的模型上下文。

## 已知限制与待办

- MinerU 必须另行部署；本包不会启动或管理该服务。
- 默认的 `http://localhost:18000` 不能证明有可访问的服务正在运行。
- 大型解析文档会在内联结果中截断，完整输出另行保存。

### 开发备注

端到端测试应使用可丢弃文档和已配置的 MinerU 测试地址。模拟 fetch 的单测不能证明服务可用。
