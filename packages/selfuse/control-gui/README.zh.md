---
description: "通过 Windows 图形控制台管理并检查本机 WSL 中运行的 DSH Web 服务。"
kind: "package-reference"
---

# @dsh-selfuse/control-gui

[English](README.md) | 中文

## 概述

这个 Windows 图形控制台用于启动和观察本机部署在 WSL 中的 DSH Web 服务。它是原生 Web UI 的辅助工具，不是 Harness 插件，也不替代原生插件管理。

## 目录

- [功能](#controls)
- [状态](#status)
- [构建](#build)
- [已知限制与待办](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

<a id="controls"></a>
## 功能

- 启动、停止、重启本机 DSH watchdog 与 Web 进程链。
- 打开本机 Web UI、查看最近的 watchdog 与 Web 日志，并刷新状态。日志区也会跟随新输出；右键菜单和 Ctrl+L 只清除界面显示的文字。
- 打开活跃 WSL DSH 配置目录、复制状态诊断，并在设置中调整横幅和源码路径。主窗口尺寸会在重新打开时保留。

<a id="status"></a>
## 状态

控制台由后台 PowerShell 进程轮询。Web 只有返回 HTTP 200 才显示绿色；Tailscale 只有服务和后端运行且取得 Tailnet IP 才显示绿色。状态文件超过 15 秒未更新时显示未知。Tailscale 状态为只读信息，控制台不会修改 Serve 配置。

默认 DSH 配置路径为 `\\wsl.localhost\Ubuntu\home\huangzy\.dsh`。现有设置若仍指向旧 Windows `%USERPROFILE%\.dsh`，加载时会映射到该 WSL 路径；明确自定义的路径会保留。Windows 源码目录与 WSL DSH 配置目录是两个不同位置。

<a id="build"></a>
## 构建

在 Windows 的本包目录执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\build-gui-exe.ps1
```

生成的 `dsh-control-gui.exe` 使用同目录或已配置源码工作树中的 `dsh-gui-poller.ps1`。替换正在运行的程序后，需重新打开控制台。

<a id="known-limitations-and-deferred-work"></a>
## 已知限制与待办

- 控制台不提供自动更新 DSH 或修复 Tailscale Serve 的按钮。DSH 源码升级需走经过检查的维护流程；插件管理使用原生 `dsh plugin --profile web` CLI。
- 控制台只管理本机 DSH 部署。其状态探测不代表已验证 iPad 等远程设备上的浏览器会话。

<a id="dev-note"></a>
## 开发备注

`tests/console-features.ps1` 检查界面入口和已移除的轮询命令；`tests/status-regression.ps1` 检查 Web 与 Tailscale 状态判定。
