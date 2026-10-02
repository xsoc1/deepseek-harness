import { describe, expect, it } from 'vitest'
import {
  hasSensitiveNetworkContent,
  summarizeRiskContent,
} from '../src/sanitizer.ts'
import type { Message } from '@deepseek-ai/dsh-llm'
import { Context } from '@deepseek-ai/cordis'
import LlmRuntime, { createToolResultMessage, LlmAdapter, ToolCallId } from '@deepseek-ai/dsh-llm'
import type { ContentBlock, GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime, { defineContentToolFixture } from '@deepseek-ai/dsh-tools'
import type { ToolExecutionInput } from '@deepseek-ai/dsh-tools'
import { mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as ContentRiskGuard from '../src/index.ts'
import { LocalResultStore } from '../src/local-result-store.ts'
import { createPrivacyTestAgent } from './agent-fixture.ts'
import { scopeTarget } from '@deepseek-ai/dsh-scope'

it('does not silently retry by replacing an unrelated tool result after a provider risk rejection', async () => {
  const ctx = new Context()
  await ctx.plugin(LlmRuntime)
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  const requests: GenerateOptions[] = []
  class RiskAdapter extends LlmAdapter {
    async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
      requests.push(options)
      if (requests.length === 1) {
        yield {
          type: 'finish',
          reason: { kind: 'error', failure: { message: 'Content Exists Risk', code: 'content_exists_risk' } },
        }
      } else {
        yield { type: 'finish', reason: { kind: 'stop' } }
      }
    }
  }
  ctx.llm.registerAdapter(['risk-fixture'], new RiskAdapter())
  await ctx.plugin(ContentRiskGuard, {})
  const messages: Message[] = [createToolResultMessage({
    callId: ToolCallId('safe'), content: [{ type: 'text', text: 'BENIGN_OK' }], isError: false,
  })]

  const chunks: StreamChunk[] = []
  try {
    for await (const chunk of ctx.llm.stream({ provider: 'risk-fixture', model: 'fixture', messages })) {
      chunks.push(chunk)
    }
  } finally {
    await ctx.fiber.dispose()
  }
  expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'error' } })
  expect(requests).toHaveLength(1)
  expect(requests[0]?.messages[0]?.content).toEqual(messages[0]?.content)
})

it('stops a contaminated historical result before any adapter receives it', async () => {
  const ctx = new Context()
  await ctx.plugin(LlmRuntime)
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  const requests: GenerateOptions[] = []
  class CaptureAdapter extends LlmAdapter {
    async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
      requests.push(options)
      yield { type: 'finish', reason: { kind: 'stop' } }
    }
  }
  ctx.llm.registerAdapter(['risk-fixture'], new CaptureAdapter())
  await ctx.plugin(ContentRiskGuard, {})
  const historical = JSON.stringify({ output: '  1\tproxies:\n  2\t  - name: fixture-node\n  3\t    type: socks5\n  4\t    password: fixture-pass' })
  const messages: Message[] = [createToolResultMessage({
    callId: ToolCallId('old-result'), content: [{ type: 'text', text: historical }], isError: false,
  })]
  expect(hasSensitiveNetworkContent(JSON.stringify({ messages }))).toBe(true)
  const chunks: StreamChunk[] = []
  try {
    for await (const chunk of ctx.llm.stream({ provider: 'risk-fixture', model: 'fixture', messages })) {
      chunks.push(chunk)
    }
  } finally {
    await ctx.fiber.dispose()
  }
  expect(requests).toHaveLength(0)
  expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'error' } })
  expect(JSON.stringify(chunks)).not.toContain('fixture-pass')
})

