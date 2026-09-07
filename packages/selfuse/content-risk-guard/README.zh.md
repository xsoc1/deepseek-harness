# @dsh-selfuse/content-risk-guard

DeepSeek Harness (DSH) 内容风控拦截与自愈守卫插件。

[English](README.md) | 中文

## 概述

当 Agent 在日常开发中读取代理配置（如 Clash/Mihomo YAML 配置文件、vmess/vless/trojan/ss 节点链接）或抓取带有订阅 Token 的网络信息时，工具返回的内容在提交至上游模型 API（如 DeepSeek 官方 API 或网关）时可能会触发内容安全审查网关，报 `HTTP 400 Content Exists Risk` 导致整轮任务失败。

本插件在 Cordis 事件层提供双重防御与自愈机制：
1. **工具级前置脱敏**：监听 `tools/post-execute` 与 `llm/stream` 瀑布，自动识别并脱敏敏感节点列表、代理协议链接与订阅 Token，避免敏感内容进入对话流；
2. **风控错误自动自愈重试**：当上游 API 抛出 `Content Exists Risk` 异常或返回风控失败 Chunk 时，自动拦截并对历史上下文执行应急脱敏与自愈重试，防止会话中断。

## 启用方式

在 profile 补丁层 `cordis.patch.yml` 中挂载：

```yaml
- id: "@dsh-selfuse/content-risk-guard"
```

## 配置项

在 `settings.yaml` 中可选配置：

```yaml
"@dsh-selfuse/content-risk-guard":
  enabled: true             # 是否启用风控脱敏守卫（默认 true）
  autoRetry: true           # 遇到 Content Exists Risk 是否自动脱敏重试（默认 true）
  sanitizeToolResults: true # 工具执行后是否立即脱敏敏感代理节点（默认 true）
```
