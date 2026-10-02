---
description: "保留已保留皮肤中心资源所需的布局属性。"
kind: "package-reference"
---

# 皮肤布局兼容

[English](README.md) | 中文

## 概述

此纯浏览器叶子包替代原先由 `web-ui-all` 承载的布局适配。皮肤中心将它作为依赖加载；它不添加设置页、插件目录、模型工具或提示词文本。Host 入口没有行为。

## 目录

- [行为](#behavior)
- [验证](#verification)
- [已知限制与后续工作](#limitations)
- [开发备注](#dev-note)

-----

<a id="behavior"></a>
## 行为

客户端给已有侧栏、对话栏和旧详情栏标记 `data-pane`，给侧栏父节点标记 `data-dsh-frame`。已有属性不变。子节点变更合并到一帧处理；卸载会取消待执行工作、断开观察器，仅移除仍由本插件拥有的属性。已脱离页面的子树会释放引用。

没有 `./invariant` 伴随模块：此包只拥有可释放的 DOM 属性，不存在可能产生观测差异的独立权威状态。Loader 生命周期测试改为验证属性归属和清理。

<a id="verification"></a>
## 验证

在仓库根运行 `pnpm exec vitest run packages/selfuse/skin-layout-compat/tests/layout.client.spec.ts` 和 `pnpm --filter @dsh-selfuse/skin-layout-compat run build`。测试覆盖真实 Loader 激活、禁用后重启、布局节点替换、属性归属和取消。它们不能证明预构建皮肤中心的视觉验收或签名 Desktop 中的激活。

构建后运行 `node --test packages/selfuse/skin-layout-compat/tests/built-client.spec.mjs`，它执行产出的浏览器工厂，在 jsdom 中验证激活与清理。

<a id="limitations"></a>
## 已知限制与后续工作

- 选择器仍依赖官方布局类名片段。上游 DOM 改动后必须补适配测试和视觉验证。此叶子包不恢复退役设置或社区页面，不重建皮肤中心缺失的源码，也不向用户 Desktop profile 安装任何插件。

<a id="dev-note"></a>
## 开发备注

没有发布不变量伴随包：拥有的 DOM 属性只存在于浏览器中，Loader 生命周期测试核验归属与清理。

此适配只负责皮肤中心资源使用的属性。在本工作区构建和测试；不要把退役聚合包复制回活动包依赖图。
