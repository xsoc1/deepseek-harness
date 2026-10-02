import { Context } from '@deepseek-ai/cordis'
import Loader, { EntryTree } from '@deepseek-ai/cordis-plugin-loader'
import { TestRemote, RemoteError } from '@deepseek-ai/dsh-client-test-runtime'
import z from '@deepseek-ai/schemastery'
import { afterEach, expect, it, vi } from 'vitest'
import * as Settings from '@deepseek-ai/dsh-client-ui-settings/client'
import type { SettingsNamespaceView } from '@deepseek-ai/dsh-api-remotes/client'
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import { sectionForm } from '../src/client/section-form.ts'

afterEach(() => { vi.restoreAllMocks() })

const schema = JSON.parse(JSON.stringify(z.object({
  background: z.object({ enabled: z.boolean(), opacity: z.number() }),
  wallpaper: z.object({ enabled: z.boolean() }),
}).toJSON())) as JsonValue

function view(revision = 8): SettingsNamespaceView {
  return {
    ns: 'ui-skin-center', schema, revision,
    value: { background: { enabled: true, opacity: 0.4 }, wallpaper: { enabled: false } },
    base: { background: { enabled: false } }, user: { background: { enabled: true } },
    autoGenerate: true, applies: 'live', secrets: [],
  }
}

it('projects stable nested snapshots and sends atomic writes through native Loader ConfigForms', async () => {
  const ctx = new Context()
  const describe = vi.fn().mockResolvedValue({ ok: true, value: { writable: true, hasDocument: true, namespaces: [view()] } })
  const mutate = vi.fn().mockResolvedValue({ ok: true, value: view(9) })
  const remote = new TestRemote(ctx, { settings: { describe, mutate } })
  vi.spyOn(EntryTree.prototype, 'import').mockImplementation((name: string) => {
    if (name === 'native-settings') return Settings
    throw new Error('unexpected Loader entry: ' + name)
  })
  try {
    await ctx.plugin(Loader)
    await ctx.loader.create({ name: 'native-settings' })
    await ctx.loader.await()
    const entry = [...ctx.loader.entries()].find(item => item.options.name === 'native-settings')
    if (entry === undefined) throw new Error('native settings entry missing')
    const parent = ctx.configForms.get<{ background: { enabled: boolean; opacity: number } }>('ui-skin-center')
    const child = sectionForm(parent, 'background')
    await vi.waitFor(() => { expect(child.getSnapshot().status).toBe('ready') })
    expect(child.getSnapshot()).toBe(child.getSnapshot())
    expect(child.getSnapshot()).toMatchObject({
      value: { enabled: true, opacity: 0.4 }, user: { enabled: true }, base: { enabled: false }, revision: 8,
    })
    await child.mutate([{ op: 'set', path: ['enabled'], value: false }, { op: 'unset', path: ['opacity'] }], 8)
    expect(mutate).toHaveBeenCalledWith('ui-skin-center', [
      { op: 'set', path: ['background', 'enabled'], value: false },
      { op: 'unset', path: ['background', 'opacity'] },
    ], 8)
    await child.set('opacity', 0.6)
    expect(mutate).toHaveBeenLastCalledWith('ui-skin-center', [{ op: 'set', path: ['background', 'opacity'], value: 0.6 }], 9)
    mutate.mockResolvedValueOnce({ ok: false, error: new RemoteError('settings/conflict', 'conflict', { ns: 'ui-skin-center', expected: 9, actual: 10 }) })
    expect(await child.unset('enabled')).toBe(false)
    const listener = vi.fn()
    const unsubscribe = child.subscribe(listener)
    await entry.update({ disabled: true })
    await ctx.loader.await()
    const calls = describe.mock.calls.length
    remote.emit('settings/document-updated', ['ui-skin-center', 0])
    await Promise.resolve()
    expect(describe).toHaveBeenCalledTimes(calls)
    expect(await child.set('enabled', false)).toBe(false)
    unsubscribe()
  } finally {
    await ctx.fiber.dispose()
  }
})
