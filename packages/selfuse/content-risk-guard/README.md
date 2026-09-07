# @dsh-selfuse/content-risk-guard

Content risk guard plugin for DeepSeek Harness (DSH).

English | [中文](README.zh.md)

## Overview

When coding agents read proxy configurations (e.g. Clash/Mihomo YAML files, shadowsocks/vmess URIs) or fetch URLs containing subscription tokens, sending these tool outputs to upstream LLM APIs (such as DeepSeek official API or third-party gateways) can trigger content safety WAF filters resulting in `HTTP 400 Content Exists Risk`.

This plugin provides two complementary protection layers:
1. **Tool-Level Pre-Sanitization**: Automatically sanitizes proxy node configurations, protocol URIs, and subscription URLs as soon as tool execution completes (`tools/post-execute`) or before requests reach the LLM stream (`llm/stream`).
2. **Seamless Auto-Recovery**: Intercepts `Content Exists Risk` errors and automatically performs emergency redaction on historical tool results, followed by an immediate seamless retry, preventing conversation failure.

## Installation & Activation

Add to your DSH profile patch plugins in `cordis.patch.yml`:

```yaml
- id: "@dsh-selfuse/content-risk-guard"
```

## Configuration

In `settings.yaml`:

```yaml
"@dsh-selfuse/content-risk-guard":
  enabled: true
  autoRetry: true
  sanitizeToolResults: true
```
