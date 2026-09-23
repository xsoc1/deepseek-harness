import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import LlmRuntime, { LlmAdapter } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, Message, StreamChunk } from '@deepseek-ai/dsh-llm'
import ToolRuntime, { defineContentToolFixture } from '@deepseek-ai/dsh-tools'
import type { ToolExecutionInput } from '@deepseek-ai/dsh-tools'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import * as ContentRiskGuard from '../src/index.ts'

it('loads through cordis.yml and commits only the safe projection', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-risk-loader-'))
  const privateRoot = join(root, 'private')
  const configPath = join(root, 'cordis.yml')
  const ctx = new Context()
  try {
    await writeFile(configPath, [
      "- name: '@deepseek-ai/dsh-system-prompt'",
      "- name: '@deepseek-ai/dsh-llm'",
      "- name: '@deepseek-ai/dsh-tools'",
      "- name: '@dsh-selfuse/content-risk-guard'",
      '  config:',
      `    privateRoot: ${JSON.stringify(privateRoot)}`,
      '',
    ].join('\n'))
    ctx.baseUrl = pathToFileURL(root).href + '/'
    await ctx.plugin(Loader)
    ctx.loader.builtins.include = Include
    const plugins: Record<string, unknown> = {
      '@deepseek-ai/dsh-system-prompt': SystemPrompt,
      '@deepseek-ai/dsh-llm': LlmRuntime,
      '@deepseek-ai/dsh-tools': ToolRuntime,
      '@dsh-selfuse/content-risk-guard': ContentRiskGuard,
    }
    ctx.loader.internal = {
      version: 'v2',
      async import(specifier: string) {
        const plugin = plugins[specifier]
        if (plugin === undefined) throw new Error(`unexpected Loader import: ${specifier}`)
        return plugin
      },
    } as unknown as NonNullable<typeof ctx.loader.internal>
    await ctx.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(configPath).href } })
    await ctx.loader.await()

    const secret = 'proxies:\n  - name: loader-secret\n    type: vmess\n'
    ctx.tools.register(defineContentToolFixture({
      name: 'loader_fixture', description: 'fixture', parameters: {},
      async execute() { return [{ type: 'text', text: secret }] },
    }))
    const result = await ctx.tools.execute({
      name: 'loader_fixture', callId: ToolCallId('loader-call'), arguments: {},
      agent: { session: { header: { id: SessionId('loader-session') } } },
      signal: new AbortController().signal,
    } as unknown as ToolExecutionInput)
    expect(result.isError).toBeFalsy()
    expect(JSON.stringify(result.content)).toContain('local-result:')
    expect(JSON.stringify(result.content)).not.toContain('loader-secret')
    const files = await readdir(privateRoot)
    expect(files).toHaveLength(1)
    expect(await readFile(join(privateRoot, files[0]!), 'utf8')).toContain('loader-secret')

    const requests: GenerateOptions[] = []
    class CaptureAdapter extends LlmAdapter {
      async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
        requests.push(options)
        yield { type: 'finish', reason: { kind: 'stop' } }
      }
    }
    ctx.llm.registerAdapter(['risk-fixture'], new CaptureAdapter())
    const messages: Message[] = [{
      role: 'tool', content: [{
        type: 'tool-result', id: 'historical', name: 'read',
        content: [{ type: 'text', text: JSON.stringify({ output: '  1\tproxies:\n  2\t  - name: loader-secret' }) }],
      }],
    }]
    const chunks: StreamChunk[] = []
    for await (const chunk of ctx.llm.stream({ provider: 'risk-fixture', model: 'fixture', messages })) {
      chunks.push(chunk)
    }
    expect(requests).toHaveLength(0)
    expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'error' } })
    expect(JSON.stringify(chunks)).not.toContain('loader-secret')
  } finally {
    await ctx.fiber.dispose()
    await rm(root, { recursive: true, force: true })
  }
})
