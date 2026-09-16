# Agent Note: 图形控制台状态必须有实时服务证据

Status: implemented

[English](2026-09-16-control-gui-live-status.md) | 中文

## Problem

自用 Windows 图形控制台曾在只有 Windows 侧 3080 端口桥接仍监听时，报告 DSH 正在运行。Tailscale 命令失败时也会报告已连接，因为除明确登录提示外的任何输出都被算作连接。GUI 轮询进程停止后，最后一次绿色状态文件会无限期留在界面上。

## Decision

轮询进程只有在端口检查和 HTTP 200 响应都成功后才把 Web 标为就绪。它把监听进程 PID 标为端口 PID，而不是 WSL DSH 进程。只有 Windows Tailscale 服务正在运行、`tailscale status --json` 成功且 `BackendState=Running`，并且 `Self.TailscaleIPs` 包含 IPv4 地址时，Tailscale 才显示已连接。命令执行上限为 2.5 秒。GUI 拒绝超过 15 秒的状态文件；轮询停止或读取失败时，先前的绿色状态会清除。构建脚本等待编译器进程并读取其真实退出码。

## Alternatives considered

**把开放的 TCP 端口视为 DSH 健康。** WSL 应用停止后，Windows 端口桥接仍可能监听，因此 TCP 成功不能证明应用有响应。

**从人类可读的 CLI 输出推断 Tailscale 已连接。** 守护进程错误不是登录提示；文本匹配不能区分这些错误与有效连接。JSON 后端状态和已分配的 Tailnet IP 提供明确证据。

**持续显示最后一次快照，直至新快照到来。** 轮询进程死亡会使绿色标签永久保留。文件时间戳无需增加另一条 IPC 通道，就能给出有界的新鲜度判断。

## Consequences

启动和短暂探测失败现在显示橙色的未知或未就绪状态，而不是虚假的绿色。状态回归测试覆盖 Tailscale 停止、错误、运行以及 GUI 的仅端口、健康、过期快照；隔离轮询探针确认仅有 TCP 监听不会让 Web 显示就绪。编译后的 EXE 通过启动自检退出检查。这些检查不等于对用户当前 GUI 窗口的可视检查，也没有切换用户当前的 Tailscale 连接。
