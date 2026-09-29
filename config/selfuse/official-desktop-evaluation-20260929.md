# DeepSeek Harness 官方桌面版调研与迁移评估（2026-09-29）

## 摘要与证据范围

本记录截至 2026-09-29 约 22:48（Asia/Shanghai）。DeepSeek 的 [Harness 官网](https://www.deepseek.com/harness/)和 [DeepSeek 下载页](https://www.deepseek.com/download/)已直接提供官方桌面端。下载按钮指向 `download.deepseek.com`；官网首页还直接链接 [官方开发者文档](https://deepseek-harness.github.io/deepseek-harness/en/reference/)。以下“官方事实”仅以这些 DeepSeek 自有页面、官网所链接的开发者文档和官方分发域名的更新元数据为依据；名字相近的第三方桌面项目不作为官方证据。官网页面没有单独标出桌面版号或首次公开发布日，因此不能从页面标题推定这两个信息。

## 官方事实

| 项目 | 已核对结果 | 一手来源 |
| --- | --- | --- |
| 发布状态 | 下载页明确写明“DeepSeek Harness 桌面端现已发布”；仍在迭代，部分功能和体验持续完善。Harness 首页标为“预览版”。 | [官方产品下载页](https://www.deepseek.com/download/)、[Harness 首页](https://www.deepseek.com/harness/) |
| 官网提供的平台 | Harness 首页列 macOS（Apple 芯片）与 Windows（64 位）；下载页明确 macOS 13 或更高版本。下载页没有给 Windows 最低系统版本；其页面也没有 Linux 下载按钮。[macOS x64 更新源](https://download.deepseek.com/dsh-desk/feeds/mac-x64/nightly-mac.yml)存在并指向 `0.2.0-rc.2`，但官网没有将 Intel Mac 列为直接下载入口；仅凭更新源不能断言该平台已获官网公开支持。 | [Harness 首页](https://www.deepseek.com/harness/)、[官方产品下载页](https://www.deepseek.com/download/)、官方 macOS x64 更新源 |
| 官网下载入口 | Windows 为 [dsh-latest-windows-x64.exe](https://download.deepseek.com/desktop/dsh-latest-windows-x64.exe)，Apple 芯片 macOS 为 [dsh-latest-macos-arm64.dmg](https://download.deepseek.com/desktop/dsh-latest-macos-arm64.dmg)。这是会变化的 latest 链接。 | [Harness 首页](https://www.deepseek.com/harness/)、[官方产品下载页](https://www.deepseek.com/download/) |
| 当前桌面更新源版本 | 2026-09-29 约 22:48 CST 读取的 [Windows 更新元数据](https://download.deepseek.com/dsh-desk/feeds/win-x64/nightly.yml)和 [macOS arm64 更新元数据](https://download.deepseek.com/dsh-desk/feeds/mac-arm64/nightly-mac.yml)均为 `0.2.0-rc.2`。Windows `releaseDate` 为 `2026-09-29T10:35:27.666Z`，macOS arm64 为 `2026-09-29T10:18:12.232Z`。这些是平台更新源记录的发布时间，不能据此断言官网公告的首次发布日期。 | 两个官方更新元数据 URL |
| 版本化安装包 | 元数据给出 [Windows x64 EXE](https://download.deepseek.com/dsh-desk/bin/win-x64/deepseek-harness-0.2.0-rc.2-win-x64.exe)（289,313,640 字节）和 [macOS arm64 ZIP](https://download.deepseek.com/dsh-desk/bin/mac-arm64/deepseek-harness-0.2.0-rc.2-mac-arm64.zip)（374,053,565 字节）。另以 HTTP HEAD 检查 [macOS arm64 DMG](https://download.deepseek.com/dsh-desk/bin/mac-arm64/deepseek-harness-0.2.0-rc.2-mac-arm64.dmg)存在；它和官网 DMG latest 链接返回同一 ETag 与文件长度，Windows 版本化 EXE 与 latest 链接亦如此。Windows 包已完整下载，SHA512 与官方更新元数据一致，Windows 签名验证为 `Valid`，签名主体为 Hangzhou DeepSeek Artificial Intelligence Co., Ltd.；未下载或安装 macOS 包。 | 官方元数据及对应二进制的 HTTP HEAD 响应、本机包校验与签名检查 |
| 桌面新增用途 | 下载页明确列出后台运行、本地文件读写、处理长时间复杂任务。官网展示插件与创造模式、文档/表格/演示文稿成果、自动化任务和执行轨迹；这些是 Harness 产品能力展示，不能单独据此认定每个展示项为桌面独有。 | [官方产品下载页](https://www.deepseek.com/download/)、[Harness 首页](https://www.deepseek.com/harness/) |
| 与 Web 的关系 | 官方开发者文档称桌面版为 Electron 应用，包含完整的 Web 应用；Electron 启动私有 Desktop Host，通过带认证的 Host 提供 RPC 与流，并加载打包 Web 资源。桌面 Host 默认使用端口 `19387`，可由 profile 配置覆盖。普通 Web 的官方入口仍是 `npx @deepseek-ai/dsh web`，Web 工作区需选择后才能发起会话。 | [官方架构文档：Desktop application](https://deepseek-harness.github.io/deepseek-harness/en/reference/#desktop-application)、[Harness 首页](https://www.deepseek.com/harness/)、[Web UI 使用指南](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart) |
| 与 CLI/Profile 的关系 | Desktop 独占 `$DSH_HOME/profiles/desktop`；CLI 和 Desktop 可共享同一 Harness home 的产品数据，但可执行包、插件启用选择与锁文件分离。公开发行的通用 CLI 不管理 Desktop profile；本机所装 `0.2.0-rc.2` 随包 CLI 支持 `--profile desktop`，但首次打开桌面程序初始化 profile 前明确拒绝操作。桌面壳通过内置 pnpm 操作其插件。 | [官方架构文档：Desktop application](https://deepseek-harness.github.io/deepseek-harness/en/reference/#desktop-application)、本机随包 CLI 验证 |
| 模型与登录 | 条款将官方模型（注册登录后默认配置）和用户自配模型 API 区分；自配模型可不注册登录。隐私政策说自配模型输入直接发给模型提供方，并提醒第三方插件、MCP、Skills 与 Hooks 可能独立处理数据。不能概括为所有桌面数据一律只留本机。 | [Harness 使用条款](https://www.deepseek.com/en/harness/terms-of-use/)、[Harness 隐私政策](https://www.deepseek.com/en/harness/privacy/) |

官方首页和下载页未提供桌面专用 FAQ、逐版本改动列表、自动迁移向导或 Windows 最低系统版本说明。本次没有找到可核验的 DeepSeek 官网首次发布公告日期；`releaseDate` 仅是以上更新源中的时间。发现官网文案与运行实现之间的差异时，应以所安装版本的实际行为再核对。

## 对当前 WSL 自用部署的迁移判断（推断，待实验）

当前自用 Web 服务的活跃 `DSH_HOME` 在 WSL Linux 用户目录，桌面版安装到 Windows 后预期默认读取 Windows 用户的 Harness home。官方所说“CLI 与 Desktop 共享产品数据”以同一 home 为前提，不能推出 Windows 桌面会自动读到 WSL 的会话、凭据、工作区及插件；具体默认路径和跨系统迁移工具尚未从官网确认。直接把 WSL home 复制到 Windows 还涉及路径、依赖及 profile 差异，不宜作为已验证操作。

桌面版可以承接本机原生窗口、后台继续执行、本地文件操作和完整 Web 界面；它适合作为 Windows 端独立试验入口。现役 WSL Web 仍承担现有 Linux 工作区、既有会话、Tailnet/iPad 入口及自用 profile。是否能完全取代它，至少取决于 Windows 桌面侧重装所需插件并核对 Desktop profile、迁移或继续访问 WSL 工作区与会话、验证远程移动端访问，以及确认看门狗和原生桌面生命周期的重叠行为。这些是本地适配问题，官网没有承诺自动完成。

## 本机实践状态

已安装上述签名核对通过的 Windows `0.2.0-rc.2`，安装位置为 `C:\Users\HuangZY\AppData\Local\Programs\DeepSeek Harness`；注册的显示版本和随包 `dsh.cmd --version` 均为 `0.2.0-rc.2`。尚未首次启动桌面 GUI，因此 Windows `$DSH_HOME/profiles/desktop` 尚未初始化，随包 CLI 的 `plugin --profile desktop list` 也明确要求先启动桌面程序并完全退出。不能将安装成功写成桌面 GUI、插件、会话迁移或远程访问已通过。建议先让桌面端在独立或已备份的 home 初始化，再核对插件和工作区路径；WSL Web/Tailnet 在同等用户路径验证前保持在线。

隔离的 WSL 源码候选已合并官方 `0.2.0-rc.2` 对应修订 `639ed015397290b3745d163aafe02ffee4aa3f84`。`pnpm install --frozen-lockfile`、源码构建及定向测试已通过；独立临时 `DSH_HOME` 的 Web 可启动且内容风险防护插件在构建补全后可导入，外部 memory 与 prompt optimizer 包在临时 profile 中可启用。以上仅证明候选和临时 profile，不能替代现役服务切换后、Windows 桌面交互、实际模型调用与 iPad/Tailnet 会话检查。
