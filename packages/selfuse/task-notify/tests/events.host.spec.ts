/** Built notification observer with the real Session append and Cordis disposal lifecycle. */
import { Context } from '@deepseek-ai/cordis'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import { beforeEach, expect, it, vi } from 'vitest'

const processProvider = vi.hoisted(() => ({
  execFile: vi.fn<(
    program: string, argv: readonly string[], options: { windowsHide: boolean }, callback: (error: Error | null) => void,
  ) => { unref(): void }>(),
  unref: vi.fn<() => void>(),
}))
vi.mock('node:child_process', () => ({ execFile: processProvider.execFile }))
const Notify = await vi.importActual<typeof import('../src/index.ts')>('../lib/index.js')

beforeEach(() => {
  processProvider.execFile.mockReset()
  processProvider.unref.mockReset()
  processProvider.execFile.mockImplementation((_program, _argv, _options, callback) => {
    callback(new Error('notification provider unavailable'))
    return { unref: processProvider.unref }
  })
})

function scriptAt(index: number): string {
  const call = processProvider.execFile.mock.calls[index]
  if (call === undefined) throw new Error('notification invocation missing')
  expect(call[0]).toBe('powershell.exe')
  expect(call[2]).toEqual({ windowsHide: true })
  expect(call[1].slice(0, 3)).toEqual(['-NoProfile', '-NonInteractive', '-EncodedCommand'])
  const encoded = call[1][3]
  if (encoded === undefined) throw new Error('encoded script missing')
  return Buffer.from(encoded, 'base64').toString('utf16le')
}

it('notifies from committed main-turn events, contains spawn failure, and removes listeners on disposal', async () => {
  const ctx = new Context()
  try {
    await ctx.plugin(SessionStore)
    const observer = await ctx.plugin(Notify)
    const session = ctx.sessions.create(SessionId('notification-main-12345678'), { meta: { cwd: '/workspace/project' } })
    session.append('session/title', { title: "User's task", messageSeqs: [], source: { kind: 'user' } })
    session.append('turn/start', { turn: 1 })
    session.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
    expect(session.events.at(-1)?.type).toBe('turn/end')
    expect(processProvider.execFile).toHaveBeenCalledTimes(1)
    expect(scriptAt(0)).toContain("$n.BalloonTipTitle = 'User''s task'")
    expect(scriptAt(0)).toContain("$n.BalloonTipText = 'project · 会话 12345678'")
    expect(processProvider.unref).toHaveBeenCalledOnce()
    await observer.dispose()
    session.append('turn/start', { turn: 2 })
    session.append('turn/end', { turn: 2, reason: { kind: 'completed' } })
    expect(processProvider.execFile).toHaveBeenCalledTimes(1)
  } finally {
    await ctx.fiber.dispose()
  }
})

it('skips interrupted turns and delegated sessions', async () => {
  const ctx = new Context()
  try {
    await ctx.plugin(SessionStore)
    await ctx.plugin(Notify)
    const main = ctx.sessions.create(SessionId('notification-interrupted'))
    main.append('turn/start', { turn: 1 })
    main.append('turn/end', { turn: 1, reason: { kind: 'interrupted' } })
    const child = ctx.sessions.create(SessionId('notification-child'), { meta: { delegationDepth: 1 } })
    child.append('turn/start', { turn: 1 })
    child.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
    expect(processProvider.execFile).not.toHaveBeenCalled()
  } finally {
    await ctx.fiber.dispose()
  }
})

it('forgets the title of a disposed session before that id is re-entered', async () => {
  const ctx = new Context()
  try {
    await ctx.plugin(SessionStore)
    await ctx.plugin(Notify)
    const id = SessionId('notification-reentered')
    const first = ctx.sessions.prepare(id)
    const detach = ctx.sessions.enter(first)
    ctx.sessions.announce(first)
    first.append('session/title', { title: 'stale title', messageSeqs: [], source: { kind: 'user' } })
    detach()
    const next = ctx.sessions.create(id)
    next.append('turn/start', { turn: 1 })
    next.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
    expect(scriptAt(0)).toContain("$n.BalloonTipTitle = 'DSH 任务完成'")
  } finally {
    await ctx.fiber.dispose()
  }
})
