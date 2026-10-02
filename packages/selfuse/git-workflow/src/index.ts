/** Structured Git tools using native argument validation and the session shell policy. */
import { isAbsolute, resolve } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { defineTool, type ToolDefinition, type ToolExecutionInput } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-shell'
import type {} from '@deepseek-ai/dsh-sandbox-policy'
import {
  clampLogCount, clampMaxLines, parseBranches, parseDiffStat, parseLog, parsePorcelainStatus,
  renderFailure, renderStatus, truncateLines, validateCommitMessage, validatePaths,
} from './git.ts'

/** Stable profile row name. */
export const name = 'git-workflow'
/** The tools registry is required; missing shell confinement fails individual calls closed. */
export const inject = ['tools']

/** Deployment limits for foreground Git calls. */
export interface Config {
  /** Read operation deadline in milliseconds. */
  timeoutMs: number
  /** Commit operation deadline in milliseconds. */
  commitTimeoutMs: number
  /** Maximum captured stdout bytes per command. */
  stdoutMaxBytes: number
}
/** Positive numeric limits applied by the native shell resolver. */
export const Config = z.object({
  timeoutMs: z.number().min(1).default(30_000),
  commitTimeoutMs: z.number().min(1).default(60_000),
  stdoutMaxBytes: z.number().min(1).default(8 * 1024 * 1024),
})

interface GitRunResult {
  ok: boolean
  exitCode: number | null
  stdout: string
  stderr: string
  message: string
}
type Caller = Pick<ToolExecutionInput, 'agent' | 'signal'>

function resolveWorkdir(workdir: string | undefined, exec: Caller): string {
  const cwd = exec.agent?.session.header.cwd ?? process.cwd()
  return workdir === undefined ? cwd : isAbsolute(workdir) ? workdir : resolve(cwd, workdir)
}

function shellQuote(value: string): string {
  return process.platform === 'win32'
    ? `'${value.replaceAll("'", "''")}'`
    : `'${value.replaceAll("'", "'\\''")}'`
}

/**
 * Execute Git through the current native shell and resolved session policy.
 * @param ctx - tool owner containing the shell and sandbox policy services.
 * @param exec - owning agent and caller cancellation.
 * @param args - argument words; each is quoted independently for the host shell.
 * @param workdir - absolute repository directory in the execution world.
 * @param options - optional execution limits; omitted values use the plugin defaults.
 * @returns Captured stdout or a failure, including sandbox denial on exit zero.
 */
export async function runGitTool(
  ctx: Context, exec: Caller, args: string[], workdir: string, options: Partial<Config> = {},
): Promise<GitRunResult> {
  try {
    const limits = Config(options)
    const shell = ctx.get('shell')
    const policy = ctx.get('sandboxPolicy')
    if (shell?.sandboxMode === undefined || policy === undefined) {
      return { ok: false, exitCode: null, stdout: '', stderr: '', message: 'Git tool requires the DSH shell and sandbox policy' }
    }
    const sandboxPolicy = policy.resolve(exec.agent === undefined ? {} : { session: exec.agent.session })
    const request = shell.resolve({
      command: `git ${args.map(shellQuote).join(' ')}`,
      workdir, signal: exec.signal, sandboxPolicy,
      timeoutMs: limits.timeoutMs,
      stdoutMaxBytes: limits.stdoutMaxBytes,
    })
    const result = await (await shell.execute(request)).result()
    const denied = result.sandbox?.denied === true || result.sandbox?.runnerFailed === true
    const ok = result.exitCode === 0 && !result.timedOut && !result.aborted && !denied
    return {
      ok, exitCode: result.exitCode, stdout: result.stdout.text, stderr: result.stderr.text,
      message: ok ? '' : denied ? `Git command denied by ${result.sandbox?.mode ?? 'sandbox'} policy`
        : result.aborted ? 'Git command cancelled'
          : result.timedOut ? 'Git command timed out'
            : result.stderr.text.trim() || result.stdout.text.trim() || `git exited ${String(result.exitCode)}`,
    }
  } catch (error) {
    return { ok: false, exitCode: null, stdout: '', stderr: '', message: error instanceof Error ? error.message : String(error) }
  }
}

