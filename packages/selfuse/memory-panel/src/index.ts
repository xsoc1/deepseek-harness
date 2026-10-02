/** Optional native Host service for the human-facing local Markdown panel. */
import { join, isAbsolute } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { TypertRemoteService, type InvocationDescriptor } from '@deepseek-ai/dsh-typert-protocol'
import type {} from '@deepseek-ai/dsh-app-boot'
import type {} from '@deepseek-ai/dsh-launch-environment'
import type {} from '@deepseek-ai/dsh-typert-registry'
import type { MemoryPanelOps, MemoryPanelPage, MemoryPanelPages, MemoryPanelNote, MemoryPanelNotes,
  MemoryPanelSaved, MemoryPanelSearch, MemoryPanelStatus } from './types.ts'
import { createMemoryStore } from './storage.ts'

/** Stable plugin id; opt-in only. */
export const name = '@dsh-selfuse/memory-panel'
/** Host-owned environment and authenticated RPC catalog. */
export const inject = ['launchEnvironment', 'typert']
/** Store selection and bounds persisted by the native Loader. */
export interface Config {
  /** Absolute Host directory; empty uses DSH_MEMORY_ROOT or the selected Harness home's memory directory. */
  root: string
  /** Complete UTF-8 byte limit for reads and composed notes. */
  maxFileBytes: number
  /** Match limit across knowledge pages and notes. */
  searchLimit: number
}
/** Native configuration validation; this layer does not select a model. */
export const Config = z.object({
  root: z.string().default(''),
  maxFileBytes: z.number().min(256).max(1048576).step(1).default(262144),
  searchLimit: z.number().min(1).max(500).step(1).default(50),
})

function descriptor(method: string, parameters: string[]): InvocationDescriptor {
  return Object.freeze({
    id: `${name}#memoryPanel/${method}`, service: 'memoryPanel', namespace: 'memoryPanel', method,
    invocation: Object.freeze({ kind: 'direct' }),
    parameters: Object.freeze(parameters.map(parameter => Object.freeze({
      name: parameter, wire: parameter, source: 'json' as const, codec: Object.freeze({ mode: 'src-json' as const }),
    }))),
    cancellation: Object.freeze({ parameter: 'signal' }), result: Object.freeze({ mode: 'src-json' }),
  })
}
const INVOCATIONS = [descriptor('status', []), descriptor('pages', []), descriptor('page', ['id']),
  descriptor('notes', ['limit', 'offset']), descriptor('note', ['id']), descriptor('search', ['query']),
  descriptor('saveNote', ['title', 'text'])]

/** Local Markdown access; only the settings tab consumes this service. */
export class MemoryPanelService extends TypertRemoteService {
  private readonly controller = new AbortController()
  private readonly pending = new Set<Promise<unknown>>()
  /**
   * Register this instance and settle its file operations before unloading.
   * @param ctx - Context owning the service lifetime.
   * @param ops - Store operations bound to one validated Host directory.
   */
  constructor(ctx: Context, private readonly ops: MemoryPanelOps) {
    super(ctx, 'memoryPanel')
    ctx.effect(() => async () => {
      this.controller.abort()
      await Promise.allSettled([...this.pending])
    }, `${name}: pending file operations`)
  }

  private run<Value>(operation: (signal: AbortSignal) => Promise<Value>, signal?: AbortSignal): Promise<Value> {
    const merged = signal ? AbortSignal.any([signal, this.controller.signal]) : this.controller.signal
    const task = operation(merged)
    this.pending.add(task)
    void task.then(() => this.pending.delete(task), () => this.pending.delete(task))
    return task
  }

  /** Read directory counts and bytes.
   * @param signal - Optional cancellation.
   * @returns Metadata without file content.
   */
  status(signal?: AbortSignal): Promise<MemoryPanelStatus> { return this.run(s => this.ops.status(s), signal) }
  /** List permitted knowledge files.
   * @param signal - Optional cancellation.
   * @returns File names and sizes; IO failures reject.
   */
  pages(signal?: AbortSignal): Promise<MemoryPanelPages> { return this.run(s => this.ops.pages(s), signal) }
  /** Read one knowledge page.
   * @param id - Restricted basename without extension.
   * @param signal - Optional cancellation.
   * @returns Complete bounded UTF-8 content; invalid ids and links reject.
   */
  page(id: string, signal?: AbortSignal): Promise<MemoryPanelPage> { return this.run(s => this.ops.page(id, s), signal) }
  /** List a page of notes in descending modification-time order.
   * @param limit - Integer from 1 to 500.
   * @param offset - Integer from 0 to 100000.
   * @param signal - Optional cancellation.
   * @returns Note metadata and total count.
   */
  notes(limit: number, offset: number, signal?: AbortSignal): Promise<MemoryPanelNotes> {
    return this.run(s => this.ops.notes(limit, offset, s), signal)
  }
  /** Read one note.
   * @param id - Restricted basename without extension.
   * @param signal - Optional cancellation.
   * @returns Complete bounded UTF-8 content; invalid ids and links reject.
   */
  note(id: string, signal?: AbortSignal): Promise<MemoryPanelNote> { return this.run(s => this.ops.note(id, s), signal) }
  /** Search both collections by case-insensitive substring.
   * @param query - At most 1024 characters; empty returns no matches.
   * @param signal - Optional cancellation.
   * @returns Bounded snippets; unreadable or oversized files reject.
   */
  search(query: string, signal?: AbortSignal): Promise<MemoryPanelSearch> { return this.run(s => this.ops.search(query, s), signal) }
  /** Create a uniquely named note without overwriting an existing file.
   * @param title - Optional one-line title represented by an empty string.
   * @param text - Non-empty note body.
   * @param signal - Optional cancellation before the write commits.
   * @returns The saved note id and actual configured path.
   */
  saveNote(title: string, text: string, signal?: AbortSignal): Promise<MemoryPanelSaved> {
    return this.run(s => this.ops.saveNote(title, text, s), signal)
  }
}
declare module '@deepseek-ai/cordis' { interface Context { memoryPanel: MemoryPanelService } }

/**
 * Load the optional store and register its RPC methods without legacy HTTP routes.
 * @param ctx - Host context providing launchEnvironment and typert.
 * @param config - Native validated storage selection and bounds.
 * @returns Resolves when file collections and the service are ready.
 */
export async function apply(ctx: Context, config: Config): Promise<void> {
  const env = ctx.launchEnvironment
  if (!env) throw new Error('Memory panel requires launchEnvironment')
  const home = env.get('DSH_HOME')?.value
  const root = config.root || env.get('DSH_MEMORY_ROOT')?.value
    || (home ? join(home, 'memory') : ctx.get('dshHomePath')?.('memory') ?? '')
  if (!isAbsolute(root)) throw new Error('Set an absolute memory root or launch with DSH_HOME')
  const ops = await createMemoryStore(root, config.maxFileBytes, config.searchLimit)
  ctx.effect(() => ctx.typert.register({ package: name, face: 'host', schemas: [], invocations: INVOCATIONS,
    model: Object.freeze({ services: Object.freeze([]), events: Object.freeze([]), objects: Object.freeze([]) }),
  }), `${name}: RPC methods`)
  await ctx.plugin(MemoryPanelService, ops)
}
