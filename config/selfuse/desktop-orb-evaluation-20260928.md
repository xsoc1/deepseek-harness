# DSH Desktop 与 Orb 评估（2026-09-28）

## 已核实的版本与产品边界

- 官方远端已出现 `dsh-v0.1.7-rc.2` tag，根清单为 `0.1.7-rc.2`；本地运行树当前清单仍为 `0.1.7-rc.1`。`rc.2` 是本轮检查到的最新 tag，不代表已完成本地合并、构建或运行验证。[官方版本清单](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.1.7-rc.2/package.json)
- 官方 Desktop 是 Electron 承载的**完整 DSH Web 客户端**，以独立的认证 Host 运行；默认 Desktop 端口为 19387，Web 为 3080。换成 Desktop 并不会删除 Web 客户端代码，也不自动替代现有 iPad/Tailscale 的 3080 入口。[官方 Desktop 说明](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.1.7-rc.2/apps/desktop/README.md)
- 官方 Desktop 的 `$DSH_HOME/profiles/desktop` 与 Web profile 分开：在**同一可访问的 DSH_HOME** 下，Session、工作区、设置和凭据可共享；插件激活、可执行依赖、锁文件不共享。当前服务的 DSH_HOME 位于 WSL `/home/huangzy/.dsh`，Windows 原生 Desktop 默认不会自动读到它。把 WSL 路径或 `\\wsl$` 共享路径直接作为 Windows Desktop 的家目录、将 Linux 工作区 cwd 当作 Windows 路径使用，均尚无兼容性验证。[官方安装所有权](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.1.7-rc.2/apps/desktop/README.md#installation-ownership)；[本机远程架构](remote-desktop.md)
- 官方文档给出的 Windows x64 本地无签名安装包命令需要 Windows 构建环境、应用 ID、Python 与 Visual C++ 工具链；Linux 不是 Desktop 正式发布目标。源码开发启动默认隔离在 `.desktop-build/development/home`，显式 `DSH_HOME` 才会替换它。[官方 Desktop 构建与开发](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.1.7-rc.2/apps/desktop/README.md#develop)

## Orb 仓库是什么

- [mini-yifan/deepseek-harness-orb](https://github.com/mini-yifan/deepseek-harness-orb/tree/72f1d738458a223696685a909e806b683eff5885) 是自称非官方、基于 DSH 的**整仓派生桌面应用**，其主窗口仍是完整 Web UI；浮球、桌面 Computer Use、后台 `code_agent` 由 Electron main/preload/IPC、Desktop Host、设置页和实验性工具包协作实现。其当前检出的根清单与 Desktop 包均为 `0.1.7-rc.1`，不能把仓库 URL 交给 `dsh plugin add` 就得到浮球，也不能把该分支整体覆盖本地 selfuse 树。[Orb README](https://github.com/mini-yifan/deepseek-harness-orb/blob/72f1d738458a223696685a909e806b683eff5885/README.md)；[Orb Desktop 源码](https://github.com/mini-yifan/deepseek-harness-orb/blob/72f1d738458a223696685a909e806b683eff5885/apps/desktop/src/main.ts)；[Orb 工具包](https://github.com/mini-yifan/deepseek-harness-orb/blob/72f1d738458a223696685a909e806b683eff5885/packages/experimental/tool-computer-use/README.md)
- Orb 的 Computer Use 会读取当前前台窗口截图并操纵 GUI。工具包明确说明装配即授权、没有逐次点击批准；其浮球 Access 缺省为 `danger-full-access`，委派后台 Code Agent 的代码还会自动批准工具请求并回答部分用户问题。这与当前 selfuse 风险边界明显不同；若移植，建议默认 `read-only`，后台委派不自动批准危险请求，先对截图数据、权限、真实 Windows GUI 操作和取消/恢复路径做独立审计。[工具包安全说明](https://github.com/mini-yifan/deepseek-harness-orb/blob/72f1d738458a223696685a909e806b683eff5885/packages/experimental/tool-computer-use/README.md#use-this-package)；[Access 缺省源码](https://github.com/mini-yifan/deepseek-harness-orb/blob/72f1d738458a223696685a909e806b683eff5885/apps/desktop/src/orb-permission.ts)；[后台自动应答源码](https://github.com/mini-yifan/deepseek-harness-orb/blob/72f1d738458a223696685a909e806b683eff5885/packages/experimental/tool-computer-use/src/code-agent-unattended.ts)
- 该实验性工具包的说明还明确写着 Linux 可加载但执行时失败；因此即使仅抽出 `tool-computer-use`，也不能在当前 WSL 进程中获得 Windows 桌面点击能力。必须由 Windows 原生 Desktop Host 或另一个明确的跨进程驱动承担操作。[Orb 工具包平台限制](https://github.com/mini-yifan/deepseek-harness-orb/blob/72f1d738458a223696685a909e806b683eff5885/packages/experimental/tool-computer-use/README.md#use-this-package)

## 建议的分阶段验收（尚未执行）

1. 先把当前 WSL selfuse 树对齐官方 `rc.2`，运行生成器、相关单测、构建及原有 Web/Tailscale 冒烟；保留现有用户目录、旧会话和远程入口。
2. 在 Windows x64 的隔离 `DSH_HOME` 启动官方 Desktop：核对主窗口、模型/插件页面、最小会话、Windows 路径的文件与命令工具；不共用正在写入的 WSL 家目录或 Web profile。
3. 从关闭写入后的 WSL 数据快照复制到隔离目标，逐条核对 Session 投影/附件、旧预设别名与工作区路径；只有确认路径转换与旧会话只读/续写都可用，才考虑正式迁移。现有官方文档没有给出本机 WSL→Windows 的自动转换保证。
4. 若仍需要 iPad 访问，继续保留 WSL Web/Tailscale 服务，或另行设计经过鉴权与真实设备验证的远程入口；Desktop 本身不是该入口的等价替换。
5. Orb 先作为**桌面功能移植项目**在隔离分支评估，按 `rc.2` API 适配并跑其 Desktop/Host/Computer Use 单测，再做 Windows 真实截图、点击、非管理员窗口、取消与权限测试；通过后再决定是否纳入正式 Desktop，不应先装入当前 Web profile。

当前结论：官方 Desktop 适合先并行试用，不能据此弃用现有 Web 远程链；Orb 不能按普通插件安装，其安全默认值与跨模块改动需要单独适配。以上是源码与文档评估，不是桌面版安装或运行测试结果。
