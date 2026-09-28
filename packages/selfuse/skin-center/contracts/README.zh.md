# 皮肤约定（v2）— issue #506 第一阶段

[English](README.md) | 中文

本目录规定纯资源**皮肤**与**皮肤中心**之间的接口。皮肤只依赖这里的约定；皮肤中心是唯一加载与渲染器，并吸收与官方 DSH 的耦合。

## 文件

| 文件 | 固定的内容 |
| --- | --- |
| `skin-manifest-v2.schema.json` | skin.json v2 结构。编辑器可使用它；验证器必须使用本地副本，不得请求 `$id` URL。 |
| `hooks-api.d.ts` | `facets.client` 扩展 API（`x-org.linxin666.skin-center/v1alpha1`）：`SkinHooksContext`、`defineSkinHooks()`。 |
| `semantic-attrs-v1.md` | L2 语义属性枚举（`data-dsh-surface` / `data-dsh-part` / `data-dsh-plugin`），列出各值的归属、版本与含义。 |

运行时验证器（`src/core/manifest-v2/validate.ts`）负责失败关闭检查；JSON Schema 为编辑器和外部工具镜像该规则。两者需保持同步。

## 版本维度（不可混同）

- `skinManifestVersion`：skin.json 的**文件结构**版本，不参与兼容协商。
- `facets.client.apiVersion`：独立协商的 **hooks 运行时**接口版本。清单可解析不意味着 hooks 可执行。
- `requires.contracts[]`：声明的接口要求；`optional: true` 表示皮肤声明了降级路径（例如无 hooks 也能运行）。

## 对已弃用字段设白名单并失败关闭

未知字段是硬错误。v1 的 `package`、`wiring` 和 `bodyAttr` 是显式白名单：忽略并给迁移警告（运行 v1→v2 codemod），不视为错误；否则 11 个旧清单会被验证器自身拒绝。可选的许可元数据（`license`、`licenseUrl`、`noticeUrl`、`sourceUrl`、`attribution`）在 v2 中是一等字段。

## 加载器侧规则（在此固定，于 M2 执行）

- 加载器把皮肤 CSS 强制限制在 `html[data-dsh-skin="<id>"]`；皮肤不再声明 `bodyAttr`。
- CSS 白名单：禁止 `@import`、远程或协议相对 URL、路径逃逸和内联 JS；依赖 CSS Modules 哈希类名（`[class*=...]`）会告警。只允许目录内的相对资源。
- 清单里的每个文件引用都必须是皮肤目录内的相对路径；禁止前导斜杠、`..` 和协议 URL。
- 加载器在皮肤作用域的 body 上将官方壳的 `--shiki-background` 重新绑定到 `var(--dsw-alias-markdown-code-block)`。官方壳把变量声明在 `:root`，而深色代码块别名位于 `body[data-ds-dark-theme]`；缺少重新绑定时，深色模式下 Shiki 代码块仍会使用固定浅色背景（issue #826）。皮肤继续拥有别名值；加载器只恢复主题感知。

## 自动 token 回退

加载器提供 `official-tokens-v1.json`，它记录官方壳定义的所有 `--dsw-*` 自定义属性（不含静态色板）。官方前端变化时由 `scripts/official-tokens-snapshot.mjs` 重新生成。对于皮肤没有重映射的 token，加载器用 `color-mix()` 从皮肤自身色板派生半透明颜色，使新官方界面保持皮肤视觉而不退回默认色板。语义和结构分组（按钮、状态、遮罩、阴影、反色标签、字体）不会派生；皮肤已定义的 token 不会覆盖；某组没有锚点时不生成回退。派生只改变文本并通过皮肤自己的重映射解析，所以明暗主题都可用，不需要运行时逻辑。