it('checks user, system, and tool-schema text before provider dispatch', async () => {
  const ctx = new Context()
  await ctx.plugin(LlmRuntime)
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  let dispatched = 0
  class CaptureAdapter extends LlmAdapter {
    async * stream(): AsyncIterable<StreamChunk> {
      dispatched += 1
      yield { type: 'finish', reason: { kind: 'stop' } }
    }
  }
  ctx.llm.registerAdapter(['risk-fixture'], new CaptureAdapter())
  await ctx.plugin(ContentRiskGuard, {})
  const raw = 'proxies:\n  - name: fixture-node\n    type: socks5\n'
  const requests: GenerateOptions[] = [
    { provider: 'risk-fixture', model: 'fixture', messages: [{ role: 'user', content: [{ type: 'text', text: raw }] }] },
    { provider: 'risk-fixture', model: 'fixture', messages: [], system: raw },
    { provider: 'risk-fixture', model: 'fixture', messages: [],
      tools: [{ name: 'fixture', description: raw, parameters: {} }] },
  ]
  try {
    for (const request of requests) {
      const chunks: StreamChunk[] = []
      for await (const chunk of ctx.llm.stream(request)) chunks.push(chunk)
      expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'error' } })
    }
    expect(dispatched).toBe(0)
  } finally {
    await ctx.fiber.dispose()
  }
})

it('keeps a sensitive result local while leaving an unrelated result intact', async () => {
  const privateRoot = await mkdtemp(join(tmpdir(), 'dsh-risk-fixture-'))
  const ctx = new Context()
  const secret = 'proxies:\n  - name: "node-secret"\n    type: vmess\n    server: node.example.test\n    password: fixture-secret\n'
  try {
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    const guardFiber = await ctx.plugin(ContentRiskGuard, { privateRoot })
    const agent = await createPrivacyTestAgent(ctx, 'risk-session')
    const exec = (name: string, callId: string): ToolExecutionInput => ({
      name, callId: ToolCallId(callId), arguments: {}, agent,
      signal: new AbortController().signal,
    })
    ctx.tools.register(defineContentToolFixture({
      name: 'network_fixture',
      description: 'fixture',
      parameters: {},
      async execute() { return [{ type: 'text', text: secret }] },
    }))
    ctx.tools.register(defineContentToolFixture({
      name: 'ordinary_fixture',
      description: 'fixture',
      parameters: {},
      async execute() { return [{ type: 'text', text: 'BENIGN_OK' }] },
    }))

    const risky = await ctx.tools.execute(exec('network_fixture', 'risk-call'))
    const safe = await ctx.tools.execute(exec('ordinary_fixture', 'safe-call'))
    const riskyText = risky.content[0]?.type === 'text' ? risky.content[0].text : ''
    expect(riskyText).toContain('local-result:')
    expect(riskyText).not.toContain('node-secret')
    expect(safe.content).toEqual([{ type: 'text', text: 'BENIGN_OK' }])
    const files = await readdir(privateRoot)
    expect(files).toHaveLength(1)
    const file = files.at(0)
    if (file === undefined) throw new Error('missing private result')
    const path = join(privateRoot, file)
    expect((await stat(path)).mode & 0o777).toBe(0o600)
    expect(await readFile(path, 'utf8')).toContain('node-secret')
    const handle = riskyText.match(/local-result:([a-f0-9]{32})/)?.[1]
    expect(handle).toBeDefined()
    const inspected = await ctx.tools.execute({
      ...exec('inspect_local_network_result', 'inspect-call'),
      arguments: { handle },
    })
    expect(inspected.isError).toBeFalsy()
    expect(inspected.content[0]).toMatchObject({
      type: 'text',
      text: JSON.stringify({
        bytes: Buffer.byteLength(secret), proxyEntries: 1, groupEntries: 0,
        protocolLinks: 0, subscriptionLinks: 0, hasTunSection: false, hasDnsSection: false,
      }),
    })
    const otherSession = await ctx.tools.execute({
      ...exec('inspect_local_network_result', 'inspect-other-session'),
      agent: await createPrivacyTestAgent(ctx, 'other-session'),
      arguments: { handle },
    })
    expect(otherSession.isError).toBe(true)
    expect(JSON.stringify(otherSession.content)).not.toContain('node-secret')
    await guardFiber.dispose()
    const afterDisposal = await ctx.tools.execute({
      ...exec('inspect_local_network_result', 'inspect-after-disposal'),
      arguments: { handle },
    })
    expect(afterDisposal.isError).toBe(true)
    expect(JSON.stringify(afterDisposal.content)).not.toContain('node-secret')
  } finally {
    await ctx.fiber.dispose()
    await rm(privateRoot, { recursive: true, force: true })
  }
})

