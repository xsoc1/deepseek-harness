# Agent Note: 幂等恢复 prompt 确认

Status: implemented

[English](2026-09-13-idempotent-prompt-acknowledgement-recovery.md) | 中文

## Problem

移动 Tailnet 路径切换时，Safari 可能已经把 `session/prompt` POST 送达 Host，却丢失其 HTTP 响应。Host 此时已经持久化用户消息，甚至可能完成整个回合；但生成的 Client Remote 会把 fetch 拒绝折叠为 `gateway/internal`，此前 Session 随即把本地回显按失败退休，并显示 `client api: session/prompt failed: Load failed`。若换一个新标识重试，又可能把同一条用户消息插入两次。

## Decision

普通直接 Session prompt 遇到含糊的 `gateway/internal` 确认结果后，复用不可变请求和 Host 幂等的 `requestId` 重试。重试采用 500ms、1s、2s、4s、8s、15s 的有界延迟。Host 已经会在在线 inbox 与持久 Session 日志中查找该 `requestId`；重复请求直接返回 `{ accepted: true }`，不会再次准入。

如果 Client 在重试结束前已经从持久用户事件或 queue occurrence 观察到同一个 `rpcId`，该观察同样是准入成功的权威证据，因此抑制传输错误。调用方 abort 会停止退避并返回 `gateway/cancelled`。领域失败不重试；30.5 秒后仍无法消除的载体错误继续对用户可见。Subagent prompt 的幂等契约不同，本次不修改。

## Alternatives considered

**使用新的请求标识重试。** 这种做法无法区分“确认丢失”和“请求从未到达 Host”，可能重复发送用户消息。

**把每个 `gateway/internal` 立即视为失败。** 即使 Host 持久日志已证明 prompt 被接受，仍会保留本次报告的错误。

**隐藏所有 prompt 传输错误。** 真正没有抵达 Host 的请求会作为虚假本地回显无限保留。恢复必须有界，耗尽后仍显示无法确认的失败。

**全局重试每种 Session 变更。** 其他变更并不都具备相同的持久幂等键，因此策略保留在直接 prompt 提交旁边。

## Consequences

短暂丢失响应时，本地提交会在恢复期间保持 pending，而不是立即显示错误。最多七次 HTTP 尝试携带相同 prompt 标识；在既有 inbox 与日志重复保护下，它们不会产生重复 Host 消息。持续中断最多延后 30.5 秒报告，显式取消仍会立即生效。

## Testing

Client 测试同时复现“已观察到准入，随后收到 `Load failed`”以及“首次含糊失败，随后用同一 ID 重试成功”，并验证退避期间取消与七次尝试上限。既有 Host 测试覆盖 Agent inbox 和持久 Session 日志中的重复 `requestId` 检测。现有生产日志无法识别提交设备：匹配的持久事件可能来自用户后来在电脑端的同文提交，因此不能据此证明 iPad 请求已经到达；运行态归因仍待核实。
