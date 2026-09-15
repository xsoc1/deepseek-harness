# Agent Note: 限定 self-use 远程冷启动载荷

Status: implemented

[English](2026-09-13-remote-cold-boot-payload.md) | 中文

## Problem

完整 Web UI 可以通过 iPad Tailnet 路径返回 HTML，却可能一直停在 `Loading plugins…`，无法到达工作区界面。在线 peer 会在 IPv6 直连与香港 DERP 之间切换并频繁超时，因此需要把故障与 Safari 语法兼容性、服务器可用性分别验证。

冷启动根页面声明了 18 个启动 bundle。官方 WebServer gzip 已经启用，但这些 bundle 仍需传输 4,708,460 字节。其中包含 `ui-sidebar-documentpreview` 的四项组合包占 3,248,434 个压缩后字节，因为这个可选预览插件即使未打开任何文档，也会预先内嵌 PDF.js、Worker、CMap、字体与 WASM。

## Decision

self-use profile 清单持有一个 `disabledRows` 列表，记录从官方 bundle 继承的稳定 Cordis row ID。生成器先输出这些覆盖项，再输出普通 self-use 插件插入项。此部署通过该列表禁用 `ui-sidebar-documentpreview`。

这是 profile 层自定义，不是对官方文档预览实现或 WebServer 的分叉。官方文件树和右侧 Sidebar 仍保持启用。生成器回归测试还会断言当前官方 Web bundle 中仍存在被禁用的 row；若上游改名，维护时会明确失败。

## Alternatives considered

**在 client-modules 中新增压缩。** 检查当前官方组合后否决：`dsh-host-webserver` 已经为完整 HTTP 表面协商 gzip。再做一次 bundle 专用压缩会重复传输层，也不能消除数 MB 的 PDF 预加载载荷。

**认定 Safari 不兼容。** 当前 WebKit 探测以及人为移除 `Promise.withResolvers` 的探测都能进入工作区界面，且没有脚本或资源失败，因此否决。

**修改 MTU 或强制 Tailscale 中继路径。** 不同包长的探测没有显示故障与载荷大小相关；临时 Windows 代理绕过实验也没有改善 iPad peer 的 endpoint 抖动。这些实验性网络改动均已回退。

**把 PDF 预览重写为延迟加载资产。** 这是范围更大的上游架构变更。self-use 部署没有强到足以承担该分叉的需求，而 profile 可以干净地省略这个可选查看器。

## Consequences

冷启动 bundle 的压缩传输量从 4,708,460 降至 1,516,914 字节。在同一组可复现的 1 Mbps 下载、400 ms 延迟条件下，改动前页面经过 26.4 秒仍停在 `Loading plugins…`；配置后的 profile 用 16.1 秒进入工作区选择器，没有资源失败或 JavaScript 异常。当前 WebKit 在不限速的 Tailnet URL 上用 2.0 秒进入同一界面。

右侧 Sidebar 不再通过官方文档预览 tab 预览 Markdown、代码、图片、HTML 或 PDF。文件仍可浏览；从 `disabledRows` 移除 row ID 并重新生成 profile 即可恢复。Tailnet endpoint 不稳定仍是独立网络条件；缩小且限定启动载荷能降低其影响，但不声称修复 iPad 链路本身。
