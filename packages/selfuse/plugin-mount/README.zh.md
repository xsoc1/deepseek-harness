---
description: "在同一个 Cordis 根作用域内去重可选宿主插件副本。"
kind: "package-reference"
---

# @dsh-selfuse/plugin-mount

[English](README.md) | 中文

## 概述

这个私有工具包维护皮肤中心和 Git 图共同使用的生命周期保护。它仅在同一个 Cordis 根作用域内抑制重复包加载，不影响独立应用。首个 fiber 卸载时移除标记，重复 fiber 不拥有标记。它不增加提示词、模型工具、界面或独立激活的 Loader 条目。

## 目录

- [行为](#behavior)
- [开发备注](#dev-note)
- [模型体验](#model-experience)
- [已知限制与待办](#known-limitations-and-deferred-work)

<a id="behavior"></a>
## 行为

用 `mountOnce(packageName, apply)` 包装 apply 函数。本地链接和已安装副本共享符号键控的根作用域 WeakMap；卸载后的根可以被回收。工具包同步调用首个 apply，并保持其配置类型。实现由上游 dsh-web-ui 宿主保护适配而来，原始 BSD 许可证保留在 [LICENSE](LICENSE) 中。

<a id="dev-note"></a>
## 开发备注

运行 `scripts/selfuse/mount-once.spec.ts` 验证独立根作用域、重复实例卸载和重载。在两个使用方宿主 bundle 前构建此依赖。不发布不变量伴随包，因为保护函数直接拥有自己的标记，没有可独立观察的服务状态或 Session 投影。

<a id="model-experience"></a>
## 模型体验

### 挂载保护

#### 模型看到什么

无。`mountOnce` 不注册工具、提示词、资源或 Session 事件。

#### Token 影响

保护函数不增加模型 token；使用方插件负责各自的模型内容。

#### KV Cache 影响

保护函数不改变模型请求内容或提供方缓存复用。

## 已知限制与待办
<a id="known-limitations-and-deferred-work"></a>

- 这是生命周期保护，不是主实例选举。所属实例卸载后，被抑制的重复实例不会自动激活，需要显式重载。
- apply 失败时依赖 Cordis fiber 卸载释放标记。助手不重试或掩盖激活错误。
