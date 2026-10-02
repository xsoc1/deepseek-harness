/** @vitest-environment jsdom */
/** Rebuilt browser factory mounted on native locale, slots and Remote services. */
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { expect, it, onTestFinished } from 'vitest'
import type { ReactNode } from 'react'
import { Context } from '@deepseek-ai/cordis'
import Typert from '@deepseek-ai/dsh-typert-registry'
import { installConnection } from '@deepseek-ai/dsh-client-connection/client'
import * as Gateway from '@deepseek-ai/dsh-api-gateway/client'
import { RemoteMock, ok } from '@deepseek-ai/dsh-remote-mock'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { getStaticModules } from '../../../client/web/src/seed.ts'

interface Registration { id: string; factory(require: (specifier: string) => unknown): unknown }

it('activates the native settings tab, validates rejected updates and removes owned contributions', async () => {
  const ctx = new Context()
  onTestFinished(async () => { await ctx.fiber.dispose() })
  const mock = RemoteMock.create()
  mock.unary('backupPanel/setAuto', ok({ ok: false, hours: 0, summary: 'invalid hours' }))
  mock.unary('backupPanel/setGithubRepo', ok({ ok: false, repo: null, summary: 'invalid repo' }))
  mock.unary('backupPanel/status', ok({ destination: '/fixture/backups', dshHome: '/fixture/.dsh', keepDefault: 7,
    autoHours: 0, lastAuto: null, backups: [], downloadAvailable: false }))
  installConnection(ctx, { transport: { rpc: mock.rpc, ownsHost: true } })
  await ctx.plugin(Typert)
  await ctx.plugin(Gateway)
  const slots = new SlotRegistry(ctx)
  ctx.provide('locale', new LocaleRuntime(ctx))
  slots.register({ name: 'root', children: { 'settings.plugins.tab': { kind: 'list', scope: 'root' } } },
    (props: { renderSlot: (name: 'settings.plugins.tab', owner: object) => ReactNode }) => props.renderSlot('settings.plugins.tab', {}))
  const modules = getStaticModules()
  const source = await readFile(resolve(import.meta.dirname, '../lib/client.js'), 'utf8')
  let exported: unknown
  runInNewContext(source, {
    window: { __ModuleLoader__: { load(registration: Registration) {
      expect(registration.id).toBe('@dsh-selfuse/backup')
      exported = registration.factory((specifier) => {
        if (!Object.hasOwn(modules, specifier)) throw new Error(`Unknown platform external: ${specifier}`)
        return modules[specifier]
      })
    } } }, document,
  }, { timeout: 2000 })
  if (exported === null || typeof exported !== 'object' || !('apply' in exported) || typeof exported.apply !== 'function') {
    throw new Error('client factory did not export its plugin apply')
  }
  // The checked factory is the actual artifact; use its declaration only for Cordis mounting.
  const plugin = exported as typeof import('../src/client/index.ts')
  try {
    const row = await ctx.plugin(plugin)
    await row.await()
    expect(document.querySelector('style[data-dsh-backup]')).not.toBeNull()
    expect(slots.entries('settings.plugins.tab').map(item => item.options.id)).toContain('backup')
    expect(await ctx.remote.backupPanel.setAuto(0)).toMatchObject({ ok: true, value: { ok: false, hours: 0 } })
    expect(await ctx.remote.backupPanel.setGithubRepo('invalid')).toMatchObject({ ok: true, value: { ok: false, repo: null } })
    expect(await ctx.remote.backupPanel.status()).toMatchObject({ ok: true, value: { downloadAvailable: false } })
    await row.dispose()
    expect(document.querySelector('style[data-dsh-backup]')).toBeNull()
    expect(slots.entries('settings.plugins.tab').map(item => item.options.id)).not.toContain('backup')
    await expect(async () => { await ctx.remote.backupPanel.setAuto(0) }).rejects.toThrow()
  } finally { await ctx.fiber.dispose() }
})
