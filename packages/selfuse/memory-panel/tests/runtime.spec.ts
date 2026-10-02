/** Native Loader acceptance against disposable Markdown collections. */
import { mkdtemp, mkdir, readFile, readdir, rename, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it, onTestFinished, vi } from 'vitest'
import { Context, FiberState } from '@deepseek-ai/cordis'
import Loader, { EntryTree } from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import Typert from '@deepseek-ai/dsh-typert-registry'
import Gateway from '@deepseek-ai/dsh-api-gateway'
import { createLaunchEnvironmentSnapshot } from '@deepseek-ai/dsh-launch-environment'

const Memory = await vi.importActual<typeof import('../src/index.ts')>('../lib/index.js')

async function fixture(config: Record<string, unknown> = {}, {
  exposeHomeVariable = true, exposeNativeHome = true, memoryRoot,
}: { exposeHomeVariable?: boolean; exposeNativeHome?: boolean; memoryRoot?: string } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'dsh-memory-loader-'))
  const home = join(root, 'home')
  const store = join(home, 'memory')
  const ctx = new Context()
  onTestFinished(async () => {
    try { await ctx.fiber.dispose() }
    finally { await rm(root, { recursive: true, force: true }) }
  })
  await mkdir(join(store, 'knowledge'), { recursive: true })
  await mkdir(join(store, 'notes'), { recursive: true })
  await writeFile(join(store, 'knowledge', 'architecture.md'), '# Architecture\n\nLocal fixture text.\n')
  const values: Record<string, string> = {}
  if (exposeHomeVariable) values.DSH_HOME = home
  if (memoryRoot !== undefined) values.DSH_MEMORY_ROOT = memoryRoot
  ctx.provide('launchEnvironment', createLaunchEnvironmentSnapshot([{ source: 'process', values }]))
  // Keep the native bootstrap's home capability inside this fixture even without an environment override.
  if (exposeNativeHome) ctx.provide('dshHomePath', (...segments: string[]) => join(home, ...segments))
  await ctx.plugin(Typert)
  await ctx.plugin(Gateway)
  await ctx.plugin(Loader)
  ctx.loader.builtins.include = Include
  const file = join(root, 'cordis.yml')
  await writeFile(file, `- id: memory\n  name: '@dsh-selfuse/memory-panel'\n  config: ${JSON.stringify(config)}\n`)
  const resolver = vi.spyOn(EntryTree.prototype, 'import')
  onTestFinished(() => { resolver.mockRestore() })
  resolver.mockImplementation(function (this: EntryTree, name: string): unknown {
    if (name === '@dsh-selfuse/memory-panel') return Memory
    if (name.startsWith('cordis:')) return this.ctx.loader.builtins[name.slice(7)]
    throw new Error(`unexpected test import: ${name}`)
  })
  await ctx.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(file).href } })
  await ctx.loader.await()
  for (const entry of ctx.loader.entries()) await entry.fiber?.await()
  return { ctx, root, store }
}

it('loads with the native Harness home when Desktop sets no DSH_HOME override', async () => {
  const { ctx, store } = await fixture({}, { exposeHomeVariable: false })
  const service = ctx.get('memoryPanel')
  expect(service, 'native Desktop home resolution must not require an environment override').toBeDefined()
  if (!service) throw new Error('memoryPanel did not activate without DSH_HOME')
  expect(await service.status()).toMatchObject({ store, counts: { pages: 1, notes: 0 } })
  const saved = await service.saveNote('Desktop home', 'Resolved through the native bootstrap home capability.')
  expect((await service.note(saved.id)).note.content).toContain('native bootstrap')
})

it('honors an explicit store before either environment selection or the native home', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-memory-selection-'))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  const configured = join(root, 'configured')
  const { ctx } = await fixture({ root: configured }, { memoryRoot: join(root, 'environment') })
  expect(await ctx.memoryPanel.status()).toMatchObject({ store: configured, counts: { pages: 0, notes: 0 } })
  expect(await readdir(root)).toEqual(['configured'])
})

it('honors DSH_MEMORY_ROOT before the explicit Harness home', async () => {
  const store = await mkdtemp(join(tmpdir(), 'dsh-memory-environment-'))
  onTestFinished(() => rm(store, { recursive: true, force: true }))
  const { ctx } = await fixture({}, { memoryRoot: store })
  expect(await ctx.memoryPanel.status()).toMatchObject({ store, counts: { pages: 0, notes: 0 } })
})

it('accepts DSH_HOME without requiring the optional native home capability', async () => {
  const { ctx, store } = await fixture({}, { exposeNativeHome: false })
  expect(await ctx.memoryPanel.status()).toMatchObject({ store, counts: { pages: 1, notes: 0 } })
})

it('rejects a relative selection instead of silently falling back to the native home', async () => {
  await expect(fixture({ root: 'relative-memory' })).rejects.toThrow('Set an absolute memory root')
  await expect(fixture({}, { memoryRoot: 'relative-memory' })).rejects.toThrow('Set an absolute memory root')
})

it('rejects a scratch context with neither an explicit store nor an isolated home capability', async () => {
  await expect(fixture({}, { exposeHomeVariable: false, exposeNativeHome: false }))
    .rejects.toThrow('Set an absolute memory root')
})

