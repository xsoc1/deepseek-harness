# Agent Note: WSL 文件工具使用宿主原生路径

Status: implemented

[English](2026-09-17-wsl-file-tools-on-linux-host.md) | 中文

## 问题

无论 DSH 宿主运行在 Windows 还是 WSL 内，WSL 预设变体都会挂载 `WslFileSystem`。该后端先把 Linux 和 `/mnt/<drive>` 路径转换成 Windows UNC 或盘符路径，再交给 `LocalFileSystem`。在 Linux 宿主上，Node 会将这些路径当作进程目录下的相对路径。因此 `read`、`write`、`edit` 和 `str_replace_editor` 在打开目标文件前就失败。

## 决策

`WslFileSystem` 保留现有 `wsl-*` 预设身份，在文件系统边界按宿主选择路径。Windows 宿主保留 UNC／盘符和 9P 发布行为。Linux 宿主直接打开 Linux 路径，把 Windows 盘符路径映射到 `/mnt/<drive>`，且仅在发行版与 `WSL_DISTRO_NAME` 一致时映射 UNC 路径。文件身份与包含关系使用 `LocalFileSystem` 给出的宿主原生 realpath；模型可见路径仍为 Linux 路径。Linux 文件发布使用父类的原生原子实现，Windows 9P 覆盖仅保留在 Windows 分支。

所选 shell 用户名不会改变打开文件的 DSH 宿主账户。运行在 Linux 的 DSH 不会把其他发行版的 UNC 路径悄悄映射到自身文件系统。

## 考虑过的替代方案

**在 Linux 宿主上从 WSL 预设移除 `WslFileSystem`。** 不采用，因为已持久化的会话引用 `wsl-*` 预设，需要保持其文件系统和 shell 组合稳定。

**让所有路径经过 `wslpath` 或 Windows 宿主代理。** 不采用，因为 WSL 内的 Node 进程已经可以直接访问目标文件；额外转换或传输会增加故障边界，并模糊文件策略所依据的宿主身份。

## 后果

在 WSL 宿主上，四个文件工具和文件系统服务使用同一套 Linux 路径，包括真实的 DrvFs 文件。Linux 宿主会明确拒绝跨发行版 UNC 访问。插件的定向构建只生成变更的 `lib/fs.js` 产物；selfuse 更新器调用该构建，不重建无关的浏览器包。

回归测试在 Cordis context 中运行四个工具，并在可用时检查真实的 `/mnt/f` 挂载。Windows 9P 行为由未改动的分支保留，但此次 Linux 运行不能当作 Windows 运行时测试。
