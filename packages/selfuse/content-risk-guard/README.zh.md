---
description: "将识别到的网络配置留在本机，阻止含原文的模型请求，并在不暴露凭据的情况下检查或修改白名单 YAML 配置。"
kind: "package-reference"
---

# @dsh-selfuse/content-risk-guard

[English](README.md) | 中文

## 概述

将识别到的网络配置从模型请求中隔离，原文保留在本机私有目录。模型可凭会话句柄查看安全统计，也可在显式允许的 YAML 配置上申请审批后进行受限本地修改。含有网络原文的旧会话会在发往提供方前停止；应改用干净的新会话。本插件不是通用密钥检测器，也不能关闭提供方策略。

## 目录

- [行为](#behavior)
- [配置](#configuration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

<a id="behavior"></a>
## 行为

插件识别工具文本中的代理配置块、代理协议链接和订阅链接。在结果写入模型可见的工具历史之前，将原文以私有文件权限保存在本机 DSH 目录，并以不含路径或密钥的 `local-result:<handle>` 提示替代。无关的普通结果保持原样。模型可用同一会话内的句柄调用 `inspect_local_network_result`，获取数量与布尔标志；该工具不返回原始主机名、节点名、URL 或凭据。旧文件在超过保留期限后择机清理。

相同规则也处理带行号的 `read` 输出、JSON 包裹的 `run_code` 文本和子调用日志副本。若工具参数直接引用白名单配置路径，即使输出只是一小段且没有配置标题，也会在本地隔离。所选结果无法保存时，插件返回安全错误，不回传原文。每次请求进入模型适配器前，插件检查模型消息、系统文本和工具定义；识别到网络配置或无法检查请求时，以 `LOCAL_PRIVATE_CONTENT_BLOCKED` 停止发送。插件不改写旧会话日志，也不在上游拒绝后重试。

显式配置 `profiles` 白名单后，模型只可列出别名并读取数量、标志和 SHA-256 哈希，不会看到路径或 YAML 原文。修改 `tun.enable`、`dns.enable`、`mode` 或恢复备份，都必须经 Harness 人工审批；没有审批通道则拒绝写入。每次改动先生成仅所有者可读的备份，再原子替换文件。工具参数不接受端点、节点名或凭据。

<a id="configuration"></a>
## 配置

通过普通 Cordis loader 挂载。开发 selfuse profile 包含本插件；修改该候选配置不会更新已退役的 Web 服务或官方签名 Windows Desktop profile：

```yaml
- name: '@dsh-selfuse/content-risk-guard'
  config:
    enabled: true
    profiles: []
```

可选插件配置字段：

| 字段 | 默认值 | 含义 |
|---|---|---|
| `enabled` | `true` | 启用本地结果隔离与请求检查。 |
| `privateRoot` | `$DSH_HOME/private-content-risk` | 仅所有者可访问的绝对存储路径。 |
| `retentionHours` | `24` | 工具原文的择机过期时间。 |
| `maxStoredBytes` | `5000000` | 单条结果或配置的 UTF-8 字节上限。 |
| `profiles` | `[]` | 唯一的非敏感别名及本地 YAML 绝对路径；仅已配置文件可使用本地配置工具。 |

`privateRoot` 留空时使用 `$DSH_HOME/private-content-risk`；非空值必须是绝对路径。每个 `profiles` 条目含 `id` 和绝对 `path`；尽量把配置放在未同步的本地文件系统。私有目录须属于当前用户且不允许组与其他用户访问；结果和备份文件权限为 `0600`。同一账户的其他进程仍能读取。要修改凭据，请在模型聊天之外用本地编辑器或用户直接控制的界面；本插件故意不提供凭据编辑工具。

## Model Experience

### 检测到的网络工具结果

#### What the model sees

被选中的文本块替换为 `local-result:<handle> — network configuration held on this machine. Use inspect_local_network_result for safe facts.`；其他文本块和普通工具结果保持原样。检查工具只返回字节大小、代理节点数、策略组数、链接数和 `tun`/`dns` 标志。配置工具只返回别名、安全统计、哈希和备份句柄。含原文的旧会话会在进入提供方前以 `LOCAL_PRIVATE_CONTENT_BLOCKED` 停止。

#### Token effect

每个检测到的文本块被一个固定长度提示取代。后续检查或配置调用增加一次工具请求和一条有界 JSON 结果；插件不会经这些结果向模型发送网络原文。被阻止的请求不产生提供方 token。

#### KV Cache effect

新工具结果追加提示，不追加原文。句柄每次执行都会变化，因此重复且相同的工具结果不会复用同一追加后缀。旧会话被阻止后，用户需新建干净会话，才能继续使用提供方缓存。

## Known Limitations and Deferred Work

- **分类范围：**模式检测器可能漏掉未知或碎片化的格式，也可能选中无害示例。白名单文件路径匹配只覆盖直接引用；间接脚本仍可能隐藏其读取的文件。它不能预测上游策略，也不能保证所有秘密都留在本机。
- **本地隔离：**私有文件权限不能隔离同一用户身份运行的其他进程。`inspect_local_network_result` 有意不向模型提供完整原文。
- **配置修改：**白名单执行器只修改三个非敏感字段。它没有收集新凭据的本地界面；其他 YAML 修改仍需用户直接控制的本地工具。

<a id="dev-note"></a>
### 开发备注

没有发布不变量伴随包：私密句柄文件有意不向观察者公开，真实 Agent 管线测试核验拦截、拒绝分派与卸载。

这是本地隐私边界，不是绕过提供方策略的手段。Host 工程继承严格的工作区源码解析，用 `tsc -b` 和 tsdown 构建，不再把 Cordis 编译声明作为编译器路径覆盖。测试在可丢弃上下文中组合真实 Agent、Session、工具及审批服务；Loader 测试只控制模块解析，并检查禁用和重新启用时的清理。审批测试观察真实审计事件，不伪造审批对象。管线变更后重跑 `pnpm exec vitest run packages/selfuse/content-risk-guard/tests`；源码组合通过不等于官方签名 Windows Desktop 已激活插件或真实提供方已接受请求。
