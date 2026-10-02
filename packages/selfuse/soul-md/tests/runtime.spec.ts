/** Real Loader, prompt rendering and file lifecycle in a disposable home. */
import { mkdtemp, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it, onTestFinished, vi } from 'vitest'
import { Context, FiberState } from '@deepseek-ai/cordis'
import Loader, { EntryTree } from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import SystemPrompt, { renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import { createLaunchEnvironmentSnapshot } from '@deepseek-ai/dsh-launch-environment'

const Soul = await vi.importActual<typeof import('../src/index.ts')>('../lib/index.js')

async function fixture(config: Record<string, unknown> = {}, initial?: string | Uint8Array, omitConfig = false) {
  const root = await mkdtemp(join(tmpdir(), 'dsh-soul-loader-'))
  const path = join(root, 'soul.md')
  const ctx = new Context()
  ctx.provide('launchEnvironment', createLaunchEnvironmentSnapshot([{ source: 'process', values: { DSH_HOME: root } }]))
  onTestFinished(async () => {
    try { await ctx.fiber.dispose() }
    finally { await rm(root, { recursive: true, force: true }) }
  })
  if (initial !== undefined) await writeFile(path, initial)
  await ctx.plugin(SystemPrompt)
  ctx.systemPrompt.variable('model', () => 'fixture-model')
  await ctx.plugin(Loader)
  ctx.loader.builtins.include = Include
  const file = join(root, 'cordis.yml')
  const settings = omitConfig ? '' : `  config: ${JSON.stringify({ path, debounceMs: 20, ...config })}\n`
  await writeFile(file, `- id: soul\n  name: '@dsh-selfuse/soul-md'\n${settings}`)
  const resolver = vi.spyOn(EntryTree.prototype, 'import')
  onTestFinished(() => { resolver.mockRestore() })
  resolver.mockImplementation(function (this: EntryTree, name: string): unknown {
    if (name === '@dsh-selfuse/soul-md') return Soul
    if (name.startsWith('cordis:')) return this.ctx.loader.builtins[name.slice(7)]
    throw new Error(`unexpected test import: ${name}`)
  })
  await ctx.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(file).href } })
  await ctx.loader.await()
  for (const entry of ctx.loader.entries()) await entry.fiber?.await()
  const row = [...ctx.loader.entries()].find(entry => entry.options.id === 'soul')
  if (!row) throw new Error('soul Loader row missing')
  const prompt = async () => renderPrompt(await ctx.systemPrompt.assemble())
  return { ctx, path, row, prompt }
}

it('activates the shipped config-less bundle row using native defaults', async () => {
  const { row, prompt } = await fixture({}, 'Default card.', true)
  expect(row.fiber?.state).toBe(FiberState.ACTIVE)
  expect(await prompt()).toContain('Default card.')
})

it('watches a missing card, survives atomic replacement and unregisters on unload', async () => {
  const { path, row, prompt } = await fixture()
  expect(row.fiber?.state).toBe(FiberState.ACTIVE)
  expect(await prompt()).toBe('You are an AI agent powered by DeepSeek Harness.')
  await writeFile(path, 'Work carefully with {{model}}.')
  await expect.poll(prompt).toContain('Work carefully with fixture-model.')
  await writeFile(path + '.new', 'Changed card.')
  await rename(path + '.new', path)
  await expect.poll(prompt).toContain('Changed card.')
  await row.update({ ...row.options, disabled: true })
  expect(await prompt()).toBe('You are an AI agent powered by DeepSeek Harness.')
  await writeFile(path, 'Must not return after disposal.')
  await new Promise(resolve => setTimeout(resolve, 100))
  expect(await prompt()).not.toContain('Must not return')
  await row.update({ ...row.options, disabled: false })
  await row.fiber?.await()
  expect(await prompt()).toContain('Must not return after disposal.')
})

it('renders complete cards and applies native configuration changes without stale sections', async () => {
  const { path, row, prompt } = await fixture({ fallback: 'Only {{model}}.', complete: true, watch: false })
  expect(await prompt()).toBe('Only fixture-model.')
  await writeFile(path, 'File content.')
  await row.update({ ...row.options, config: { path, watch: false, complete: false, order: 10, fallback: '' } })
  await row.fiber?.await()
  expect(await prompt()).toBe('You are an AI agent powered by DeepSeek Harness.\n\nFile content.')
  expect(await prompt()).not.toContain('Only fixture-model')
})

it('uses the captured home for relative paths and retains the last valid card after failed reloads', async () => {
  const { ctx, path, row, prompt } = await fixture({ path: 'soul.md', maxFileBytes: 256 }, 'Valid original card.')
  expect(await prompt()).toContain('Valid original card.')
  const warning = vi.spyOn(ctx.logger, 'warn')
  onTestFinished(() => { warning.mockRestore() })
  await writeFile(path, new Uint8Array([255, 254]))
  await expect.poll(() => warning.mock.calls.length).toBeGreaterThan(0)
  expect(await prompt()).toContain('Valid original card.')
  warning.mockClear()
  await writeFile(path, 'x'.repeat(257))
  await expect.poll(() => warning.mock.calls.length).toBeGreaterThan(0)
  expect(await prompt()).toContain('Valid original card.')
  await writeFile(path, 'Recovered {{model}}.')
  await expect.poll(prompt).toContain('Recovered fixture-model.')
  await row.update({ ...row.options, disabled: true })
  expect(await prompt()).not.toContain('Recovered')
})