it('fails closed when a sensitive result cannot be stored', async () => {
  const privateRoot = await mkdtemp(join(tmpdir(), 'dsh-risk-limit-'))
  const ctx = new Context()
  const secret = 'proxies:\n  - name: limit-secret\n    type: vmess\n'
  try {
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(ContentRiskGuard, { privateRoot, maxStoredBytes: 8 })
    ctx.tools.register(defineContentToolFixture({
      name: 'oversize_fixture', description: 'fixture', parameters: {},
      async execute() { return [{ type: 'text', text: secret }] },
    }))
    const result = await ctx.tools.execute({
      name: 'oversize_fixture', callId: ToolCallId('oversize-call'), arguments: {},
      agent: await createPrivacyTestAgent(ctx, 'limit-session'),
      signal: new AbortController().signal,
    })
    expect(result.isError).toBe(true)
    expect(JSON.stringify(result.content)).not.toContain('limit-secret')
    expect(await readdir(privateRoot)).toEqual([])
  } finally {
    await ctx.fiber.dispose()
    await rm(privateRoot, { recursive: true, force: true })
  }
})

it('bounds the complete stored record at an exact multibyte limit', async () => {
  const privateRoot = await mkdtemp(join(tmpdir(), 'dsh-risk-bytes-'))
  const raw = 'é'
  const exact = Buffer.byteLength(JSON.stringify({
    sessionId: 's', callId: 'c', createdAt: Date.now(), raw,
  }), 'utf8')
  try {
    const exactStore = new LocalResultStore(privateRoot, 60_000, exact)
    const handle = await exactStore.save('s', 'c', raw)
    expect(await exactStore.load('s', handle)).toBe(raw)
    await expect(new LocalResultStore(privateRoot, 60_000, exact - 1).save('s', 'c', raw))
      .rejects.toThrow('size limit')
    expect(await readdir(privateRoot)).toHaveLength(1)
  } finally {
    await rm(privateRoot, { recursive: true, force: true })
  }
})

it('isolates a sensitive PTC sub-call log without rewriting a harmless one', async () => {
  const privateRoot = await mkdtemp(join(tmpdir(), 'dsh-risk-ptc-'))
  const ctx = new Context()
  try {
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(ContentRiskGuard, { privateRoot })
    const agent = await createPrivacyTestAgent(ctx, 'ptc-session')
    ctx.tools.register(defineContentToolFixture({
      name: 'shape_fixture', description: 'exercise real dispatch-log shaping',
      parameters: { text: { type: 'string', required: true }, fail: { type: 'boolean' } },
      async execute(args, exec) {
        const content = [{ type: 'text' as const, text: args.text }]
        return ctx.waterfall(scopeTarget(ctx.tools, agent), 'tools/ptc-dispatch-log', {
          exec, agent, subCallId: exec.callId, name: 'fixture', isError: args.fail === true, content,
        }, () => args.fail
          ? Promise.reject<ContentBlock[]>(new Error('fixture log shaping failed'))
          : Promise.resolve(content))
      },
    }))
    const shape = async (text: string, id: string, fail = false) => {
      const result = await ctx.tools.execute({
        agent, name: 'shape_fixture', callId: ToolCallId(id), arguments: { text, fail },
        signal: new AbortController().signal,
      })
      expect(result.isError).toBeFalsy()
      return result.content
    }
    const secret = 'proxies:\n  - name: subcall-secret\n    type: vmess\n'
    const risky = await shape(secret, 'ptc-risk')
    expect(JSON.stringify(risky)).toContain('local-result:')
    expect(JSON.stringify(risky)).not.toContain('subcall-secret')
    expect(await shape('BENIGN_OK', 'ptc-safe')).toEqual([{ type: 'text', text: 'BENIGN_OK' }])
    expect(await readdir(privateRoot)).toHaveLength(1)
    const failed = await shape(secret, 'ptc-failed', true)
    expect(JSON.stringify(failed)).not.toContain('subcall-secret')
  } finally {
    await ctx.fiber.dispose()
    await rm(privateRoot, { recursive: true, force: true })
  }
})

