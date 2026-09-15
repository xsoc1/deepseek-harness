/**
 * Local submission echoes: synchronous insertion, observed/failed retirement,
 * and settlement callbacks. Prompts and the follow stream cross the assembled
 * Gateway client and are answered by endpoint name.
 */

import { afterEach, describe, expect, vi } from 'vitest'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import type { FileAttachmentRef, ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import { SessionSeq, type SessionEvent } from '@deepseek-ai/dsh-session/types'
import type { SessionId } from '@deepseek-ai/dsh-api-remotes/client'
import { RemoteError } from '@deepseek-ai/dsh-typert-protocol'
import { createClientTest, webApp } from '@deepseek-ai/dsh-client-test-runtime/src/assembly/index.ts'
import { ok } from '@deepseek-ai/dsh-remote-mock'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { PendingSubmissionRetirement } from '../src/client/contract/session.ts'
import type { SessionRequestId } from '../src/types.ts'
import { sessionBench } from './remote/bench.client.ts'
import {
  FOLLOW, err, fileRef, followScript, history, imageRef, pushEvent, queueFrame,
} from './remote/session.client.ts'

/** A Session talks through the Gateway client; its dependency cone is the Typert registry and the Connection. */
const API_ROSTER = webApp.closure(['@deepseek-ai/dsh-api-gateway'])
const it = createClientTest({ roster: API_ROSTER })
const SID = 'fk-s1' as SessionId
/** The first client boot pays the cold module transform of the api cone. */
const COLD_BOOT_TIMEOUT_MS = 60_000

afterEach(() => {
  vi.unstubAllGlobals()
})

type AttachmentRef = ImageAttachmentRef | FileAttachmentRef

function attachmentBlock(attachment: AttachmentRef) {
  return 'mediaType' in attachment
    ? { type: 'image' as const, attachment }
    : { type: 'file' as const, attachment }
}

/** A durable browser-prompt user/message whose source echoes `rpcId`. */
function promptEvent(seq: SessionSeq, rpcId: SessionRequestId, refs: readonly AttachmentRef[] = []): SessionEvent {
  return {
    seq,
    time: 1_700_000_000_000 + seq,
    type: 'user/message',
    surfaceOp: 'append',
    data: createUserMessage({
      content: [
        ...refs.map(attachmentBlock),
        { type: 'text' as const, text: '发送' },
      ],
      source: { kind: 'user', rpcId },
    }),
  } as unknown as SessionEvent
}

/** The Host's queue holding one occurrence of the prompt `rpcId`. */
function queuedFrame(rpcId: SessionRequestId, refs: readonly AttachmentRef[] = []) {
  return queueFrame(SID, [{ id: 'm-queued', rpcId, content: refs.map(attachmentBlock) }])
}

/** Let the frame-delayed retirement (setTimeout fallback in this node environment) run. */
function settleFrames(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

describe('beginSubmission', () => {
  it('inserts the echo synchronously and flips the engaging edge before any prompt call', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    expect(session.getSnapshot()).toMatchObject({ pendingSubmissions: [], promptAttempted: false })
    const handle = session.beginSubmission({
      mode: 'queue',
      text: '你好',
      attachments: [{
        type: 'image', value: { previewUrl: 'blob:p1', name: 'a.png', width: 4, height: 3 },
      }],
    })
    expect(session.getSnapshot().promptAttempted).toBe(true)
    expect(session.getSnapshot().pendingSubmissions).toMatchObject([{
      requestId: handle.requestId,
      placement: 'transcript',
      text: '你好',
      attachments: [{
        type: 'image', value: { previewUrl: 'blob:p1', name: 'a.png', width: 4, height: 3 },
      }],
    }])
    expect(mock.log.requests()).toEqual([])
  }, COLD_BOOT_TIMEOUT_MS)

  it('derives and captures the echo placement from running state and delivery mode', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    session.beginSubmission({ mode: 'queue', text: '空闲', attachments: [] })
    session.handleRunning(true)
    session.beginSubmission({ mode: 'queue', text: '排队', attachments: [] })
    session.beginSubmission({ mode: 'steer', text: '纠偏', attachments: [] })
    session.handleRunning(false)
    expect(session.getSnapshot().pendingSubmissions.map(({ text, placement }) => ({ text, placement }))).toEqual([
      { text: '空闲', placement: 'transcript' },
      { text: '排队', placement: 'queued' },
      { text: '纠偏', placement: 'steering' },
    ])
  })

  it('abandon retires the echo as failed exactly once', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    const retirements: PendingSubmissionRetirement[] = []
    const handle = session.beginSubmission({
      mode: 'queue',
      text: '放弃',
      attachments: [],
      onRetire: retirement => retirements.push(retirement),
    })
    handle.abandon()
    handle.abandon()
    expect(session.getSnapshot().pendingSubmissions).toEqual([])
    expect(retirements).toEqual([{ reason: 'failed' }])
  })
})

