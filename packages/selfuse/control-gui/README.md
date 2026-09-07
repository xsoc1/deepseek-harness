# @dsh-selfuse/control-gui

DeepSeek Harness 独立图形控制台程序。

## 特性
- **独立 Windows EXE**：通过 C# (.NET Framework 4.8) 原生编译为轻量级 Windows 可执行程序 `dsh-control-gui.exe`，无需外部脚本引擎启动。
- **后台守护进程解耦**：状态轮询与异步动作由轻量守护进程 `dsh-gui-poller.ps1` 在后台执行，UI 线程毫秒级响应，永不卡顿。
- **状态监控**：实时监控 WSL、Watchdog、Web UI (3080)、Tailscale 远程暴露、更新状态及最近日志。
- **配置与设置面板**：内置设置窗口，支持自定义顶部横幅图片、显示模式（Zoom/Stretch/Center）、高度调整，并具备窗口尺寸持久化记忆与自动工作区探测能力。
- **高分屏 DWM 自动缩放**：采用标准 Windows 缩放，保持大尺寸界面与清晰可读性。

## 文件结构
- `dsh-control-gui.exe`：编译生成的可执行文件
- `build-gui-exe.ps1`：一键编译脚本
- `dsh-gui-poller.ps1`：后台状态探测与控制守护脚本
- `gui-src/`：C# 源码 (`DshControlApp.cs`) 与应用程序清单 (`app.manifest`)
- `dsh.ico`：控制台应用图标

## 构建方式
```powershell
powershell -ExecutionPolicy Bypass -File ./build-gui-exe.ps1
```
附加 `-CreateDesktopShortcut` 可直接在桌面生成快捷方式。
