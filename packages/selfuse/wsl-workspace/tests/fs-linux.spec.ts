import { afterEach, describe, expect, it, vi } from 'vitest'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import * as ToolFs from '@deepseek-ai/dsh-tool-fs'
import * as ToolStrReplaceEditor from '@deepseek-ai/dsh-tool-str-replace-editor'
import { WslFileSystem } from '../src/fs.ts'

const contexts: Context[] = []
const roots: string[] = []
let callNumber = 0

afterEach(async () => {
  for (const ctx of contexts.splice(0)) await ctx.fiber.dispose()
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true })
  vi.unstubAllEnvs()
})

async function setup(parent = tmpdir(), uncCwd = false): Promise<{ ctx: Context; root: string }> {
  vi.stubEnv('WSL_DISTRO_NAME', 'Ubuntu')
  const root = await mkdtemp(join(parent, 'dsh-wsl-fs-linux-'))
  roots.push(root)
  const ctx = new Context()
  contexts.push(ctx)
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  const cwd = uncCwd ? `\\\\wsl.localhost\\Ubuntu${root.replaceAll('/', '\\')}` : root
  await ctx.plugin(WslFileSystem, { cwd, distro: 'Ubuntu' })
  await ctx.plugin(ToolFs)
  await ctx.plugin(ToolStrReplaceEditor)
  return { ctx, root }
}

async function call(ctx: Context, name: string, args: unknown) {
  return ctx.tools.execute({
    signal: new AbortController().signal,
    callId: ToolCallId(`wsl-fs-linux-${++callNumber}`),
    name,
    arguments: args,
  })
}

describe.skipIf(process.platform !== 'linux')('WSL filesystem on a Linux host', () => {
  it('resolves Linux, UNC, and Windows-drive paths in the Linux execution world', async () => {
    const { ctx, root } = await setup()
    const linux = await ctx.fs.resolve(root)
    expect(linux.displayPath).toBe(root)
    expect(ctx.fs.processPath(linux)).toBe(root)

    const unc = `\\\\wsl.localhost\\Ubuntu${root.replaceAll('/', '\\')}`
    expect((await ctx.fs.resolve(unc)).displayPath).toBe(root)
    expect((await ctx.fs.resolve('F:\\LaTeX\\probe.txt')).displayPath).toBe('/mnt/f/LaTeX/probe.txt')
    expect((await ctx.fs.resolve('/mnt/f/LaTeX/probe.txt')).displayPath).toBe('/mnt/f/LaTeX/probe.txt')
    expect((await ctx.fs.resolve('probe.txt', { cwd: 'F:\\LaTeX' })).displayPath).toBe('/mnt/f/LaTeX/probe.txt')
    expect(ctx.fs.contains(linux, await ctx.fs.resolve(join(root, 'child.txt')))).toBe(true)
    expect(ctx.fs.fileUrl(linux)).toBe(new URL(`file://${root}`).href)
    await expect(ctx.fs.resolve(`\\\\wsl.localhost\\Other${root.replaceAll('/', '\\')}`))
      .rejects.toThrow('not the local WSL distribution')
  })

  it('serves read, write, edit, and str_replace_editor over the same Linux file', async () => {
    const { ctx, root } = await setup()
    const path = join(root, 'sample.txt')
    expect((await call(ctx, 'write', { file_path: path, content: 'alpha\n' })).isError).toBe(false)
    expect((await call(ctx, 'read', { file_path: path })).isError).toBe(false)
    expect((await call(ctx, 'edit', { file_path: path, old_string: 'alpha', new_string: 'beta' })).isError).toBe(false)
    expect((await call(ctx, 'str_replace_editor', { command: 'view', path })).isError).toBe(false)
    expect((await call(ctx, 'str_replace_editor', {
      command: 'str_replace', path, old_str: 'beta', new_str: 'gamma',
    })).isError).toBe(false)
    expect(await readFile(path, 'utf8')).toBe('gamma\n')
  })

  it('uses a session UNC cwd for relative file-tool paths', async () => {
    const { ctx, root } = await setup(tmpdir(), true)
    expect((await call(ctx, 'write', { file_path: 'relative.txt', content: 'inside\n' })).isError).toBe(false)
    expect((await call(ctx, 'read', { file_path: 'relative.txt' })).isError).toBe(false)
    expect(await readFile(join(root, 'relative.txt'), 'utf8')).toBe('inside\n')
  })

  it.skipIf(!existsSync('/mnt/f/tools'))('publishes a file on the real DrvFs mount', async () => {
    const { ctx, root } = await setup('/mnt/f/tools')
    const path = join(root, 'sample.txt')
    expect((await call(ctx, 'write', { file_path: path, content: 'alpha\n' })).isError).toBe(false)
    expect((await call(ctx, 'read', { file_path: path })).isError).toBe(false)
    expect((await call(ctx, 'edit', { file_path: path, old_string: 'alpha', new_string: 'beta' })).isError).toBe(false)
    expect((await call(ctx, 'str_replace_editor', { command: 'view', path })).isError).toBe(false)
    expect((await call(ctx, 'str_replace_editor', {
      command: 'str_replace', path, old_str: 'beta', new_str: 'gamma',
    })).isError).toBe(false)
    expect(await readFile(path, 'utf8')).toBe('gamma\n')
  })
})
