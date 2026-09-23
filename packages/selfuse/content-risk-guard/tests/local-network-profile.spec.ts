import { chmod, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { SessionId } from '@deepseek-ai/dsh-session'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime, { defineContentToolFixture } from '@deepseek-ai/dsh-tools'
import type { ToolExecutionInput } from '@deepseek-ai/dsh-tools'
import type ApprovalService from '@deepseek-ai/dsh-user-approval'
import { expect, it } from 'vitest'
import * as ContentRiskGuard from '../src/index.ts'
import { LocalNetworkProfileExecutor } from '../src/local-network-profile.ts'

const fixture = [
  '# local fixture comment',
  'mode: rule',
  'tun:',
  '  enable: false',
  'proxies:',
  '  - name: fixture-node',
  '    type: socks5',
  '    server: fixture.example.test',
  '    username: fixture-user',
  '    password: fixture-pass',
  '',
].join('\n')

it('changes only allowlisted fields, keeps secrets local, and restores a private backup', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-risk-profile-'))
  const path = join(root, 'profile.yaml')
  const privateRoot = join(root, 'private')
  try {
    await writeFile(path, fixture, { mode: 0o600 })
    const executor = new LocalNetworkProfileExecutor([{ id: 'fixture', path }], privateRoot, 1_000_000)
    const inspected = await executor.inspect('fixture')
    expect(inspected.facts.proxyEntries).toBe(1)
    expect(JSON.stringify(inspected)).not.toContain('fixture-pass')
    expect(JSON.stringify(inspected)).not.toContain(path)

    const changed = await executor.apply('fixture', { operation: 'set-tun-enabled', enabled: true })
    expect(changed.changed).toBe(true)
    expect(changed.backupHandle).toMatch(/^[a-f0-9]{32}$/)
    expect(JSON.stringify(changed)).not.toContain('fixture-pass')
    const updated = await readFile(path, 'utf8')
    expect(updated).toContain('enable: true')
    expect(updated).toContain('password: fixture-pass')
    expect(updated).toContain('# local fixture comment')
    const backupPath = join(privateRoot, 'profile-backups', `${changed.backupHandle}.json`)
    expect((await stat(backupPath)).mode & 0o777).toBe(0o600)
    expect(await readFile(backupPath, 'utf8')).toContain('enable: false')

    const restored = await executor.restore('fixture', changed.backupHandle!)
    expect(restored.changed).toBe(true)
    expect(await readFile(path, 'utf8')).toBe(fixture)
    expect(await readdir(join(privateRoot, 'profile-backups'))).toHaveLength(2)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

it('refuses a write when the backup parent is accessible to other users', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-risk-private-'))
  const path = join(root, 'profile.yaml')
  const privateRoot = join(root, 'private')
  try {
    await writeFile(path, fixture, { mode: 0o600 })
    await mkdir(privateRoot)
    await chmod(privateRoot, 0o755)
    const executor = new LocalNetworkProfileExecutor([{ id: 'fixture', path }], privateRoot, 1_000_000)
    await expect(executor.apply('fixture', { operation: 'set-mode', mode: 'global' }))
      .rejects.toThrow('not private')
    expect(await readFile(path, 'utf8')).toBe(fixture)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

it('denies a model-requested profile write when no human approval channel exists', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-risk-approval-'))
  const path = join(root, 'profile.yaml')
  const ctx = new Context()
  try {
    await writeFile(path, fixture, { mode: 0o600 })
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(ContentRiskGuard, {
      privateRoot: join(root, 'private'), profiles: [{ id: 'fixture', path }],
    })
    const result = await ctx.tools.execute({
      name: 'change_local_network_profile',
      callId: ToolCallId('change-call'),
      arguments: { profileId: 'fixture', operation: 'set-mode', mode: 'global' },
      agent: { session: { header: { id: SessionId('profile-session') } } },
      signal: new AbortController().signal,
    } as unknown as ToolExecutionInput)
    expect(result.isError).toBe(true)
    expect(await readFile(path, 'utf8')).toBe(fixture)
    expect(JSON.stringify(result.content)).not.toContain('fixture-pass')
  } finally {
    await ctx.fiber.dispose()
    await rm(root, { recursive: true, force: true })
  }
})

it('writes only after the approval service grants the model-requested change', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-risk-allowed-'))
  const path = join(root, 'profile.yaml')
  const ctx = new Context()
  let approvals = 0
  try {
    await writeFile(path, fixture, { mode: 0o600 })
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(ContentRiskGuard, {
      privateRoot: join(root, 'private'), profiles: [{ id: 'fixture', path }],
    })
    ctx.provide('approval', {
      request: () => {
        approvals += 1
        return Promise.resolve('allowed-once')
      },
    } as unknown as ApprovalService)
    const result = await ctx.tools.execute({
      name: 'change_local_network_profile',
      callId: ToolCallId('allowed-call'),
      arguments: { profileId: 'fixture', operation: 'set-mode', mode: 'global' },
      agent: { session: { header: { id: SessionId('allowed-session') } } },
      signal: new AbortController().signal,
    } as unknown as ToolExecutionInput)
    expect(approvals).toBe(1)
    expect(result.isError).toBeFalsy()
    expect(await readFile(path, 'utf8')).toContain('mode: global')
    expect(JSON.stringify(result.content)).not.toContain('fixture-pass')
  } finally {
    await ctx.fiber.dispose()
    await rm(root, { recursive: true, force: true })
  }
})

it('isolates a partial read by allowlisted file provenance even without a proxies header', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-risk-path-'))
  const path = join(root, 'profile.yaml')
  const privateRoot = join(root, 'private')
  const ctx = new Context()
  try {
    await writeFile(path, fixture, { mode: 0o600 })
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(ContentRiskGuard, { privateRoot, profiles: [{ id: 'fixture', path }] })
    ctx.tools.register(defineContentToolFixture({
      name: 'partial_read_fixture', description: 'fixture',
      parameters: { path: { type: 'string', required: true } },
      async execute() { return [{ type: 'text', text: 'password: fixture-pass' }] },
    }))
    const result = await ctx.tools.execute({
      name: 'partial_read_fixture', callId: ToolCallId('partial-call'), arguments: { path },
      agent: { session: { header: { id: SessionId('path-session') } } },
      signal: new AbortController().signal,
    } as unknown as ToolExecutionInput)
    expect(JSON.stringify(result.content)).toContain('local-result:')
    expect(JSON.stringify(result.content)).not.toContain('fixture-pass')
    expect(await readdir(privateRoot)).toHaveLength(1)
  } finally {
    await ctx.fiber.dispose()
    await rm(root, { recursive: true, force: true })
  }
})
