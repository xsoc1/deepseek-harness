---
description: "为 DSH 配置和用户插件代码建立快照并执行恢复。"
kind: "package-bundle"
---

# @dsh-selfuse/undo

[English](README.md) | 中文

## 概述

这个 bundle 为 profile 配置和选定的用户插件文件建立快照，提供恢复、比较、导入、导出和安全模式控件。它还附带 DSH 无法启动时使用的离线工具。恢复会破坏性地更改本地配置：应先检查差异并保留独立备份。

## 目录

- 使用 bundle
- 恢复范围
- 模型体验
- 已知限制与待办
- 开发备注

## 使用 bundle

使用官方 CLI 安装到选定 profile，然后重启 DSH：

```sh
dsh plugin --profile web add @dsh-selfuse/undo
```

宿主注册 `undo_snapshot`、`undo_list`、`undo_diff`、`undo_restore`、`undo_prune`、`undo_export`、`undo_import`、`undo_recent` 和 `undo_safe_mode`。应在 `undo_restore` 前使用 `undo_diff`；恢复路径会先保存当前状态。DSH 启动失败时可使用 `tools/` 下的离线 PowerShell 辅助工具。

## 恢复范围

快照针对 `cordis.patch.yml`、`package.json` 等 profile 文件、DSH 用户目录设置及选定的用户插件代码。快照存储默认按 profile 隔离。`.env` 与凭据需要特殊处理：本地恢复可能在本地 vault 中保留密钥，但导出文件和归档在检查前仍应视为敏感。

## 模型体验

### 配置恢复工具

#### 模型看到什么

Agent 接收恢复工具 schema，以及调用后的结果文本，包括快照名称、差异或恢复状态。可选系统提示词段提供工具使用指导；启用前应审阅。

#### Token 影响

工具 schema 和可选指导增加请求 token。调用差异或快照列表后会增加结果 token；快照文件内容不会自动加入上下文。

#### KV Cache 影响

未变化的 schema 和指导可以保持稳定的提示词前缀。工具结果会延长当前轮；恢复配置会改变后续运行组成及提示词，不会改写此前已缓存请求。

## 已知限制与待办

- 恢复更改本地 profile 文件且可能需要重启；它不能替代 DSH 用户目录的独立备份。
- 继承的离线 GUI 仅用于 Windows；包测试不能证明它在当前桌面部署中可用。
- 分享任何归档前，必须明确检查导出的密钥脱敏效果。
- 本包与部分官方配置及会话历史能力重叠；只有经过验证的恢复需求才值得保留。

### 开发备注

`README.en.md` 是继承的上游长文档，可能描述旧版行为。当前 `lib/index2.js` 和 `tools/` 是实现证据；启用前应运行本包测试并在可丢弃 profile 做一次恢复测试。
