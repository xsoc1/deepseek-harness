import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { spawnSubprocess } from '../src/spawn.ts'

const { spawnMock } = vi.hoisted(() => ({
  spawnMock: vi.fn<typeof import('node:child_process').spawn>(),
}))

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>()
  const wrapped = (...args: Parameters<typeof import('node:child_process').spawn>) => actual.spawn(...args)
  spawnMock.mockImplementation(wrapped)
  return { ...actual, spawn: spawnMock }
})

const spillDir = mkdtempSync(join(tmpdir(), 'dsh-subprocess-windows-spec-'))
afterAll(() => { rmSync(spillDir, { recursive: true, force: true }) })

describe('spawnSubprocess windows console behavior', () => {
  it('hides child console windows on Windows hosts', async () => {
    const running = spawnSubprocess({
      argv: [process.execPath, '-e', 'process.exit(0)'],
      cwd: process.cwd(),
      stdio: {
        stdin: 'ignore',
        stdout: { maxBytes: 64_000, spill: { maxBytes: 64 * 1024 * 1024 } },
        stderr: { maxBytes: 64_000, spill: { maxBytes: 64 * 1024 * 1024 } },
      },
      graceMs: 3_000,
    }, { spillDir, platform: 'win32' })

    const outcome = await running.done
    expect(outcome.exitCode).toBe(0)
    const call = spawnMock.mock.calls[0]
    if (!call) throw new Error('spawn was not called')
    expect(call[2]?.windowsHide).toBe(true)
  })
})
