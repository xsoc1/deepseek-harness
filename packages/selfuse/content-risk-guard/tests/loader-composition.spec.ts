import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader, { EntryTree } from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import LlmRuntime, { createToolResultMessage, LlmAdapter } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, Message, StreamChunk } from '@deepseek-ai/dsh-llm'
import ToolRuntime, { defineContentToolFixture } from '@deepseek-ai/dsh-tools'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import * as ContentRiskGuard from '../src/index.ts'
import { createPrivacyTestAgent } from './agent-fixture.ts'

it('loads through cordis.yml and commits only the safe projection', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-risk-loader-'))
  const privateRoot = join(root, 'private')
  const configPath = join(root, 'cordis.yml')
  const ctx = new Context()
  const resolver = vi.spyOn(EntryTree.prototype, 'import')
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
    // Control module resolution, not the real Loader entries or plugin services.
    resolver.mockImplementation(function (this: EntryTree, specifier: string): unknown {
      if (specifier.startsWith('cordis:')) {
        const builtin: unknown = this.ctx.loader.builtins[specifier.slice(7)]
        return builtin
      }
      const plugin = plugins[specifier]
      if (plugin === undefined) throw new Error(`unexpected Loader import: ${specifier}`)
      return plugin
    })
    await ctx.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(configPath).href } })
    await ctx.loader.await()

    const secret = 'proxies:\n  - name: loader-secret\n    type: vmess\n'
    ctx.tools.register(defineContentToolFixture({
      name: 'loader_fixture', description: 'fixture', parameters: {},
      async execute() { return [{ type: 'text', text: secret }] },
    }))
    const agent = await createPrivacyTestAgent(ctx, 'loader-session')
    const result = await ctx.tools.execute({
      name: 'loader_fixture', callId: ToolCallId('loader-call'), arguments: {},
      agent,
      signal: new AbortController().signal,
    })
    expect(result.isError).toBeFalsy()
    expect(JSON.stringify(result.content)).toContain('local-result:')
    expect(JSON.stringify(result.content)).not.toContain('loader-secret')
    const files = await readdir(privateRoot)
    expect(files).toHaveLength(1)
    const file = files.at(0)
    if (file === undefined) throw new Error('missing private result')
    expect(await readFile(join(privateRoot, file), 'utf8')).toContain('loader-secret')

    const requests: GenerateOptions[] = []
    class CaptureAdapter extends LlmAdapter {
      async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
        requests.push(options)
        yield { type: 'finish', reason: { kind: 'stop' } }
      }
    }
    ctx.llm.registerAdapter(['risk-fixture'], new CaptureAdapter())
    const messages: Message[] = [createToolResultMessage({
      callId: ToolCallId('historical'),
      content: [{ type: 'text', text: JSON.stringify({ output: '  1\tproxies:\n  2\t  - name: loader-secret' }) }],
      isError: false,
    })]
    const chunks: StreamChunk[] = []
    for await (const chunk of ctx.llm.stream({ provider: 'risk-fixture', model: 'fixture', messages })) {
      chunks.push(chunk)
    }
    expect(requests).toHaveLength(0)
    expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'error' } })
    expect(JSON.stringify(chunks)).not.toContain('loader-secret')

    const guardEntry = [...ctx.loader.entries()].find(entry => entry.options.name === ContentRiskGuard.name)
    if (guardEntry === undefined) throw new Error('missing loaded privacy plugin')
    const handle = result.content.flatMap(block => block.type === 'text' ? [block.text] : [])
      .join('').match(/local-result:([a-f0-9]{32})/)?.[1]
    if (handle === undefined) throw new Error('missing private result handle')
    const inspect = () => ctx.tools.execute({
      name: 'inspect_local_network_result', callId: ToolCallId('loader-inspect'), arguments: { handle },
      agent, signal: new AbortController().signal,
    })
    expect((await inspect()).isError).toBeFalsy()
    await guardEntry.update({ disabled: true })
    await ctx.loader.await()
    expect((await inspect()).isError).toBe(true)
    await guardEntry.update({ disabled: false })
    await ctx.loader.await()
    const restored = await inspect()
    expect(restored.isError).toBeFalsy()
    expect(JSON.stringify(restored.content)).not.toContain('loader-secret')
  } finally {
    await ctx.fiber.dispose()
    resolver.mockRestore()
    await rm(root, { recursive: true, force: true })
  }
})
