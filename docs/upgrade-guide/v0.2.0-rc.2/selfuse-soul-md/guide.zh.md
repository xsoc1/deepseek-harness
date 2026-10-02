---
kind: upgrade-guide
description: "私有 soul-md 用原生 profile 配置替代旧客户端设置。"
---

# soul-md 原生配置

[English](guide.md) | 中文

## 变更

私有 `@dsh-selfuse/soul-md` 配置层现在加载 `lib/index.js`，提供原生 Loader 配置。旧 `client.js` 与设置助手不再激活独立设置页。卡片路径、顺序、回退、监听与完整提示词选项保持；`maxFileBytes` 默认是 131072。

只有文件缺失才使用回退。非法 UTF-8、超大文件及其他读取错误使初始加载失败；监听错误保留此前有效卡片并记录告警。

## 迁移

1. 保留人设文件。构建本地包，通过原生 CLI 安装其 profile 层，参阅[包指南](../../../../packages/selfuse/soul-md/README.zh.md#use-this-package)。
2. 移除手工插入、引用旧包入口的客户端或助手条目。保留 `soul-md` 宿主条目与配置；使用官方插件配置表单，不再使用退役页面。
3. 卡片超过 128 KiB 时设置 `maxFileBytes`，最大 1 MiB。使用有效 UTF-8。除非有意替换其他提示词段，否则保持 `complete: false`。
4. 重启 profile，确认 Loader 条目激活，并确认保存后的卡片影响后续提示词。缺失卡片可在启动后创建；原子替换仍会被监听。不迁移 Session 或人设文件。
