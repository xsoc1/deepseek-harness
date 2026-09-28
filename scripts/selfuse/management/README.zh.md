# scripts

[English](README.md) | 中文

管理脚本的规范源（从 `F:\tools\deepseek-harness\` 复制）。

| 文件 | 作用 |
|---|---|
| `dsh-control.ps1` | DSH 启停、状态、UI 和日志 CLI。 |
| `packages/selfuse/control-gui/` | WinForms 独立图形控制台（含可执行文件与源码）。 |
| `run-dsh-web.ps1` | 启动 DSH Web（WSL 网关、可信 Host、日志）。 |
| `dsh-watchdog.ps1` | 看门狗探活、重启与心跳。 |
| `ensure-dsh-watchdog.ps1` | 计划任务兜底。 |
| `make-dsh-icon.ps1` | 图标生成工具。 |

> 这些文件当前也存在于运行目录 `deepseek-harness/`。
> 迁移后本目录是规范源，`install.ps1` 负责同步或包装到运行目录。
