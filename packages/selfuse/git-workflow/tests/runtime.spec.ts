/** Native tool execution against a disposable Git repository, never a live worktree. */
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import LocalSubprocessService from '@deepseek-ai/dsh-subprocess-local'
import LocalSandboxProvider from '@deepseek-ai/dsh-sandbox-local'
import SandboxPolicyService from '@deepseek-ai/dsh-sandbox-policy'
import SandboxBashExecutor from '@deepseek-ai/dsh-bash-sandbox'
const GitWorkflow = await vi.importActual<typeof import('../src/index.ts')>('../lib/index.js')

const execGit = promisify(execFile)

async function setup(root: string, mode: 'danger-full-access' | 'read-only') {
  const ctx = new Context()
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(SessionProjectionRegistry)
  await ctx.plugin(ToolRuntime)
  await ctx.plugin(LocalSubprocessService)
  await ctx.plugin(LocalSandboxProvider, {})
  await ctx.plugin(SandboxPolicyService, { mode, workspaceRoot: root })
  await ctx.plugin(SandboxBashExecutor, {})
  const row = await ctx.plugin(GitWorkflow, GitWorkflow.Config({}))
  return { ctx, row }
}

async function invoke(ctx: Context, name: string, args: unknown) {
  return ctx.tools.execute({ callId: ToolCallId(name), name, arguments: args, signal: new AbortController().signal })
}

it('uses native schemas for status, bounded history and complete branch names', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-git-native-'))
  let ctx: Context | undefined
  try {
    await execGit('git', ['init', '-b', 'feature-name'], { cwd: root })
    await execGit('git', ['config', 'user.name', 'DSH Test'], { cwd: root })
    await execGit('git', ['config', 'user.email', 'test@example.test'], { cwd: root })
    await execGit('git', ['commit', '--allow-empty', '-m', 'fixture first'], { cwd: root })
    await execGit('git', ['commit', '--allow-empty', '-m', 'fixture second'], { cwd: root })
    ctx = (await setup(root, 'danger-full-access')).ctx
    const status = await invoke(ctx, 'git_status', { workdir: root })
    expect(status.isError).toBe(false)
    expect(status.value).toMatchObject({ ok: true, state: { branch: 'feature-name', upstream: null } })
    const history = await invoke(ctx, 'git_log', { workdir: root, count: 1 })
    expect(history.isError).toBe(false)
    expect(history.value).toMatchObject({ ok: true, commits: [{ subject: 'fixture second' }] })
    expect(history.value).not.toHaveProperty('commits.1')
    const branches = await invoke(ctx, 'git_branch', { workdir: root })
    expect(branches.isError).toBe(false)
    expect(branches.value).toMatchObject({ ok: true, branches: [{ name: 'feature-name', current: true }] })
    const invalid = await invoke(ctx, 'git_log', { count: 'not a number' })
    expect(invalid.isError).toBe(true)
  } finally {
    await ctx?.fiber.dispose()
    await rm(root, { recursive: true, force: true })
  }
})

it('commits a quoted message and returns a structured diff without running embedded shell text', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-git-commit-'))
  let ctx: Context | undefined
  try {
    await execGit('git', ['init', '-b', 'main'], { cwd: root })
    await execGit('git', ['config', 'user.name', 'DSH Test'], { cwd: root })
    await execGit('git', ['config', 'user.email', 'test@example.test'], { cwd: root })
    await writeFile(join(root, 'note.txt'), 'first\n')
    const composition = await setup(root, 'danger-full-access')
    ctx = composition.ctx
    const message = "test: quote ' and $(touch injected)"
    const commit = await invoke(ctx, 'git_commit', { workdir: root, paths: ['note.txt'], message })
    expect(commit.isError).toBe(false)
    expect(commit.value).toMatchObject({ ok: true, message })
    expect((await execGit('git', ['log', '-1', '--format=%s'], { cwd: root })).stdout.trim()).toBe(message)
    await expect(readFile(join(root, 'injected'))).rejects.toMatchObject({ code: 'ENOENT' })
    await writeFile(join(root, 'note.txt'), 'first\nsecond\n')
    const diff = await invoke(ctx, 'git_diff', { workdir: root, stat: true })
    expect(diff.isError).toBe(false)
    expect(diff.value).toMatchObject({ ok: true, stat: { files: 1, insertions: 1, deletions: null } })
    const traversal = await invoke(ctx, 'git_commit', { workdir: root, paths: ['../escape'], message: 'reject' })
    expect(traversal.value).toMatchObject({ ok: false })
    await composition.row.dispose()
    const removed = await invoke(ctx, 'git_status', { workdir: root })
    expect(removed.isError).toBe(true)
  } finally {
    await ctx?.fiber.dispose()
    await rm(root, { recursive: true, force: true })
  }
})

it('does not stage files under a read-only native policy, including an unavailable confinement runner', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-git-deny-'))
  let ctx: Context | undefined
  try {
    await execGit('git', ['init', '-b', 'main'], { cwd: root })
    await writeFile(join(root, 'note.txt'), 'private test\n')
    ctx = (await setup(root, 'read-only')).ctx
    const result = await invoke(ctx, 'git_commit', { workdir: root, paths: ['note.txt'], message: 'must not stage' })
    expect(result.value).toMatchObject({ ok: false })
    expect((await execGit('git', ['diff', '--cached', '--name-only'], { cwd: root })).stdout).toBe('')
    expect(await readFile(join(root, 'note.txt'), 'utf8')).toBe('private test\n')
  } finally {
    await ctx?.fiber.dispose()
    await rm(root, { recursive: true, force: true })
  }
})
