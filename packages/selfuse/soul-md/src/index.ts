/** Local persona cards registered through the native prompt and configuration services. */
import { closeSync, openSync, readSync, unwatchFile, watchFile } from 'node:fs'
import { isAbsolute, join } from 'node:path'
import { TextDecoder } from 'node:util'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { resolveDshHome } from '@deepseek-ai/dsh-home-paths'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-launch-environment'
import type {} from '@deepseek-ai/cordis-plugin-loader'

/** Native Loader identity. */
export const name = '@dsh-selfuse/soul-md'
/** Prompt registry and immutable launch-time home selection. */
export const inject = ['systemPrompt', 'launchEnvironment']
/** Separate from the official deployment persona sections. */
export const SECTION_NAME = 'soul:persona'
/** Persona preferences exposed by the official plugin configuration form. */
export const Config = z.object({
  path: z.string().default('soul.md'),
  fallback: z.string().default(''),
  order: z.number().step(1).default(0),
  complete: z.boolean().default(false),
  watch: z.boolean().default(true),
  debounceMs: z.number().min(10).max(60000).step(1).default(300),
  maxFileBytes: z.number().min(256).max(1048576).step(1).default(131072),
}).default({}).volatile()
/** Live native Loader reference, not the retired settingsScope API. */
export type Config = ReturnType<typeof Config>

function readCard(path: string, maxFileBytes: number, fallback: string): string {
  let fd: number
  try { fd = openSync(path, 'r') }
  catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return fallback
    throw error
  }
  try {
    const bytes = Buffer.alloc(maxFileBytes + 1)
    let count = 0
    while (count < bytes.length) {
      const read = readSync(fd, bytes, count, bytes.length - count, null)
      if (read === 0) break
      count += read
    }
    if (count > maxFileBytes) throw new Error('soul.md exceeds maxFileBytes')
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, count))
  } finally { closeSync(fd) }
}

/**
 * Maintain one global persona section; configuration edits and file saves affect later assemblies.
 * @param ctx - Context owning the prompt section and watcher.
 * @param config - Validated, live persona configuration.
 */
export function apply(ctx: Context, config: Config): void {
  const home = resolveDshHome(undefined, { DSH_HOME: ctx.launchEnvironment?.get('DSH_HOME')?.value })
  let section: (() => void) | undefined
  let stopWatch: (() => void) | undefined
  let closed = false
  const refresh = () => {
    if (closed) return
    const current = config.get()
    const file = isAbsolute(current.path) ? current.path : join(home, current.path)
    const text = readCard(file, current.maxFileBytes, current.fallback)
    section?.()
    section = undefined
    if (text) section = ctx.systemPrompt.section({
      name: SECTION_NAME, order: current.order, text, ...(current.complete ? { complete: true } : {}),
    })
  }
  const watch = () => {
    stopWatch?.()
    stopWatch = undefined
    const current = config.get()
    if (!current.watch) return
    const file = isAbsolute(current.path) ? current.path : join(home, current.path)
    let timer: ReturnType<typeof setTimeout> | undefined
    const changed = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        try { refresh() }
        catch (error) { ctx.logger.warn('soul.md reload failed; retaining the previous persona', error) }
      }, current.debounceMs)
      timer.unref()
    }
    // Polling retains the pathname across missing files and atomic-save renames.
    watchFile(file, { persistent: false, interval: current.debounceMs }, changed)
    stopWatch = () => { clearTimeout(timer); unwatchFile(file, changed) }
  }
  ctx.effect(() => {
    refresh()
    watch()
    return () => { closed = true; stopWatch?.(); section?.() }
  }, 'soul-md persona and file watcher')
  ctx.on('loader/volatile-update', () => { refresh(); watch() })
}
