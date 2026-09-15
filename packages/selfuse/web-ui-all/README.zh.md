# @dsh-selfuse/web-ui-all

[English](README.md) | 中文

自用 Web UI 载具只挂载三项自定义浏览器能力：Git 图、远程 Web UI、皮肤中心。客户端兼容层还为皮肤标记面板元素；宿主入口本身没有额外功能。

官方 Web bundle 已提供插件列表与设置、工作区文件、右侧 PTY 终端、预设、技能和任务工具。本 profile 不再挂载与其重叠的旧市场、设置、任务板、SSH、桌面壳配套插件。社区插件改用原生 CLI 管理：

```sh
dsh plugin --profile web list
dsh plugin --profile web add <包名>
dsh plugin --profile web remove <包名>
```

本地部署由 `config/selfuse/profiles.build.yml` 生成；不要手工修改生成的 `~/.dsh/profiles/web` 文件。生成器会保留通过原生 CLI 新增的依赖与 bundle 行。远程 UI 仍服务于 Tailnet/iPad 访问，皮肤中心保留用户壁纸。退役功能的源码暂时保留供参考，但不在活跃 profile 中。

合入官方更新时，比较 `cordis.patch.yml` 与官方 Web bundle，仅保留有独立用途的自定义行。
