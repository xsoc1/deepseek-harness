# Agent Note: 对已建立的 Remote 流 socket 做一次恢复

Status: implemented

[English](2026-09-13-established-stream-socket-recovery.md) | 中文

## Problem

iPad 经 Tailnet 多次重连后，完整 Web 壳已经渲染，但工作区浏览器一直为空；与此同时，同一生产入口返回 7 个工作区和 295 个会话。全新的 WebKit 环境能够加载全部 7 个工作区，因此 Host 持久化、Tailnet 可达性与当前 bundle 都可用。异常页面在独立的一元 Connection generation 仍显示已连接时丢失了已经建立的 Gateway 流 socket。`RemoteStreamMuxClient.lost()` 只会使活动逻辑流失败，却不会创建另一条 socket；其隔离重试因此永远等不到物理载体，工作区初始基线也就无法到达。

## Decision

已经建立的 mux socket 意外丢失时，`RemoteStreamMuxClient` 立即启动且只启动一个替代候选连接。活动逻辑流仍先失败，使 `RemoteStream` 能以新的 wire stream id 打开全新物理代次并接受替代基线。首次连接失败仍由上层所有者驱动；替代候选若在打开前失败，不会递归安排自己。显式重连与资源释放都会先解除旧 socket 的归属再关闭它，因此其 close 事件不会创建多余候选。

## Alternatives considered

**恢复浏览器可见的心跳期限。** 该期限造成了 iOS 持续重连回归；浏览器已经报告 socket 关闭时，不需要它来触发替换。

**在 Gateway 内无限重试所有失败连接。** Connection 已经拥有有上限的重试时序。候选连接递归重试会形成第二套调度器，并重新制造重连风暴。

**只给工作区增加刷新按钮或轮询。** 物理 mux 由工作区、会话和转发事件流共享。在载体边界修复后，每条逻辑流都能通过既有领域基线恢复，不必掩盖单个界面症状。

## Consequences

WebSocket 成功建立后的短暂丢失现在会立即产生一次新握手。新握手成功时，快照消费方从 Host 基线替换状态；若候选在打开前失败，Gateway 会停止，并把后续调度留给 Connection。本变更没有引入应用心跳、无限重试循环、Session 轮询或变更重放。

## Testing

回归测试让真实 `RemoteStream` 经由假的 `RemoteStreamMuxClient` 运行：第一条已建立 socket 在工作区基线到达前断开后，测试要求出现第二条 socket 和第二代基线。修复前它因 socket 数仍为 1 而失败；修复后通过。生命周期覆盖还证明首次候选失败仍由所有者驱动、一次已建立连接丢失只创建一个候选、候选失败不会递归、资源释放会取消待定替换。部署后，生产 WebKit 探针以 iPad 视口抑制第一次 `workspace/follow` 发送并关闭该 mux socket；它观察到第一条 socket 关闭、一个替代连接保持打开、页面恢复 7 个工作区行和 13 个树条目，并且没有页面异常或失败请求。探针随后删除。
