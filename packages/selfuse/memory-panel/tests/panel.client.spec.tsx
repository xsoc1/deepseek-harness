/** @vitest-environment jsdom */
/** Actual browser factory on the native renderer, with a disposable file store. */
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { expect, it, onTestFinished, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Typert from '@deepseek-ai/dsh-typert-registry'
import { installConnection } from '@deepseek-ai/dsh-client-connection/client'
import * as Gateway from '@deepseek-ai/dsh-api-gateway/client'
import * as Renderer from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { StandardSourceBinding } from '@deepseek-ai/dsh-client-ui-slots'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { RemoteMock, ok } from '@deepseek-ai/dsh-remote-mock'
import { getStaticModules } from '../../../client/web/src/seed.ts'
// Keep Host source out of the Client TS project; its generated declaration types this fixture.
const { createMemoryStore } = await vi.importActual<typeof import('../lib/types/storage.d.ts')>('../src/storage.ts')

interface Registration { id: string; factory(require: (specifier: string) => unknown): unknown }

it('renders localized copy, saves and refreshes real notes, and removes its Remote tab', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-memory-browser-'))
  const ctx = new Context()
  let unmount: (() => void) | undefined
  const container = document.createElement('main')
  document.body.append(container)
  onTestFinished(async () => {
    act(() => { unmount?.() })
    try { await ctx.fiber.dispose() }
    finally { container.remove(); await rm(root, { recursive: true, force: true }) }
  })
  const store = await createMemoryStore(root, 262144, 50)
  const mock = RemoteMock.create()
  mock.unary('memoryPanel/status', async () => ok(await store.status()))
  mock.unary('memoryPanel/pages', async () => ok(await store.pages()))
  mock.unary('memoryPanel/notes', async (args: { limit: number; offset: number }) => ok(await store.notes(args.limit, args.offset)))
  mock.unary('memoryPanel/note', async (args: { id: string }) => ok(await store.note(args.id)))
  mock.unary('memoryPanel/search', async (args: { query: string }) => ok(await store.search(args.query)))
  mock.unary('memoryPanel/saveNote', async (args: { title: string; text: string }) => ok(await store.saveNote(args.title, args.text)))
  installConnection(ctx, { transport: { rpc: mock.rpc, ownsHost: true } })
  await ctx.plugin(Typert)
  await ctx.plugin(Gateway)
  await ctx.plugin(Renderer)
  const locale = new LocaleRuntime(ctx)
  ctx.provide('locale', locale)
  ctx.slots.installLocale(locale)
  const absent: StandardSourceBinding = { key: undefined, hooks: {}, keyedHooks: {}, props: {} }
  const sourceBinding = { getSnapshot: () => absent, subscribe: () => () => {} }
  // The settings panel has no active Session; retain the native optional-scope protocol.
  ctx.slots.installScope('session', { current: sourceBinding, bindingSource: () => sourceBinding })
  locale.setLocale('en')
  ctx.slots.register({ name: 'root', children: { 'settings.plugins.tab': { kind: 'list', scope: 'root' } } },
    (props: { renderSlot: (name: 'settings.plugins.tab', owner: object) => ReactNode }) => props.renderSlot('settings.plugins.tab', {}))
  const modules = getStaticModules()
  // This override permits a differential run against the archived former factory.
  const artifact = process.env.DSH_MEMORY_FACTORY_FIXTURE || resolve(import.meta.dirname, '../lib/client.js')
  const source = await readFile(artifact, 'utf8')
  let exported: unknown
  runInNewContext(source, { document, AbortController, AbortSignal,
    window: { __ModuleLoader__: { load(registration: Registration) {
      expect(registration.id).toBe('@dsh-selfuse/memory-panel')
      exported = registration.factory((specifier) => {
        if (!Object.hasOwn(modules, specifier)) throw new Error(`Unknown platform external: ${specifier}`)
        return modules[specifier]
      })
    } } },
  }, { timeout: 2000 })
  if (exported === null || typeof exported !== 'object' || !('apply' in exported) || typeof exported.apply !== 'function') {
    throw new Error('client factory did not export apply')
  }
  const plugin = exported as typeof import('../src/client/index.ts')
  const row = await ctx.plugin(plugin)
  await row.await()
  act(() => { unmount = ctx.uiRenderer.mount(container) })
  await waitFor(() => { expect(screen.getByText('Local memory')).toBeTruthy() })
  expect(screen.getByText('No knowledge pages in the configured store.')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Notes' }))
  await waitFor(() => { expect(screen.getByText('0 notes')).toBeTruthy() })
  fireEvent.change(screen.getByLabelText('Title (optional)'), { target: { value: 'Saved fixture' } })
  fireEvent.change(screen.getByLabelText('Memory content…'), { target: { value: 'A real local note.\n<script>window.fixtureExecuted=true</script>' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => { expect(screen.getByText('Saved: Saved fixture')).toBeTruthy() })
  await waitFor(() => { expect(screen.getByText('1 notes')).toBeTruthy() })
  expect(await readdir(join(root, 'notes'))).toHaveLength(1)
  fireEvent.click(screen.getByRole('button', { name: /^Saved fixture/ }))
  await waitFor(() => { expect(container.querySelector('pre')?.textContent).toContain('A real local note.') })
  expect(container.querySelector('script')).toBeNull()
  expect('fixtureExecuted' in window).toBe(false)
  fireEvent.click(screen.getByRole('button', { name: 'Search' }))
  fireEvent.change(screen.getByLabelText('Search memory…'), { target: { value: 'real local' } })
  const searchButton = screen.getAllByRole('button', { name: 'Search' })[1]
  if (!searchButton) throw new Error('search form did not render its submit button')
  fireEvent.click(searchButton)
  await waitFor(() => { expect(screen.getByRole('button', { name: /^Saved fixture/ })).toBeTruthy() })
  act(() => { locale.setLocale('zh') })
  await waitFor(() => { expect(screen.getByText('本地记忆存储')).toBeTruthy() })
  expect(container.querySelector('style')).toBeNull()
  expect(document.querySelector('style[data-dsh-memory]')).not.toBeNull()
  await act(async () => { await row.dispose() })
  expect(document.querySelector('style[data-dsh-memory]')).toBeNull()
  expect(ctx.slots.entries('settings.plugins.tab').map(entry => entry.options.id)).not.toContain('memory')
  await expect(async () => { await ctx.remote.memoryPanel.status() }).rejects.toThrow()
})
