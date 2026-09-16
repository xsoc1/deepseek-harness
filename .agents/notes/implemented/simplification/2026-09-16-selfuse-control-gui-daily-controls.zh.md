# Agent Note: 自用图形控制台只保留日常本机操作

Status: implemented

[English](2026-09-16-selfuse-control-gui-daily-controls.md) | 中文

## Problem

自用图形控制台把本机 DSH 启停，与重复的远程重启标签、修改 Tailscale Serve 的按钮、关闭整个 WSL 的按钮，以及绑定旧工作树路径和硬重置/推送流程的更新器混在一起。其目录按钮和版本行还把 Windows 镜像当成正在运行的 WSL 部署展示。这些入口使一个小型运维控制台暗示自己拥有并不可靠的管理能力。

## Decision

可见入口保留本机 DSH 启动、停止、重启、打开 Web、查看最近日志、刷新、打开活跃配置目录、复制诊断、按需远程体检、更新预检和设置。轮询进程只接受三种会改变状态的 DSH 生命周期动作与两种只读检查；不再分派修改 Tailscale Serve、关闭 WSL 或更新源码的命令。Tailscale 保留只读状态。重复的远程重启、清空日志、profile 目录入口、横幅菜单项和 Windows 镜像版本行均移除。旧默认设置 `%USERPROFILE%\.dsh` 会映射到活跃 WSL 路径 `\\wsl.localhost\Ubuntu\home\huangzy\.dsh`；自定义路径仍保留。

## Alternatives considered

**把高风险操作藏进高级菜单。** 隐藏它们仍会保留过时的更新器，以及前提条件不可靠的全局关闭和 Serve 修改路径。

**立即重做更新器和 Serve 修复。** 安全的源码升级与远程访问修复需要分别建立经过验证、明确目标和回退检查的流程；二者都不是日常 GUI 操作。原独立更新脚本仍留在仓库，但控制台已无法触发。

**删除所有配置目录入口。** 打开真正的 WSL DSH home 仍有助于检查活跃 profile 和排查本机状态，因此保留一个指向正确目录的入口。

## Consequences

较小的界面保留必要的本机恢复操作与只读状态，同时减少误触发变更的路径。GUI 和轮询回归测试固定保留按钮、禁止的命令及旧路径映射。日志右键菜单与 Ctrl+L 仍可清除界面中的文字。源码升级、Tailscale 配置和整个 WSL 的管理须在控制台外完成。
