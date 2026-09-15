---
description: "为 dsh Web profile 增加受配对保护的远程桌面访问、设备撤销和可选隧道管理。"
kind: "package-bundle"
---

# @dsh-selfuse/remote-web-ui

[English](README.md) | 中文

## 概要

这个 profile 层允许另一台电脑通过一次性配对链接打开完整的 dsh Web UI。主电脑可以生成二维码链接、查看设备在线状态、撤销设备，并可选择启动 Cloudflare 隧道。既可单独安装，也可通过已包含它的 `@dsh-selfuse/web-ui-all` 安装；移除该层会停用配对与远程代理路由。它不提供独立移动端界面。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步阅读](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与待办](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

### 安装到 profile

可以直接安装本 bundle，也可以安装已经携带它的全家桶：

```text
dsh plugin --profile <name> add @dsh-selfuse/remote-web-ui
dsh plugin --profile <name> remove @dsh-selfuse/remote-web-ui
```

包清单声明了 `dsh.bundle.patch`，profile 协调过程通过 `cordis.patch.yml` 的单行配置同时挂载 Host 与 Web 两个部分。

### 配对远程电脑

1. 在主电脑通过 `http://127.0.0.1:3080` 打开 Web UI，然后选择“远程访问”。
2. 选择远程电脑可以访问的网络地址，必要时刷新二维码，然后复制远程设备配对链接。
3. 在另一台电脑打开链接。接受成功后，浏览器保存可撤销的设备 Cookie，从地址栏删除一次性令牌，并重新载入完整 Web UI。
4. 使用“停止”撤销所有设备，或在已授权设备列表中撤销单台设备。

配对链接指向 `/?pair=...`。本包不提供 `/m`、`/m/`、`/m/api/*`、移动端 bundle 或 PWA worker。

### 选择网络路径

局域网地址仅在两台电脑都能访问该地址时有效。`publicBaseUrl` 可以填写 HTTPS 反向隧道地址。`autoTunnel` 会启动匿名 Cloudflare quick tunnel，每次隧道重启都会更换主机名。

Tailscale Serve 可以把稳定的 Tailnet 主机名代理到 `http://127.0.0.1:3080`。该主机名仅限 Tailnet：即使 dsh Host 和 Serve 进程正常，远程电脑也必须在线并加入同一 Tailnet。不要仅为启用配对而使用 `--trusted-host`；它会为该 Host 打开普通 `/api` 通道，绕过插件受配对保护的 `/remote/api` 通道。

### 配置

| 字段 | 默认值 | 作用 |
|---|---:|---|
| `enabled` | `true` | 挂载入口、配对路由、远程路由和访问栅栏。 |
| `tokenTtlMs` | `600000` | 一次性配对令牌的有效期。 |
| `offlineAfterMs` | `25000` | 设备无活动多久后显示为离线。 |
| `maxDevices` | `4` | 最多保存的设备会话数；超出后淘汰最旧会话。 |
| `idleExpireMs` | `604800000` | 设备会话空闲超过该时间后删除。 |
| `cookieName` | `dsh_pair` | 携带设备会话 ID 的 Cookie 名称。 |
| `requirePairingForLan` | `true` | 让非回环桌面流量通过受配对保护的 `/remote/api`。 |
| `publicBaseUrl` | 未设置 | 未运行自动隧道时生成配对链接所用的基础地址。 |
| `devicesFile` | `$DSH_HOME/remote-web-ui-devices.json` | 持久化设备会话文件。 |
| `autoTunnel` | `false` | 启动并管理 Cloudflare quick tunnel。 |

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

[`cordis.patch.yml`](cordis.patch.yml) 插入一个双端插件。[`src/index.ts`](src/index.ts) 负责配对状态、路由安装、访问栅栏、在线状态、隧道生命周期和远程桌面代理路由。[`src/client/index.ts`](src/client/index.ts) 负责设置与配对面板、接受配对链接、从非回环桌面页面发送在线心跳，并在配置要求时选择受配对保护的远程通道。

Host 会在读取未配对的 `/remote/api` 请求体之前拒绝请求。远程请求重新发送到回环地址时不会转发远程 Origin 或配对 Cookie。设置、凭据、更新控制、原生对话框和插件管理控制端点仍只允许回环访问。

</details>

-----

<a id="further-exploration"></a>
## 进一步阅读

- [Profile 组合](../../../docs/architecture.zh.md)
- [Cordis 配置](../../../docs/cordis-primer.zh.md)

-----

<a id="model-experience"></a>
## 模型体验

### 远程桌面传输

#### 模型看到什么

本包的任何内容都不会进入模型请求。它只决定已配对浏览器是否通过 `/remote/api` 访问现有 Web 运行时，不添加提示、工具、消息、附件或会话事件。

#### Token 影响

无。配对状态、在线心跳和浏览器传输元数据都在对话之外处理，不消耗模型输入或输出 Token。

#### KV Cache 影响

无。本包不改变模型提示前缀或对话内容，因此不会使模型 KV Cache 失效或扩大其占用。

## 已知限制与待办

<a id="known-limitations-and-deferred-work"></a>

- 已经在途的配对请求可以在撤销后完成；下一次请求会被拒绝。
- 一次性配对令牌不会持久化。设备会话会持久化，并在 Web 重启后继续有效，直到被撤销或因空闲而过期。
- Cloudflare quick tunnel 地址是临时的，且没有可用性保证。需要固定主机名时使用命名隧道或 Tailscale Serve。
- Tailscale Serve 不会把页面变成公网服务。远程电脑离开 Tailnet 后无法打开 Tailnet 主机名。
- 完整桌面 UI 是唯一远程界面。小屏布局沿用主 Web UI，不提供独立移动端优化。
- 本地维护的部署可以关闭受配对保护的远程通道，并直接信任 Tailscale Host。该模式完全依赖 Tailnet 成员身份，不能作为公网地址暴露。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作背景——点击展开</summary>

只有在存在当前用户和端到端移动端验证负责人时，才重新引入独立移动端客户端。新客户端默认不得共享桌面特权控制路由。

</details>
