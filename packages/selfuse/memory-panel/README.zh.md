---
description: "通过可选的人工设置标签页浏览、搜索本地 Markdown 知识页并创建笔记。"
kind: "package-bundle"
---

# @dsh-selfuse/memory-panel

[English](README.md) | 中文

## 概述

这个可选层让你从设置中浏览本地 Markdown 知识页、创建笔记并搜索两类文件。文件保存在配置的 Host 目录中。面板不调用模型、不注入上下文，也不替代 agent（智能体）的记忆检索系统。默认官方 Desktop profile 不包含此包。

## 目录

- [使用此包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用此包

### 安装到 profile

这是私有源码包，不是已发布的 npm 包。先在当前源码树构建。原生 CLI（命令行界面）可对选定的临时 profile 接受 `link:<absolute-package-directory>`；将下面示例路径替换为此包的实际绝对目录。安装测试执行此添加/移除路径，并校验 profile 层的元数据，不修改常用 profile。

```sh
node --import tsx apps/cli/src/bin.ts plugin --profile memory-acceptance add link:/absolute/path/to/memory-panel
node --import tsx apps/cli/src/bin.ts plugin --profile memory-acceptance remove @dsh-selfuse/memory-panel
```

此[补丁](cordis.patch.yml)插入一个 Host 配置项；原生 Client 发现机制加载其设置标签页。仅安装成功不证明已安装的 Desktop 运行时能够激活此包。

### 存储与控件

存储目录包含 `knowledge/*.md` 与 `notes/*.md`。现有文件保持原内容和权限。标签页报告数量和大小、列出知识页、分页浏览笔记、读取文档、创建笔记，并按标题或内容做不区分大小写的子串搜索。创建笔记使用唯一文件名及独占创建，不编辑现有笔记或知识页。刷新和成功保存会重新加载列表及数量。Markdown 作为文本显示，不作为 HTML 执行。

配置的 `root` 优先于启动快照中的 `DSH_MEMORY_ROOT`，再到 `$DSH_HOME/memory`。没有 `DSH_HOME` 覆盖时，面板使用原生启动器的 Harness 用户目录解析器定位 `memory` 目录。路径必须是绝对 Host 路径。临时上下文必须提供隔离的用户目录解析器或显式存储目录；插件不会独立解析本机真实用户目录。

| 配置字段 | 默认值 | 含义 |
| --- | --- | --- |
| `root` | 空 | 使用启动环境的存储选择，或原生 Harness 用户目录下的 memory 目录。 |
| `maxFileBytes` | `262144` | 每个文件或完整组合笔记的 UTF-8 字节数；有效范围为 256–1048576。 |
| `searchLimit` | `50` | 两类文件的总匹配条数；有效范围为 1–500。 |

面板使用原生、经过身份验证的 RPC 连接，不暴露 `/memory/api/*` 路由。文件 id 不能含路径分隔符；文件和分类目录不能是链接。错误对调用方可见，不会静默遗漏不可读文件。取消尚未提交的笔记会移除这份新建文件。卸载时移除标签页、字典、样式和 RPC 方法，并等待该实例的活动文件调用结算。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节 — 点击展开</summary>

Host 将文件操作绑定到一个经校验的存储目录，并发布 Typert 服务。Client 挂载严格 codec、由语言字典拥有的文字和独立设置贡献。Host 与 Client 从真实 TypeScript 源码独立编译；Client 工厂压缩并带有源映射。存储仍是普通 Markdown 文件集合，不是模型记忆、向量索引或云服务。此包没有需要 invariant 配套插件的独立重复状态。

实现细节见 [Host](src/index.ts)、[存储](src/storage.ts)和 [Client](src/client/index.ts)。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

- [Profile 与组合包装配](../../../docs/architecture.zh.md)
- [原生设置服务](../../../docs/subsystems/settings.zh.md)

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>

- 此面板不向模型注入、检索、排序或总结记忆。它不贡献提示词、工具 schema 或会话事件，因此仅编辑本地文件不会改变请求 token 或 KV Cache 输入。
- 读取拒绝非 UTF-8 或超大文档。搜索达到配置的匹配数上限即停止；这是本地子串扫描，不是语义检索。列表和字节统计不是并发写入者的一致快照。
- 链接拒绝检查存储、分类和文件目录项，不能防御恶意进程并发替换祖先目录或路径。Windows 文件描述符行为及签名 Desktop 激活需要独立验收。当前测试使用 Linux 文件、原生 Loader/CLI 和 jsdom 中的实际浏览器工厂。

<a id="dev-note"></a>
### 开发备注

没有发布不变量伴随包：每次 RPC 直接读取文件系统，面板没有需要协调的独立持久状态或 Session 派生状态。

<details>
<summary>维护者工作上下文 — 点击展开</summary>

运行 `pnpm --filter @dsh-selfuse/memory-panel run build`，再运行 `pnpm exec vitest run packages/selfuse/memory-panel/tests scripts/selfuse/memory-panel-profile-acceptance.spec.ts`。所有可写 fixture（测试前置数据）使用临时存储及 profile。Client 测试在官方模块表、原生渲染器和 RPC codec 上执行重新构建的工厂，并使用文件后端的传输 fixture。完整发布检查与真实 Desktop 激活是独立步骤；绝不能使用真实记忆目录测试。

</details>
