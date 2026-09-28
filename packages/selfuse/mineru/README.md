---
description: "Expose MinerU document parsing to DSH agents through five tools."
kind: "package-bundle"
---

# @dsh-selfuse/mineru

English | [中文](README.zh.md)

## Summary

This bundle adds five agent tools for a separately deployed MinerU document-parsing service. It can parse PDF, image, and office files into Markdown or structured results. The service address and API key must be configured for the intended deployment; the included local address is only a default.

## Table of Contents

- Install
- Configuration
- Tools
- Model Experience
- Known Limitations and Deferred Work
- Dev Note

## Install

Use the official plugin CLI for the intended profile:

```sh
dsh plugin --profile web add @dsh-selfuse/mineru
```

## Configuration

Set `baseURL` to the reachable MinerU server. `apiKeyEnv` selects a credential reference; do not put a secret in the profile patch. `defaultBackend`, `defaultParseMethod`, and `defaultLang` select parsing behavior. `pollIntervalMs`, `pollTimeoutMs`, and `requestTimeoutMs` bound waiting and HTTP calls. `maxMdOutputChars` limits inline Markdown while storing complete output in a temporary file.

## Tools

| Tool | Result |
| --- | --- |
| `mineru_parse_document` | Submit a local document, poll, and return parsed Markdown. |
| `mineru_submit_parse_job` | Submit asynchronously and return a task id. |
| `mineru_get_parse_status` | Return pending, processing, completed, or failed state. |
| `mineru_get_parse_result` | Return a completed parse and a path to full structured output. |
| `mineru_health` | Report the server health and queue information. |

## Model Experience

### Document parse results

#### What the model sees

The agent receives five tool schemas and the result of each call. `mineru_parse_document` or `mineru_get_parse_result` can return extracted document text, capped by `maxMdOutputChars` for inline Markdown.

#### Token effect

Tool schemas add prompt tokens while available. Parsed text returned by a call can be large and consumes result tokens up to the configured inline limit.

#### KV Cache effect

Each parse result extends the current turn's context; an external document or MinerU job does not affect cached model context until its tool result is returned.

## Known Limitations and Deferred Work

- MinerU must be deployed separately; this package does not start or manage that service.
- A local `http://localhost:18000` default is not evidence that a reachable server is running.
- Large parsed documents are truncated in the inline result, with complete output stored separately.

### Dev Note

Use a disposable document and a configured test MinerU endpoint for an end-to-end check. Unit tests with mocked fetch do not establish service availability.