describe('prompt-coupled retirement', () => {
  it('a rejected identified prompt retires its echo immediately alongside promptError', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    mock.remote.session.prompt.mockResolvedValue(err(new RemoteError('session/agent-busy', '忙', { reason: 'busy' })))
    const retirements: PendingSubmissionRetirement[] = []
    const handle = session.beginSubmission({
      mode: 'queue',
      text: '失败的',
      attachments: [],
      onRetire: retirement => retirements.push(retirement),
    })
    const result = await session.prompt([{ type: 'text', text: '失败的' }], 'queue', undefined, handle.requestId)
    expect(result.ok).toBe(false)
    expect(session.getSnapshot().pendingSubmissions).toEqual([])
    expect(session.getSnapshot().promptError).toMatchObject({ op: 'send', error: { code: 'session/agent-busy' } })
    expect(retirements).toEqual([{ reason: 'failed' }])
  })

  it('sends the echo identity as the prompt requestId', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    const handle = session.beginSubmission({ mode: 'queue', text: '带 id', attachments: [] })
    await session.prompt([{ type: 'text', text: '带 id' }], 'queue', undefined, handle.requestId)
    expect(mock.log.requests('session/prompt')).toMatchObject([{ requestId: handle.requestId, sessionId: SID }])
  })

  it('accepts an identified prompt whose durable echo arrives before a carrier failure', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    await session.open()
    const response = Promise.withResolvers<RemoteResult<{ accepted: true }>>()
    mock.remote.session.prompt.mockReturnValue(response.promise)
    const handle = session.beginSubmission({ mode: 'queue', text: '回程丢失', attachments: [] })
    const inFlight = session.prompt(
      [{ type: 'text', text: '回程丢失' }], 'queue', undefined, handle.requestId,
    )

    await pushEvent(mock, promptEvent(SessionSeq(0), handle.requestId))
    await settleFrames()
    response.resolve(err(new RemoteError(
      'gateway/internal', 'client api: session/prompt failed: Load failed', {},
    )))

    await expect(inFlight).resolves.toEqual(ok({ accepted: true }))
    expect(session.getSnapshot().promptError).toBeNull()
    expect(mock.log.requests('session/prompt')).toHaveLength(1)
  })

  it('retries an ambiguous prompt failure with the same id', async ({ mock, start }) => {
    vi.useFakeTimers()
    try {
      const session = await sessionBench(mock, start, SID)
      mock.remote.session.prompt
        .mockResolvedValueOnce(err(new RemoteError(
          'gateway/internal', 'client api: session/prompt failed: Load failed', {},
        )))
        .mockResolvedValueOnce(ok({ accepted: true }))
      const handle = session.beginSubmission({ mode: 'queue', text: '安全重试', attachments: [] })
      const inFlight = session.prompt(
        [{ type: 'text', text: '安全重试' }], 'queue', undefined, handle.requestId,
      )

      await vi.advanceTimersByTimeAsync(0)
      expect(mock.log.requests('session/prompt')).toHaveLength(1)
      await vi.advanceTimersByTimeAsync(500)

      await expect(inFlight).resolves.toEqual(ok({ accepted: true }))
      expect(mock.log.requests('session/prompt')).toMatchObject([
        { requestId: handle.requestId },
        { requestId: handle.requestId },
      ])
      expect(session.getSnapshot().promptError).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('stops prompt acknowledgement retries when the caller cancels the backoff', async ({ mock, start }) => {
    vi.useFakeTimers()
    try {
      const session = await sessionBench(mock, start, SID)
      mock.remote.session.prompt.mockResolvedValue(err(new RemoteError(
        'gateway/internal', 'client api: session/prompt failed: Load failed', {},
      )))
      const controller = new AbortController()
      const handle = session.beginSubmission({ mode: 'queue', text: '取消重试', attachments: [] })
      const inFlight = session.prompt(
        [{ type: 'text', text: '取消重试' }], 'queue', controller.signal, handle.requestId,
      )

      await vi.advanceTimersByTimeAsync(0)
      controller.abort()

      await expect(inFlight).resolves.toMatchObject({
        ok: false,
        error: { code: 'gateway/cancelled' },
      })
      expect(mock.log.requests('session/prompt')).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not confuse an unrelated echo retirement with Host acceptance', async ({ mock, start }) => {
    vi.useFakeTimers()
    try {
      const session = await sessionBench(mock, start, SID)
      mock.remote.session.prompt
        .mockResolvedValueOnce(err(new RemoteError(
          'gateway/internal', 'client api: session/prompt failed: Load failed', {},
        )))
        .mockResolvedValueOnce(err(new RemoteError(
          'session/agent-busy', 'busy after retry', { reason: 'busy' },
        )))
      const handle = session.beginSubmission({ mode: 'queue', text: '放弃回显', attachments: [] })
      const inFlight = session.prompt(
        [{ type: 'text', text: '放弃回显' }], 'queue', undefined, handle.requestId,
      )

      await vi.advanceTimersByTimeAsync(0)
      handle.abandon()
      await vi.advanceTimersByTimeAsync(500)

      await expect(inFlight).resolves.toMatchObject({
        ok: false,
        error: { code: 'session/agent-busy' },
      })
      expect(mock.log.requests('session/prompt')).toHaveLength(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('bounds persistent ambiguous prompt failures', async ({ mock, start }) => {
    vi.useFakeTimers()
    try {
      const session = await sessionBench(mock, start, SID)
      mock.remote.session.prompt.mockResolvedValue(err(new RemoteError(
        'gateway/internal', 'client api: session/prompt failed: Load failed', {},
      )))
      const handle = session.beginSubmission({ mode: 'queue', text: '持续失败', attachments: [] })
      const inFlight = session.prompt(
        [{ type: 'text', text: '持续失败' }], 'queue', undefined, handle.requestId,
      )

      await vi.advanceTimersByTimeAsync(30_500)

      await expect(inFlight).resolves.toMatchObject({
        ok: false,
        error: { code: 'gateway/internal' },
      })
      expect(mock.log.requests('session/prompt')).toHaveLength(7)
      const requestIds = mock.log.requests('session/prompt').map(request => (
        String((request as { readonly requestId?: unknown }).requestId)
      ))
      expect(new Set(requestIds))
        .toEqual(new Set([handle.requestId]))
    } finally {
      vi.useRealTimers()
    }
  })

  it('an unidentified prompt failure leaves registered echoes alone', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    mock.remote.session.prompt.mockResolvedValue(err(new RemoteError('session/agent-busy', '忙', { reason: 'busy' })))
    session.beginSubmission({ mode: 'queue', text: '还在', attachments: [] })
    await session.prompt([{ type: 'text', text: '另一个' }], 'queue')
    expect(session.getSnapshot().pendingSubmissions).toHaveLength(1)
  })
})

describe('observed retirement', () => {
  it('a live durable event carrying the rpcId retires the echo one frame later with the admitted refs', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    await session.open()
    const retirements: PendingSubmissionRetirement[] = []
    const handle = session.beginSubmission({
      mode: 'queue',
      text: '发送',
      attachments: [{ type: 'image', value: { previewUrl: 'blob:p1' } }],
      onRetire: retirement => retirements.push(retirement),
    })
    const refs = [imageRef('att-1')]
    await pushEvent(mock, promptEvent(SessionSeq(0), handle.requestId, refs))
    // Synchronously after the append the echo is still in the snapshot; the
    // render-time dedupe owns the overlap frame.
    expect(session.getSnapshot().pendingSubmissions).toHaveLength(1)
    await settleFrames()
    expect(session.getSnapshot().pendingSubmissions).toEqual([])
    expect(retirements).toEqual([{ reason: 'observed', attachments: refs }])
  })

  it('a queue occurrence carrying the rpcId retires the echo (running-turn submissions)', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    const retirements: PendingSubmissionRetirement[] = []
    session.handleRunning(true)
    const handle = session.beginSubmission({
      mode: 'queue',
      text: '排队',
      attachments: [{ type: 'image', value: { previewUrl: 'blob:p1' } }],
      onRetire: retirement => retirements.push(retirement),
    })
    const refs = [imageRef('att-q')]
    session.handleControlFrame(queuedFrame(handle.requestId, refs))
    await settleFrames()
    expect(session.getSnapshot().pendingSubmissions).toEqual([])
    expect(retirements).toEqual([{ reason: 'observed', attachments: refs }])
    // The queue projection keeps the correlation id for render-time dedupe.
    expect(session.getSnapshot().queue).toMatchObject([{ rpcId: handle.requestId }])
  })

  it('retires a mixed echo with durable references in original selection order', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    await session.open()
    const retirements: PendingSubmissionRetirement[] = []
    const file = fileRef('file-1')
    const handle = session.beginSubmission({
      mode: 'queue',
      text: 'mixed',
      attachments: [
        { type: 'image', value: { previewUrl: 'blob:first' } },
        { type: 'file', value: file },
        { type: 'image', value: { previewUrl: 'blob:last' } },
      ],
      onRetire: retirement => retirements.push(retirement),
    })
    const refs = [imageRef('image-1'), file, imageRef('image-2')]
    await pushEvent(mock, promptEvent(SessionSeq(0), handle.requestId, refs))
    await settleFrames()
    expect(retirements).toEqual([{ reason: 'observed', attachments: refs }])
  })

  it('a full-window install (reconnect resync) retires echoes observed in the window', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    const handle = session.beginSubmission({ mode: 'queue', text: '重连', attachments: [] })
    mock.stream(FOLLOW, followScript(history([promptEvent(SessionSeq(12), handle.requestId)])))
    await session.open()
    await settleFrames()
    expect(session.getSnapshot().pendingSubmissions).toEqual([])
  })

  it('the first observation wins: a later prompt failure cannot re-retire an observed echo', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    await session.open()
    const retirements: PendingSubmissionRetirement[] = []
    const handle = session.beginSubmission({
      mode: 'queue',
      text: '先观察',
      attachments: [],
      onRetire: retirement => retirements.push(retirement),
    })
    await pushEvent(mock, promptEvent(SessionSeq(0), handle.requestId))
    handle.abandon()
    await settleFrames()
    expect(retirements).toEqual([{ reason: 'observed', attachments: [] }])
  })

  it('retires once when the queue and durable event report the same request id', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    await session.open()
    const retirements: PendingSubmissionRetirement[] = []
    const handle = session.beginSubmission({
      mode: 'queue',
      text: '同一请求',
      attachments: [],
      onRetire: retirement => retirements.push(retirement),
    })
    session.handleControlFrame(queuedFrame(handle.requestId))
    await pushEvent(mock, promptEvent(SessionSeq(0), handle.requestId))
    await settleFrames()
    expect(retirements).toEqual([{ reason: 'observed', attachments: [] }])
    expect(session.getSnapshot().pendingSubmissions).toEqual([])
  })

  it('uses requestAnimationFrame for the retirement delay when the runtime provides one', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    await session.open()
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => {
      frames.push(fn)
      return frames.length
    })
    const handle = session.beginSubmission({ mode: 'queue', text: '帧', attachments: [] })
    await pushEvent(mock, promptEvent(SessionSeq(0), handle.requestId))
    expect(session.getSnapshot().pendingSubmissions).toHaveLength(1)
    expect(frames).toHaveLength(1)
    frames[0]?.(0)
    expect(session.getSnapshot().pendingSubmissions).toEqual([])
  })
})

describe('disposal', () => {
  it('retires unsettled echoes as failed and preserves an already-observed settlement', async ({ mock, start }) => {
    const session = await sessionBench(mock, start, SID)
    await session.open()
    const retirements: { text: string; retirement: PendingSubmissionRetirement }[] = []
    const observed = session.beginSubmission({
      mode: 'queue',
      text: '已观察',
      attachments: [],
      onRetire: retirement => retirements.push({ text: '已观察', retirement }),
    })
    session.beginSubmission({
      mode: 'queue',
      text: '未settle',
      attachments: [],
      onRetire: retirement => retirements.push({ text: '未settle', retirement }),
    })
    await pushEvent(mock, promptEvent(SessionSeq(0), observed.requestId))
    await session.dispose()
    await settleFrames()
    expect(retirements).toEqual([
      { text: '未settle', retirement: { reason: 'failed' } },
      { text: '已观察', retirement: { reason: 'observed', attachments: [] } },
    ])
    expect(session.getSnapshot().pendingSubmissions).toEqual([])
  })
})
