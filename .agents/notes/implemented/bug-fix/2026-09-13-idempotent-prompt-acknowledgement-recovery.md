# Agent Note: Idempotent prompt acknowledgement recovery

Status: implemented

English | [中文](2026-09-13-idempotent-prompt-acknowledgement-recovery.zh.md)

## Problem

Safari can deliver a `session/prompt` POST to the Host and then lose its HTTP response while a mobile Tailnet path changes. The Host has already persisted the user message and may complete the turn, but the generated Client Remote folds the fetch rejection into `gateway/internal`, so the Session previously retired its local echo as failed and displayed `client api: session/prompt failed: Load failed`. Retrying with a new identity would risk inserting the same user message twice.

## Decision

An ordinary direct Session prompt reuses its immutable request and Host-idempotent `requestId` after an ambiguous `gateway/internal` acknowledgement. Retries use bounded delays of 500ms, 1s, 2s, 4s, 8s, and 15s. The Host already searches the live inbox and durable Session log for that `requestId`; a duplicate returns `{ accepted: true }` without another admission.

If the Client observes the same `rpcId` in a durable user event or queue occurrence before a retry settles, that observation is also authoritative proof of acceptance and suppresses the transport error. A caller abort stops the backoff and returns `gateway/cancelled`. Domain failures are not retried, and an unresolved carrier failure remains visible after 30.5 seconds. Subagent prompting is unchanged because its idempotency contract is separate.

## Alternatives considered

**Retry with a new request identity.** This cannot distinguish a lost acknowledgement from a request that never reached the Host and can duplicate the user's message.

**Treat every `gateway/internal` result as immediate failure.** That preserves the reported bug even though the Host's durable log proves the prompt was accepted.

**Hide all prompt transport errors.** A request that never reached the Host would remain as a false local echo indefinitely. Recovery is bounded, after which the unresolved failure stays visible.

**Retry every Session mutation globally.** Other mutations do not all expose the same durable idempotency key. The policy therefore remains next to direct prompt submission.

## Consequences

A transient response loss may keep the local submission pending during recovery instead of immediately showing an error. At most seven HTTP attempts carry the same prompt identity; they cannot create duplicate Host messages under the existing inbox-and-log duplicate guard. Persistent outages take up to 30.5 seconds longer to report, while explicit cancellation remains immediate.

## Testing

Client tests reproduce both observed acceptance followed by `Load failed` and an initial ambiguous failure followed by a successful same-id retry. They also verify cancellation during backoff and the seven-attempt bound. Existing Host tests cover duplicate `requestId` detection in both the Agent inbox and durable Session log. The available production log cannot identify the submitting device: the matching durable event may have been the user's later PC submission, so it is not evidence that the iPad request arrived. Runtime attribution remains unverified.