it('loads the rebuilt panel without WebServer and persists distinct notes across reload', async () => {
  const { ctx, store } = await fixture()
  const service = ctx.get('memoryPanel')
  expect(service, 'the settings panel must use the native service, not an unmounted HTTP route').toBeDefined()
  if (!service) throw new Error('memoryPanel did not activate')
  expect(await service.status()).toMatchObject({ store, counts: { pages: 1, notes: 0 } })
  expect(await service.pages()).toMatchObject({ items: [{ id: 'architecture', name: 'Architecture' }] })
  expect(await service.page('architecture')).toMatchObject({ page: { content: '# Architecture\n\nLocal fixture text.\n' } })
  const saved = await Promise.all([service.saveNote('Same', 'first'), service.saveNote('Same', 'second')])
  expect(saved[0]?.id).not.toBe(saved[1]?.id)
  expect(await readdir(join(store, 'notes'))).toHaveLength(2)
  expect(await service.notes(1, 0)).toMatchObject({ total: 2, limit: 1, offset: 0 })
  expect((await service.search('fixture')).results).toMatchObject([{ id: 'architecture', kind: 'page' }])
  const row = [...ctx.loader.entries()].find(entry => entry.options.id === 'memory')
  if (!row) throw new Error('Loader row disappeared')
  expect(row.fiber?.state).toBe(FiberState.ACTIVE)
  await row.update({ ...row.options, disabled: true })
  expect(ctx.get('memoryPanel')).toBeUndefined()
  expect(ctx.typert.local.get('memoryPanel/status')).toBeUndefined()
  await expect(service.saveNote('stale', 'must not write')).rejects.toThrow()
  expect(await readdir(join(store, 'notes'))).toHaveLength(2)
  await row.update({ ...row.options, disabled: false })
  await row.fiber?.await()
  expect(await ctx.memoryPanel.status()).toMatchObject({ counts: { notes: 2 } })
})

it('rejects traversal, symlink content and over-limit UTF-8 writes without modifying outside data', async () => {
  const { ctx, root, store } = await fixture({ maxFileBytes: 256 })
  expect(ctx.get('memoryPanel')).toBeDefined()
  const outside = join(root, 'private.md')
  await writeFile(outside, 'outside stays private')
  await symlink(outside, join(store, 'knowledge', 'linked.md'))
  await expect(ctx.memoryPanel.page('../private')).rejects.toThrow()
  await expect(ctx.memoryPanel.page('linked')).rejects.toThrow()
  await expect(ctx.memoryPanel.saveNote('large', '中'.repeat(100))).rejects.toThrow()
  expect(await readFile(outside, 'utf8')).toBe('outside stays private')
  expect(await readdir(join(store, 'notes'))).toEqual([])
  const signal = AbortSignal.abort()
  await expect(ctx.memoryPanel.saveNote('cancelled', 'not saved', signal)).rejects.toThrow()
  expect(await readdir(join(store, 'notes'))).toEqual([])
  await writeFile(join(store, 'knowledge', 'invalid.md'), Buffer.from([0xc3, 0x28]))
  await expect(ctx.memoryPanel.page('invalid')).rejects.toThrow()
  await writeFile(join(store, 'knowledge', 'oversized.md'), 'x'.repeat(257))
  await expect(ctx.memoryPanel.page('oversized')).rejects.toThrow()
  await expect(ctx.memoryPanel.notes(0, 0)).rejects.toThrow()
  await expect(ctx.memoryPanel.notes(1, -1)).rejects.toThrow()
  await rename(join(store, 'notes'), join(store, 'notes-before-link'))
  const outsideDirectory = join(root, 'outside-notes')
  await mkdir(outsideDirectory)
  await symlink(outsideDirectory, join(store, 'notes'), 'dir')
  await expect(ctx.memoryPanel.saveNote('linked directory', 'must not write outside')).rejects.toThrow()
  expect(await readdir(outsideDirectory)).toEqual([])
})

it('dispatches all seven operations through the native Host Gateway and rejects malformed wire arguments', async () => {
  const { ctx, store } = await fixture()
  const invoke = (method: string, args: Record<string, unknown> = {}, signal: AbortSignal = new AbortController().signal) =>
    ctx.typertGateway.invoke({ namespace: 'memoryPanel', method, args, signal })
  await expect(invoke('status')).resolves.toMatchObject({ counts: { pages: 1, notes: 0 } })
  await expect(invoke('pages')).resolves.toMatchObject({ items: [{ id: 'architecture' }] })
  await expect(invoke('page', { id: 'architecture' })).resolves.toMatchObject({ page: { name: 'Architecture' } })
  await expect(invoke('saveNote', { title: 'RPC note', text: 'Saved through the actual Host dispatcher.' }))
    .resolves.toMatchObject({ name: 'RPC note' })
  const file = (await readdir(join(store, 'notes')))[0]
  if (!file) throw new Error('Gateway note was not persisted')
  await expect(invoke('note', { id: file.slice(0, -3) })).resolves.toMatchObject({ note: { name: 'RPC note' } })
  await expect(invoke('notes', { limit: 50, offset: 0 })).resolves.toMatchObject({ total: 1 })
  await expect(invoke('search', { query: 'dispatcher' })).resolves.toMatchObject({ results: [{ kind: 'note' }] })
  await expect(invoke('notes', { limit: 50 })).rejects.toThrow()
  await expect(invoke('status', { unwanted: true })).rejects.toThrow()
  await expect(invoke('page', { id: '../private' })).rejects.toThrow()
  await expect(invoke('saveNote', { title: 'cancelled', text: 'not saved' }, AbortSignal.abort())).rejects.toThrow()
  expect(await readdir(join(store, 'notes'))).toHaveLength(1)
})