describe('@dsh-selfuse/content-risk-guard classifier', () => {
  it('identifies numbered read output and JSON-encoded PTC output', () => {
    const numbered = [
      '  1\tproxies:',
      '  2\t  - name: fixture-node',
      '  3\t    type: socks5',
      '  4\t    server: fixture.example.test',
      '  5\t    username: fixture-user',
      '  6\t    password: fixture-pass',
    ].join('\n')
    expect(hasSensitiveNetworkContent(numbered)).toBe(true)
    expect(hasSensitiveNetworkContent(JSON.stringify({ output: numbered }))).toBe(true)
    expect(hasSensitiveNetworkContent(JSON.stringify({ lines: [
      { text: '1: proxies:' }, { text: '2:   - name: fixture-node' },
    ] }))).toBe(true)
    expect(hasSensitiveNetworkContent(JSON.stringify({ lines: [
      { text: '1: append:' }, { text: '2:   - type: socks5' },
      { text: '3:     server: fixture.example.test' },
      { text: '4:     username: fixture-user' }, { text: '5:     password: fixture-pass' },
    ] }))).toBe(true)
  })

  it('treats excessively nested JSON as uninspectable', () => {
    let nested: unknown = 'BENIGN_OK'
    for (let depth = 0; depth < 30; depth += 1) nested = { value: nested }
    expect(hasSensitiveNetworkContent(JSON.stringify(nested))).toBe(true)
  })

  it('identifies Clash proxies list block', () => {
    const yaml = `
mixed-port: 7890
proxies:
  - name: "HK-VIP-01"
    type: vmess
    server: hk.example.com
    port: 443
    uuid: 12345678-1234-1234-1234-123456789abc
    alterId: 0
  - name: "US-Node"
    type: ss
    server: us.example.com
    port: 8388
    cipher: aes-256-gcm
    password: secret
proxy-groups:
  - name: PROXY
    type: select
    proxies: ["HK-VIP-01"]
`
    expect(hasSensitiveNetworkContent(yaml)).toBe(true)
  })

  it('identifies proxy URIs (vmess, trojan, ss, etc.)', () => {
    const text = 'Check out these nodes: vmess://eyJhZGQiOiIxMjcuMC4wLjEifQ== and trojan://pwd@1.2.3.4:443#name and ss://YWVzLTI1Ni1nY206cGFzc3dvcmRAMTI3LjAuMC4xOjEyMzQ=!'
    expect(hasSensitiveNetworkContent(text)).toBe(true)
  })

  it('identifies subscription URLs', () => {
    const text = 'Download config from https://vpn.service.net/api/v1/client/subscribe?token=9876543210abcdef to start'
    expect(hasSensitiveNetworkContent(text)).toBe(true)
  })

  it('preserves normal code and ordinary prose', () => {
    const normal = `
function calculateSum(a: number, b: number): number {
  return a + b;
}
console.log("Normal application running on http://localhost:3000");
`
    expect(hasSensitiveNetworkContent(normal)).toBe(false)
  })

  it('summarizes locally retained content without identifiers', () => {
    expect(summarizeRiskContent('proxies:\n  - name: secret-node\n    type: vmess\n')).toEqual({
      bytes: 47, proxyEntries: 1, groupEntries: 0, protocolLinks: 0,
      subscriptionLinks: 0, hasTunSection: false, hasDnsSection: false,
    })
  })
})
