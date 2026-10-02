---
description: "通过原生提示词段给 profile 添加本地 soul.md 人设卡。"
kind: "package-bundle"
---

# @dsh-selfuse/soul-md

[English](README.md) | 中文

## 概述

这个私有工作区配置层把本地 Markdown 人设卡加入系统提示词。官方 Desktop profile 默认不包含它。通过原生 CLI 安装已构建的本地链接，在官方插件配置表单中修改参数。卡片对宿主内所有 Agent 生效，因此其内容属于受信指令。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与待办](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

### 安装到 profile

以下本地链接操作已经通过构建后的原生 CLI，在临时 profile 中验证。不代表 npm 发布或已安装 Desktop 激活。

```sh
pnpm --filter @dsh-selfuse/soul-md run build
DSH_HOME=/absolute/scratch/dsh node apps/cli/lib/bin.js plugin --profile soul-md-acceptance add link:/absolute/checkout/packages/selfuse/soul-md
DSH_HOME=/absolute/scratch/dsh node apps/cli/lib/bin.js plugin --profile soul-md-acceptance remove @dsh-selfuse/soul-md
```

先初始化临时 profile。补丁声明把这个层记录到 `dsh.profile.bundles`；修改 profile 后重启所属应用。不要对真实 Desktop 用户目录执行临时环境命令。

### 获得什么

`soul:persona` 段读取绝对 `path`，或相对不可变启动时 DSH 用户目录的路径。文件缺失时使用 `fallback`；空卡片不贡献段落。监听器跟随文件路径，支持缺失后创建和原子保存替换。保存及原生配置修改影响后续组装，不改已发送请求。

```yaml
- id: soul-md
  name: '@dsh-selfuse/soul-md'
  config:
    path: soul.md
    fallback: ''
    order: 0
    complete: false
    watch: true
    debounceMs: 300
    maxFileBytes: 131072
```

省略整个 `config` 对象时使用这些默认值。默认读取上限为 128 KiB，可调范围是 256 字节至 1 MiB。非法 UTF-8、超大文件及其他读取错误使加载失败；监听重载时会记录错误并保留最近有效段落。只有文件缺失才启用回退文本。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

[cordis.patch.yml](cordis.patch.yml) 插入一个宿主条目。[src/index.ts](src/index.ts) 负责校验后的动态配置、有界读取、原生提示词贡献与监听清理。[tsdown.config.ts](tsdown.config.ts) 输出 `lib/index.js` 及类型声明；不存在独立浏览器入口或旧设置 API。配置使用官方生成表单。

插件仅拥有派生提示词贡献和文件监听器，没有可变服务注册表或持久存储。卸载会移除段落并取消待执行重载，因此不需要额外的服务不变量安装器。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

参阅[系统提示词](../../core/system-prompt/README.zh.md)、[测试策略](../../../docs/testing.zh.md)与[原生配置迁移](../../../docs/upgrade-guide/v0.2.0-rc.2/selfuse-soul-md/guide.zh.md)。原始插件是 [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md)；兼容改动由本工作区维护。

<a id="model-experience"></a>
## 模型体验

### 人设卡段落

#### 模型看到什么

模型在 `soul:persona` 中看到渲染后的卡片，包括 `{{model}}`、`{{cwd}}` 等替换。它对宿主内所有 Agent 生效，包括子代理。插件不增加工具。

#### Token 影响

每次组装请求时，完整渲染的卡片增加系统提示词 token。长卡片会增加输入成本并挤占其他上下文。

#### KV Cache 影响

未修改的卡片保持其贡献稳定。修改会改变后续请求，可能使供应商前缀复用失效；此前请求不变。

## 已知限制与待办

<a id="known-limitations-and-deferred-work"></a>

- 字面 `{{` 与 `}}` 和变量语法冲突；未知变量可能导致渲染失败。卡片不是不受信文档附件。
- `complete: true` 抑制其他系统提示词段。启用前应审阅整个组成；默认为 false。
- 文件监听使用轮询和去抖。读取有上限，但网络文件系统卡顿仍取决于操作系统。当前候选版本为 DSH 0.2.0-rc.2；Linux 测试不代表已安装 Windows Desktop 验收。

<a id="dev-note"></a>
### 开发备注

没有发布不变量伴随包：拥有的提示词段直接派生自文件和原生配置，Loader 测试核验重载与卸载。

<details>
<summary>维护者工作背景——点击展开</summary>

在临时用户目录中运行包构建、原生 Loader/文件生命周期测试及 `scripts/selfuse/soul-profile-acceptance.spec.ts`。将人工编写的无密钥 Session 回放、完整发布检查与真实 Desktop 激活分别记为证据。旧宿主、客户端及设置助手已归档到工作树外。

</details>
