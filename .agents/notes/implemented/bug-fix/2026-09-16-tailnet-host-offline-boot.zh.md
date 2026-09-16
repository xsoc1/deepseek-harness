# Agent Note: 离线启动后信任已配置的 Tailnet 主机

Status: implemented

[English](2026-09-16-tailnet-host-offline-boot.md) | 中文

## Problem

Windows 启动脚本原先只从 `tailscale status --json` 获取 DSH 的 `--trusted-host` 值。如果 DSH 启动时 Tailscale 不可用，Web 服务器就不会加入 Tailnet 主机名。之后启动 Tailscale 虽可恢复 HTTPS，但 `/api/remote.mux` 仍会以 HTTP 403 拒绝 Tailnet 的 Host 和 Origin，导致远程页面持续重连。

## Decision

启动脚本还会在启动 WSL 后读取活跃 WSL `settings.yaml` 中的 `remote-web-ui.publicBaseUrl`。它只接受主机名位于 `*.ts.net` 下的 HTTPS 根 URL，且不含凭据、查询、片段或非默认端口。在线 Tailscale CLI 报告的主机名优先；否则使用已配置的主机名作为 `--trusted-host`。Tailscale Serve 管理仍以 CLI 在线为条件。

## Alternatives considered

**先等待 Tailscale 再启动 DSH。** 这会让本地 DSH 的可用性依赖另一个网络服务，而且仍存在重启顺序竞争。

**信任所有 Tailnet 主机名。** 通配符会把 Web 服务器接受的 Host 和 Origin 扩大到已配置远程端点之外。

## Consequences

DSH 可以在 Tailscale 离线时启动，并在私有 Serve 路径恢复后接受已配置的远程主机名。回归测试会拒绝无关或格式错误的 URL。使用新参数重启 DSH 后，已观测到通过 Tailnet HTTPS 端点的 WebSocket 握手从 HTTP 403 变为成功打开。该服务端结果不能证明 iPad 当前连接的质量。
