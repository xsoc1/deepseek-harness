# DSH 远程桌面版访问方案（iPad / 手机）

本文件记录 selfuse 仓库内针对 iPad/手机远程访问 **桌面版 Web UI** 的配置、代码改动与排障方法。

## 目标

- 远程设备（特别是 iPad）打开 **桌面版**：`https://xsoc.tail6cf486.ts.net/`
- 不再强制配对（平板无法完成配对）
- 远程访问尽量稳定，避免 `bundle script ... failed to load` 和页面长时间加载不出

## 当前架构

```text
iPad / 手机
   │  Tailscale 网络（tailnet only）
   ▼
https://xsoc.tail6cf486.ts.net
   │  Tailscale Serve：仅 tailnet 可访问
   ▼
Windows/WSL dsh source-run
   │  node --import tsx/esm apps/cli/src/bin.ts web
   └─ 绑定 127.0.0.1:3080，由 Tailscale Serve 转发
```

- 不用 Cloudflare 公网隧道：`remote-web-ui.autoTunnel: false`
- 公网/私有地址：`remote-web-ui.publicBaseUrl: 'https://xsoc.tail6cf486.ts.net'`
- 局域网不强制配对：`remote-web-ui.requirePairingForLan: false`
- 启动参数已加入 trusted host：
  - `--trusted-host 172.22.112.1`
  - `--trusted-host xsoc.tail6cf486.ts.net`

## 关键代码改动

### 1. 客户端 bundle 缓存与重试

文件：
- `packages/client/modules/src/index.ts`
- `packages/client/modules/lib/index.js`
- `packages/client/modules/src/client/system.ts`
- `packages/client/modules/lib/client.js`

实现：
- `/plugins/<id>/client.js?rev=...` 返回内容哈希 `ETag`
- 非 source map 使用：
  ```text
  cache-control: public, max-age=31536000, immutable
  ```
  因为 URL 上的 `rev` 就是内容哈希，bundle 变更后新 URL 自动失效。
- `defaultLoadBundle` 加载失败自动重试 2 次：
  ```text
  失败 → 300ms 后重试 → 600ms 后重试 → 再失败才报错
  ```

效果：
- 桌面版首次加载仍约 5 MB / 65 个 bundle。
- 后续打开只走浏览器缓存，不再反复下载，远程 Tablet 明显更稳。

### 2. 将 `*.ts.net` 视为可信/回环主机

把 Tailscale 域名加入各插件的 loopback/trust 判断，避免远程请求被本地栅栏拒绝：

- `packages/selfuse/remote-web-ui/src/loopback.ts`
- `packages/selfuse/ssh/src/loopback.ts`
- `packages/selfuse/better-sidebar/src/trust-fence.ts`
- `packages/selfuse/web-ui-task-board/src/loopback.ts`
- `packages/selfuse/web-ui-git-graph/src/host/loopback.ts`
- `packages/selfuse/wsl-workspace/src/index.ts`

判定逻辑：
```ts
hostname.endsWith('.ts.net')
```

### 3. remote-web-ui 取消 /remote 通道

`packages/selfuse/remote-web-ui/src/client/index.ts` 中：

```ts
const channelActive = (): boolean => {
  // Tailscale/tailnet 已 trusted 且不要求配对，
  // 桌面 Web UI 走普通 /api，不走门控 /remote。
  return false
}
```

服务端使用实时的 `requirePairingForLan()` 传入 mobile/remote routes，设置修改无需重启即可生效。

## iPad 使用步骤

1. iPad 需加入同一个 Tailscale tailnet。
2. Safari 打开（桌面版，不要用 `/m/`）：
   ```text
   https://xsoc.tail6cf486.ts.net/
   ```
3. 首次加载较慢属正常；之后浏览器会缓存 bundle，速度会改善。
4. 如果曾遇到旧报错，先在 Safari 清除该站点数据或使用无痕窗口。
5. 若需固定在主屏幕，仍可“添加到主屏幕”。

## 排障

- 仍报 `failed to load plugins`：
  - 确认 iPad 在网络可达 `xsoc.tail6cf486.ts.net`。
  - 不要直接访问局域网 IP / `100.x.x.x:3080`，除非已加入 trusted-host。
  - 现在脚本会自动重试，先等待重试结束再判断。
- 打开的是移动版而非桌面版：
  - 访问根地址 `/`，不要访问 `/m/`。
- 访问地址不是 `xsoc.tail6cf486.ts.net`：
  - 把实际域名/IP 加入 `run-dsh-web.ps1` 的 `--trusted-host` 参数。
- 整体更新：
  ```bash
  node scripts/selfuse/update.mjs --check
  node scripts/selfuse/update.mjs --apply --restart
  ```

## 相关提交

- `5a37748c2a perf(remote): make desktop remote loading reliable on tablets`
