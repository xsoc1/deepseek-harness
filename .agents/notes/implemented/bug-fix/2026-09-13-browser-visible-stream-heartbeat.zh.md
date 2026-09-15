# Agent Note: 浏览器可见的 Remote 流心跳实验

Status: implemented

[English](2026-09-13-browser-visible-stream-heartbeat.md) | 中文

## Problem

浏览器 WebSocket 可能保持 `OPEN`，但应用消息已无法到达 JavaScript。Safari 遇到 VPN 或隧道路由切换时，网络栈仍可能在页面下方回复协议层 Ping，而页面既收不到增量思考，也收不到 Session 终止事件。因此 Host 侧 Ping/Pong 仍报告载体健康，Connection 没有 source failure 可触发重试策略，远程页面便可能在 Host 回合已经结束后无限显示“思考中”。

## Decision

随包 `RemoteStreamMuxClient` 不再声明 `dsh-application-heartbeat-v1` WebSocket 子协议。`RemoteStreamMuxServer` 保留休眠的显式选择加入能力；只有未来的专用 Client 主动协商该协议时，Host 才会在每个 WebSocket Ping 旁发送严格的 `{ type: 'heartbeat', timeoutMs }` 文本帧。原生 Ping/Pong 继续负责 Host 侧对端检测与网络中间层保活。已经回滚的初始实验曾让随包 Client 声明该协议，因为浏览器 JavaScript 无法观察 WebSocket 控制帧。

在那次实验中，`RemoteStreamMuxClient` 会在每个通过校验的应用层心跳到达时重置一个归属当前 generation 的计时器。超时会产生 `RemoteStreamCarrierError`，使该物理 socket 上的全部逻辑流失败，并以私有 `4001` 心跳超时代码关闭连接。既有 `$events` source failure 随后把控制权交回 [`ConnectionController`](../../../../packages/client/connection/src/client/connection.ts)，由它负责重试时序、替换 mux socket 并重开事件 generation。这个无条件 Client 期限现已移除。

线协议解析器只接受精确的心跳键，以及浏览器计时器范围内的正整数超时值。畸形心跳仍属于协议故障。本决策不引入第二套恢复调度器、Session 轮询循环或仅供远程 UI 使用的 watchdog。

## 生产回滚

随包 `RemoteStreamMuxClient` 不再声明该子协议，也不再启动文本心跳期限。生产 iPad/Tailnet 路径漏掉应用帧时，这个无条件期限会反复关闭载体，使界面持续重连。Host 保留可选协议以维持兼容，但只有未来专用 Client 显式协商时才会启用。原生 Ping/Pong 和普通 WebSocket failure 继续驱动 Connection 恢复。后续更安全的半开恢复机制必须先验证路径，不能再给移动连接施加无条件关闭期限。

## Alternatives considered

**只使用 WebSocket Ping/Pong。** 浏览器代码无法观察控制帧，而且 Safari 可能在 JavaScript 层业务投递停摆时仍由更底层网络栈回复 Pong。这正是本变更必须识别的故障模式。

**把任意普通 Remote item 当作活动信号。** 空闲但健康的 `$events` 流可以在任意长时间内没有业务项，因此静默不存在安全的领域级期限。专用心跳把载体活性与 Session 活动分开。

**由远程 UI 轮询 Session 状态。** 轮询会复制事件传输、只修复一个消费方，并可能与增量思考发生竞态。使共享载体失败，可让所有 Remote 流统一使用既有 generation reset 与领域自有的回放语义。

**在 Gateway 内增加另一套重连循环。** Connection 已经拥有持续抖动重试与握手期限。第二个调度器会造成重叠尝试与责任归属不清；Gateway 只报告载体失败，把调度留给 Connection。

## Consequences

普通浏览器 socket 不再接收应用心跳文本帧，也不存在由心跳驱动的 `4001` 关闭期限。selfuse 曾实验六秒期限，虽能更快识别半开投递，却会反复误杀一条在恢复前连续三次探测超时的 iPad Tailnet 连接，因此稳定的移动传输优先。Host Ping/Pong 与普通 WebSocket failure 仍可识别协议层断联。先前的半开业务投递问题因此不宣称已经解决；任何替代方案都必须先验证路径，不能给移动连接施加无条件期限。

## Testing

协议测试接受精确心跳，并拒绝非法超时或额外键。Host 载体测试验证已协商的 Client 同时收到 Ping 和派生出的应用层超时，而未声明子协议的 Client 不会收到应用层帧；Gateway 集成测试验证配置后的周期。Client 假计时器覆盖复现应用层心跳停止但 socket 仍打开的情况，并验证载体失败与 `4001` 关闭。实时浏览器诊断只丢弃 Host 到页面的 WebSocket 数据、保持 socket 打开，等待 Host `turn/end`，再验证心跳超时会建立新 socket 并恢复最终 Session 状态。

回滚新增 Client 回归，证明随包浏览器不再选择加入。生产插桩先复现异常关闭和随后的重连，再观察替换后的无子协议 socket 连续四十秒保持稳定。随后一次干净的 Tailnet 探针让生产 mux 连续保持四十五秒，收到一个 ready 帧和四个原生 Ping 帧、没有应用心跳，并且只在探针结束时正常关闭。临时插桩和探针随后删除。
