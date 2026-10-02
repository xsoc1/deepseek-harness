/** Native Client RPC, localized settings tab and owned styles. */
import type { Context } from '@deepseek-ai/cordis'
import { z } from 'zod'
import type { InvocationDescriptor, RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import type {} from '@deepseek-ai/dsh-api-gateway/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { MemoryPanelOps } from '../types.ts'
import { MemoryTab } from './tab.tsx'
import { en, zh } from './locales.ts'
import { installMemoryStyles } from './styles.ts'

type PanelResult<Key extends keyof MemoryPanelOps> = Promise<RemoteResult<Awaited<ReturnType<MemoryPanelOps[Key]>>>>
type PanelRemote = {
  [Key in keyof MemoryPanelOps]: (...args: Parameters<MemoryPanelOps[Key]>) => PanelResult<Key>
}
declare module '@deepseek-ai/dsh-typert-protocol' { interface TypertRemoteNamespaceMap { memoryPanel: PanelRemote } }
declare module '@deepseek-ai/dsh-client-ui-slots' { interface LocaleNamespaceMap { 'settings.memoryPanel': keyof typeof en } }
/** Stable package id. */
export const name = '@dsh-selfuse/memory-panel'
/** Native settings rendering and authenticated Host calls. */
export const inject = ['slots', 'locale', 'remote']
const NS = 'settings.memoryPanel'
const item = z.object({ id: z.string(), name: z.string(), size: z.number().int().nonnegative() })
const document = z.object({ id: z.string(), name: z.string(), content: z.string() })

function descriptor(method: string, parameters: Record<string, z.ZodType>, result: z.ZodType): InvocationDescriptor {
  return Object.freeze({
    id: `${name}#memoryPanel/${method}`, service: 'memoryPanel', namespace: 'memoryPanel', method,
    invocation: Object.freeze({ kind: 'direct' }),
    parameters: Object.freeze(Object.entries(parameters).map(([key, schema]) => Object.freeze({
      name: key, wire: key, source: 'json' as const,
      codec: Object.freeze({ mode: 'strict' as const, typeSymbol: `${name}/types#${key}`, create: () => schema }),
    }))),
    cancellation: Object.freeze({ parameter: 'signal' }),
    result: Object.freeze({ mode: 'strict', typeSymbol: `${name}/types#${method}`, create: () => result }),
  })
}
/** Strict Client codecs for the Host's seven panel operations. */
export const MEMORY_REMOTE: TypertRemoteContribution = Object.freeze({ package: name, descriptors: Object.freeze([
  descriptor('status', {}, z.object({ store: z.string(), counts: z.object({ pages: z.number().int(), notes: z.number().int() }), bytes: z.number().int() })),
  descriptor('pages', {}, z.object({ items: z.array(item) })),
  descriptor('page', { id: z.string() }, z.object({ page: document })),
  descriptor('notes', { limit: z.number().int().min(1).max(500), offset: z.number().int().min(0).max(100000) }, z.object({
    items: z.array(item.extend({ mtime: z.number() })), total: z.number().int(), limit: z.number().int(), offset: z.number().int(),
  })),
  descriptor('note', { id: z.string() }, z.object({ note: document })),
  descriptor('search', { query: z.string().max(1024) }, z.object({ results: z.array(z.object({ id: z.string(),
    kind: z.enum(['page', 'note']), name: z.string(), snippet: z.string(),
  })) })),
  descriptor('saveNote', { title: z.string(), text: z.string() }, z.object({ id: z.string(), name: z.string(), path: z.string() })),
]) })
function unwrap<Value>(result: RemoteResult<Value>): Value {
  if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`)
  return result.value
}
/**
 * Mount the local panel and unregister its contribution on unload.
 * @param ctx - Client context with native slots, locale and remote.
 * @returns Resolves once strict Remote calls and the tab are mounted.
 */
export async function apply(ctx: Context): Promise<void> {
  ctx.effect(() => ctx.locale.register(NS, { en, zh }), `${name}: dictionaries`)
  ctx.effect(() => installMemoryStyles(), `${name}: stylesheet`)
  await ctx.remote.$mount(MEMORY_REMOTE)
  ctx.inject(['remote.memoryPanel'], (scope) => {
    const remote = scope.remote.memoryPanel
    const api: MemoryPanelOps = {
      status: async signal => unwrap(await remote.status(signal)),
      pages: async signal => unwrap(await remote.pages(signal)),
      page: async (id, signal) => unwrap(await remote.page(id, signal)),
      notes: async (limit, offset, signal) => unwrap(await remote.notes(limit, offset, signal)),
      note: async (id, signal) => unwrap(await remote.note(id, signal)),
      search: async (query, signal) => unwrap(await remote.search(query, signal)),
      saveNote: async (title, text, signal) => unwrap(await remote.saveNote(title, text, signal)),
    }
    const t = scope.locale.bind(NS)
    scope.slots.inject('settings.plugins.tab', () => scope.slots.register({ name: 'settings.plugins.tab', id: 'memory',
      order: 45, label: () => t('tab'), locale: NS, inject: () => ({ api }),
    }, MemoryTab))
  })
}
