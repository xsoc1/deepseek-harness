---
description: "为 profile 增加本地 DSH 数据备份、校验、恢复和可选设置标签页。"
kind: "package-bundle"
---

# @dsh-selfuse/backup

[English](README.md) | 中文

## 概述

这个私有工作区层为 profile 增加 `backup_dsh` 工具、`/backup` 命令、持久化定时备份和设置标签页。当前官方 Desktop profile 未包含它。开发时安装已构建的本地源码链接，或通过原生 CLI（命令行界面）移除。归档含明文凭据；校验和不是加密或身份认证。

## 目录

- [使用此包](#use-this-package)
- [了解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [Model Experience](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用此包

### 安装到 profile

在候选源码树构建此包，然后使用已初始化的临时 profile 和绝对本地包路径。以下源码链接操作已通过原生 CLI 验证，不代表 npm 发布或已安装 Desktop 验收。

```sh
pnpm --filter @dsh-selfuse/backup run build
DSH_HOME=/absolute/scratch/dsh pnpm exec tsx apps/cli/src/bin.ts plugin --profile backup-acceptance add link:/absolute/checkout/packages/selfuse/backup
DSH_HOME=/absolute/scratch/dsh pnpm exec tsx apps/cli/src/bin.ts plugin --profile backup-acceptance remove @dsh-selfuse/backup
```

包的补丁声明通过 `package.json` 中的 `dsh.profile.bundles` 列表激活此层。修改 profile 后重启所属应用。不要对真实 Desktop 数据目录运行临时测试说明中的操作。

### 获得的功能

`/backup` 创建归档；`list`、`verify [prefix|all]`、`restore <prefix|latest> [--dry-run]`、`auto <hours>|off|status` 和 `github status|sync` 提供其他操作。`--keep N` 为单次备份覆盖保留数量；定时备份间隔小于 24 小时时保留三份，否则保留七份。模型工具提供 backup、list、verify、restore 和 auto 模式。设置标签页增加预览/确认、单份删除和同步控制；只有 Host 装配 Web 服务器时才显示下载，且只接受本机请求。

### 配置与恢复

补丁插入一个插件行。通过所属 profile 提供配置；目标目录必须是 `DSH_HOME` 外的绝对 Host 路径，`~/` 从启动环境展开。

```yaml
- id: '@dsh-selfuse/backup'
  name: '@dsh-selfuse/backup'
  config:
    destination: '~/Backups/dsh'
    keep: 7
    exclude: []
    githubRepo: ''
```

未指定目标目录时，备份放在 `~/Desktop/@dsh-selfuse/backups`。数据根目录是 `DSH_HOME`，未设置时是 `~/.dsh`；Windows 可从 `USERPROFILE` 解析用户目录。归档排除可重装的 `node_modules`；定时任务和 Git 状态持久化在 `<destination>/auto.json`。

先预览恢复。恢复在写入前校验校验和并拒绝越界路径、链接和特殊文件；随后为当前数据制作快照，将当前数据移至带时间戳的同级目录，再解压选中归档。恢复前快照临时提高保留数量，避免轮转删除选中归档。停止其他写入者，失败时保留同级目录，恢复后重启 DSH；这不是事务性的运行中会话迁移。

### 可选 Git 同步

将 `githubRepo` 设为专用私有 GitHub 仓库、Git URL 或本地仓库路径。HTTPS 认证通过启动环境中的 `DSH_BACKUP_GITHUB_TOKEN` 或 `GITHUB_TOKEN` 提供。本地凭据文件不进入提交。同步更新选中远端，并用从该远端取得的 lease 推送 `HEAD:main`；应使用备份独占分支，不能使用已有项目分支。超过 90 MiB 的文件被跳过。私有远端不等于归档加密。

-----

<a id="understand-the-implementation"></a>
## 了解实现

<details>
<summary>实现细节 — 点击展开</summary>

[cordis.patch.yml](cordis.patch.yml) 插入此层。[src/index.ts](src/index.ts) 拥有命令、工具、定时任务、Typert 服务和可选下载路由；[src/storage.ts](src/storage.ts) 实现字面文件删除/重命名和归档路径校验。[src/client/index.ts](src/client/index.ts) 拥有类型化 Remote codec、语言和 slot 贡献；[src/types.ts](src/types.ts) 包含浏览器安全的响应字段。

显式 Host 和 Client 工程分别生成声明，只共享响应源码。[tsdown.config.ts](tsdown.config.ts) 使用原生客户端 bundle 构建器；旧手写 JS 和假服务冒烟脚本不再组成第二套源码。命令、工具、面板和定时任务的修改操作在单个插件实例内串行化。下载同时要求 loopback Host 请求头和对端地址，拒绝符号链接，并从已经打开的普通文件流式读取。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

参阅[插件组合](../../boot/app-boot/README.zh.md)、[测试](../../../docs/testing.zh.md)和[防御模式](../../../docs/defensive-patterns.zh.md)。原插件为 [dsh-backup](https://github.com/xiaoyuyu6420/dsh-backup)，兼容修改由本工作区维护。

<a id="model-experience"></a>
## Model Experience

### 备份工具结果

#### What the model sees

模型收到 `backup_dsh` schema 和操作状态，备份成功时包含 `path` 和 `sha`。此插件的结果不包含归档内容或 Git token。恢复模式可以替换本地数据根目录；面板的确认不会为工具调用增加审批步骤。

#### Token effect

schema 和返回状态增加上下文 token。文件内容留在磁盘，除非其他工具或用户将其提供给模型。

#### KV Cache effect

只修改本地归档不会改变模型上下文。工具结果成为当前对话的一部分，后续请求按所属 agent（智能体）的上下文规则包含这些结果。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>

- 当前源码树需要符合根 manifest（元数据清单）的 Node、原生 subprocess/tools/commands 服务，以及 PATH 中的 `tar`。集成候选为 DSH 0.2.0-rc.2；隔离 Linux 测试不是 Windows tar 或已安装 Desktop 激活测试。实际 GitHub HTTPS 认证和 Desktop 下载尚未验收；没有 Web 服务器的 Desktop 使用本地归档文件，而非 HTTP 下载路由。
- 完整子进程输出上限为 1 MiB；更大的归档列表会在移动当前数据前停止恢复。进程内校验和回退上限为 256 MiB。校验和可发现意外损坏，不能防止同时恶意替换归档和校验和。归档拒绝依据字面路径与 tar 元数据校验，不能防御并发进程修改文件或符号链接祖先目录。备份既未加密，也不是并发写入者的一致快照；解压失败不会自动回滚。

<a id="dev-note"></a>
### 开发备注

没有发布不变量伴随包：归档和调度文件是没有 Session 投影的外部状态，原生操作和卸载测试核验其效果。

<details>
<summary>维护者工作上下文 — 点击展开</summary>

先构建此包，再从源码树运行 `pnpm exec vitest run packages/selfuse/backup/tests scripts/selfuse/backup-profile-acceptance.spec.ts`。测试使用临时文件，覆盖原生 Loader 重载、实际恢复、两个本地 Git 远端、HTTP 路由和重新构建的浏览器工厂。Client 产物压缩并保留源映射；Host 产物保持可读。完整发布门禁和真实 Desktop 激活是独立验收步骤；绝不能用真实数据目录运行这些测试。

</details>