const workdir = { type: 'string', description: 'Repository directory; relative paths resolve against the session cwd.' } as const
const paths = { type: 'array', items: { type: 'string' }, description: 'Repository-relative paths; traversal and absolute paths are rejected.' } as const
const nullableNumber = { oneOf: [{ type: 'number' }, { type: 'null' }] } as const
const nullableString = { oneOf: [{ type: 'string' }, { type: 'null' }] } as const
const failureFields = {
  ok: { type: 'boolean', required: true }, exitCode: nullableNumber, message: { type: 'string' },
} as const
const entry = { type: 'object', additionalProperties: false, properties: {
  path: { type: 'string', required: true }, from: { type: 'string' },
} } as const
const changeEntry = { ...entry, properties: { ...entry.properties, status: { type: 'string', required: true } } } as const

function failure(result: GitRunResult): { ok: boolean; exitCode: number | null; message: string } {
  return { ok: false, exitCode: result.exitCode, message: result.message }
}

/**
 * Register five native validated tools; Cordis disposes each registration with this row.
 * @param ctx - context carrying the native tool registry.
 * @param config - execution limits validated by the row schema.
 */
export function apply(ctx: Context, config: Config): void {
  const run = (exec: Caller, args: string[], cwd: string, commit = false) => runGitTool(
    ctx, exec, args, cwd, { stdoutMaxBytes: config.stdoutMaxBytes, timeoutMs: commit ? config.commitTimeoutMs : config.timeoutMs },
  )
  const definitions: ToolDefinition[] = [
    defineTool({
      name: 'git_status', description: 'Inspect branch, upstream and staged, unstaged, untracked and conflicted paths.',
      parameters: { workdir }, timeoutMs: config.timeoutMs,
      output: {
        schema: { type: 'object', additionalProperties: false, properties: {
          ...failureFields,
          state: { type: 'object', additionalProperties: false, properties: {
            branch: { ...nullableString, required: true }, upstream: { ...nullableString, required: true },
            ahead: { type: 'number', required: true }, behind: { type: 'number', required: true },
            staged: { type: 'array', items: changeEntry, required: true },
            unstaged: { type: 'array', items: changeEntry, required: true },
            untracked: { type: 'array', items: entry, required: true },
            conflicts: { type: 'array', items: entry, required: true },
          } },
        } },
        render: (_args, value) => [{ type: 'text', text: value.state === undefined
          ? renderFailure(value, 'git_status') : renderStatus(value.state) }],
      },
      async execute(args, exec) {
        const result = await run(exec, ['status', '--porcelain', '-b'], resolveWorkdir(args.workdir, exec))
        return result.ok ? { ok: true, state: parsePorcelainStatus(result.stdout) } : failure(result)
      },
    }),
    defineTool({
      name: 'git_diff', description: 'Show unstaged or staged Git diff; supports stat, path and line limits.',
      parameters: { workdir, paths, staged: { type: 'boolean' }, stat: { type: 'boolean' }, maxLines: { type: 'number' } },
      timeoutMs: config.timeoutMs,
      output: {
        schema: { type: 'object', additionalProperties: false, properties: {
          ...failureFields, output: { type: 'string' }, truncated: { type: 'boolean' },
          stat: { type: 'object', additionalProperties: false, properties: {
            files: { ...nullableNumber, required: true }, insertions: { ...nullableNumber, required: true },
            deletions: { ...nullableNumber, required: true },
          } },
        } },
        render: (_args, value) => [{ type: 'text', text: value.output ?? renderFailure(value, 'git_diff') }],
      },
      async execute(args, exec) {
        const error = validatePaths(args.paths)
        if (error !== null) return { ok: false, exitCode: null, message: error }
        const argv = ['diff', '--no-color']
        if (args.staged === true) argv.push('--cached')
        if (args.stat === true) argv.push('--stat')
        if (args.paths !== undefined) argv.push('--', ...args.paths)
        const result = await run(exec, argv, resolveWorkdir(args.workdir, exec))
        if (!result.ok) return failure(result)
        const truncated = truncateLines(result.stdout, clampMaxLines(args.maxLines))
        return { ok: true, output: truncated.text, truncated: truncated.truncated,
          ...args.stat === true ? { stat: parseDiffStat(result.stdout) } : {} }
      },
    }),
    defineTool({
      name: 'git_log', description: 'List recent abbreviated commits with optional changed-file names.',
      parameters: { workdir, paths, count: { type: 'number' }, files: { type: 'boolean' } }, timeoutMs: config.timeoutMs,
      output: {
        schema: { type: 'object', additionalProperties: false, properties: {
          ...failureFields, commits: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
            hash: { type: 'string', required: true }, date: { type: 'string', required: true },
            subject: { type: 'string', required: true }, files: { type: 'array', items: { type: 'string' } },
          } } },
        } },
        render: (_args, value) => [{ type: 'text', text: value.commits === undefined ? renderFailure(value, 'git_log')
          : value.commits.map(c => `${c.hash}  ${c.date}  ${c.subject}${c.files === undefined ? '' : c.files.map(f => `\n      ${f}`).join('')}`).join('\n') }],
      },
      async execute(args, exec) {
        const error = validatePaths(args.paths)
        if (error !== null) return { ok: false, exitCode: null, message: error }
        const argv = ['log', '-n', String(clampLogCount(args.count)), '--date=short', '--pretty=tformat:%h%x09%ad%x09%s']
        if (args.files === true) argv.push('--name-status')
        if (args.paths !== undefined) argv.push('--', ...args.paths)
        const result = await run(exec, argv, resolveWorkdir(args.workdir, exec))
        return result.ok ? { ok: true, commits: parseLog(result.stdout, args.files === true) } : failure(result)
      },
    }),
    defineTool({
      name: 'git_commit', description: 'Validate a message, optionally stage selected paths, then commit. No push or pull.',
      parameters: { workdir, paths, message: { type: 'string', required: true }, allowEmpty: { type: 'boolean' } },
      timeoutMs: config.commitTimeoutMs,
      output: {
        schema: { type: 'object', additionalProperties: false, properties: { ...failureFields, shortHash: { type: 'string' } } },
        render: (_args, value) => [{ type: 'text', text: value.shortHash === undefined ? renderFailure(value, 'git_commit')
          : `committed ${value.shortHash}: ${value.message ?? ''}` }],
      },
      async execute(args, exec) {
        const error = validateCommitMessage(args.message) ?? validatePaths(args.paths)
        if (error !== null) return { ok: false, exitCode: null, message: error }
        const cwd = resolveWorkdir(args.workdir, exec)
        if (args.paths !== undefined) {
          const add = await run(exec, ['add', '--', ...args.paths], cwd, true)
          if (!add.ok) return { ...failure(add), message: `git add failed: ${add.message}` }
        }
        const argv = ['commit', '-m', args.message]
        if (args.allowEmpty === true) argv.push('--allow-empty')
        const result = await run(exec, argv, cwd, true)
        if (!result.ok) return failure(result)
        const hash = await run(exec, ['rev-parse', '--short', 'HEAD'], cwd)
        return { ok: true, shortHash: hash.ok ? hash.stdout.trim() : '?', message: args.message }
      },
    }),
    defineTool({
      name: 'git_branch', description: 'List local branches and mark the current branch.',
      parameters: { workdir }, timeoutMs: config.timeoutMs,
      output: {
        schema: { type: 'object', additionalProperties: false, properties: {
          ...failureFields, branches: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
            current: { type: 'boolean', required: true }, name: { type: 'string', required: true },
          } } },
        } },
        render: (_args, value) => [{ type: 'text', text: value.branches === undefined ? renderFailure(value, 'git_branch')
          : value.branches.map(b => `${b.current ? '*' : ' '} ${b.name}`).join('\n') }],
      },
      async execute(args, exec) {
        const result = await run(exec, ['branch', '--format=%(HEAD) %(refname:short)'], resolveWorkdir(args.workdir, exec))
        return result.ok ? { ok: true, branches: parseBranches(result.stdout).branches } : failure(result)
      },
    }),
  ]
  for (const definition of definitions) ctx.effect(() => ctx.tools.register(definition), `git-workflow: ${definition.name}`)
}
