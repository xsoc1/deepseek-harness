import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { homedir } from 'node:os'
import { isAbsolute, join } from 'node:path'
import type { ContentBlock, StreamChunk } from '@deepseek-ai/dsh-llm'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { PostToolDecision } from '@deepseek-ai/dsh-tools'
import { LocalResultStore } from './local-result-store.js'
import { hasSensitiveNetworkContent, summarizeRiskContent } from './sanitizer.js'
import { LocalNetworkProfileExecutor, type LocalNetworkProfile, type NetworkProfileChange } from './local-network-profile.js'

export const name = '@dsh-selfuse/content-risk-guard'
export const inject = ['tools']

export interface Config {
  enabled?: boolean
  privateRoot?: string
  retentionHours?: number
  maxStoredBytes?: number
  profiles?: LocalNetworkProfile[]
}

export const Config: z<Config> = z.object({
  enabled: z.boolean().default(true).description('是否启用本地敏感结果隔离'),
  privateRoot: z.string().default('').description('敏感工具结果的本地私有绝对路径；留空使用 DSH_HOME'),
  retentionHours: z.number().default(24).description('本地结果最长保留小时数'),
  maxStoredBytes: z.number().default(5_000_000).description('单条本地结果记录最大 UTF-8 字节数'),
  profiles: z.array(z.object({
    id: z.string().required(),
    path: z.string().required(),
  })).default([]).description('允许本地检查和受审批修改的网络 YAML 文件；只向模型显示 id'),
})

export function apply(ctx: Context, config: Config = {}): void {
  if (config.enabled === false) return
  const retentionHours = config.retentionHours ?? 24
  const maxStoredBytes = config.maxStoredBytes ?? 5_000_000
  if (!Number.isInteger(retentionHours) || retentionHours <= 0
    || !Number.isInteger(maxStoredBytes) || maxStoredBytes <= 0) {
    throw new Error('content-risk-guard: retentionHours and maxStoredBytes must be positive integers')
  }
  const dshHome = process.env.DSH_HOME ?? join(homedir(), '.dsh')
  const privateRoot = config.privateRoot || join(dshHome, 'private-content-risk')
  if (!isAbsolute(privateRoot)) throw new Error('content-risk-guard: privateRoot must be absolute')
  const store = new LocalResultStore(privateRoot, retentionHours * 60 * 60 * 1000, maxStoredBytes)
  const profiles = new LocalNetworkProfileExecutor(config.profiles ?? [], privateRoot, maxStoredBytes)

  ctx.on('llm/stream', (options, next): AsyncIterable<StreamChunk> => {
    let safe = false
    try {
      const outbound = JSON.stringify({ messages: options.messages, system: options.system, tools: options.tools })
      safe = !hasSensitiveNetworkContent(outbound)
    } catch {
      // An uninspectable request must not reach the adapter.
    }
    if (safe) return next()
    return (async function* (): AsyncIterable<StreamChunk> {
      await Promise.resolve()
      yield {
        type: 'finish',
        reason: { kind: 'error', failure: {
          code: 'LOCAL_PRIVATE_CONTENT_BLOCKED',
          message: 'Local privacy check stopped this model request. Start a new session if earlier turns contain a network profile; keep private configuration in local tools.',
        } },
      }
    })()
  }, { global: true, prepend: true })

  async function isolate(content: readonly ContentBlock[], sessionId: string, callId: string, force = false): Promise<{
    changed: boolean
    content: ContentBlock[]
  }> {
    let changed = false
    const mapped: ContentBlock[] = []
    for (const block of content) {
      if (block.type !== 'text' || !force && !hasSensitiveNetworkContent(block.text)) {
        mapped.push(block)
        continue
      }
      const handle = await store.save(sessionId, callId, block.text)
      changed = true
      mapped.push({
        type: 'text',
        text: `local-result:${handle} — network configuration held on this machine. Use inspect_local_network_result for safe facts.`,
      })
    }
    return { changed, content: changed ? mapped : [...content] }
  }

  ctx.on('tools/post-execute', async (exec, result, next): Promise<PostToolDecision> => {
    const decision = await next()
    if (decision.kind !== 'accept') return decision
    const profileRead = profiles.referencesConfiguredPath(exec.arguments)
    try {
      if (hasSensitiveNetworkContent(JSON.stringify([
        ...(result.additionalContexts ?? []), ...(decision.additionalContexts ?? []),
      ]))) {
        return { kind: 'block', feedback: [{ type: 'text', text: 'Sensitive deferred context was not sent to the model.' }] }
      }
    } catch {
      return { kind: 'block', feedback: [{ type: 'text', text: 'Uninspectable deferred context was not sent to the model.' }] }
    }
    if (Object.hasOwn(decision, 'value')) {
      let sensitive = profileRead
      try {
        sensitive ||= hasSensitiveNetworkContent(JSON.stringify(decision.value))
      } catch {
        sensitive = true
      }
      return sensitive
        ? { kind: 'block', feedback: [{ type: 'text', text: 'Sensitive structured result was not sent to the model.' }] }
        : decision
    }
    const content = decision.content ?? result.content
    if (!content.some(block => block.type === 'text' && (profileRead || hasSensitiveNetworkContent(block.text)))) return decision
    const sessionId = exec.agent?.session.header.id
    if (sessionId === undefined) {
      return { kind: 'block', feedback: [{ type: 'text', text: 'Sensitive result has no owning session; raw content was not sent.' }] }
    }
    try {
      const isolated = await isolate(content, sessionId, exec.callId, profileRead)
      return { kind: 'accept', content: isolated.content,
        ...decision.additionalContexts ? { additionalContexts: decision.additionalContexts } : {} }
    } catch {
      return { kind: 'block', feedback: [{ type: 'text', text: 'Sensitive result could not be stored locally; raw content was not sent.' }] }
    }
  })

  ctx.on('tools/ptc-dispatch-log', async (dispatch, next): Promise<ContentBlock[]> => {
    try {
      const content = await next()
      if (!content.some(block => block.type === 'text' && hasSensitiveNetworkContent(block.text))) return content
      const sessionId = dispatch.agent?.session.header.id
      if (sessionId === undefined) {
        return [{ type: 'text', text: 'Sensitive sub-call result omitted: no owning session.' }]
      }
      return (await isolate(content, sessionId, dispatch.subCallId)).content
    } catch {
      return [{ type: 'text', text: 'Sub-call result omitted: log shaping or local storage failed.' }]
    }
  })

  ctx.effect(() => ctx.tools.register(defineTool({
    name: 'inspect_local_network_result',
    description: 'Inspect safe counts and flags for a locally held network result by opaque handle. Raw hosts, nodes, and credentials are never returned.',
    parameters: { handle: { type: 'string', required: true } },
    output: {
      schema: {
        type: 'object', additionalProperties: false,
        properties: {
          bytes: { type: 'integer', required: true },
          proxyEntries: { type: 'integer', required: true },
          groupEntries: { type: 'integer', required: true },
          protocolLinks: { type: 'integer', required: true },
          subscriptionLinks: { type: 'integer', required: true },
          hasTunSection: { type: 'boolean', required: true },
          hasDnsSection: { type: 'boolean', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
    },
    async execute(args, exec) {
      const sessionId = exec.agent?.session.header.id
      if (sessionId === undefined) throw new Error('local result requires an owning session')
      return summarizeRiskContent(await store.load(sessionId, args.handle))
    },
  })), 'content-risk-guard: inspect local result')

  if (profiles.list().length === 0) return

  ctx.on('tools/pre-execute', async (exec, next) => {
    const decision = await next()
    if (decision.kind !== 'allow') return decision
    if (exec.name === 'change_local_network_profile' || exec.name === 'restore_local_network_profile') {
      return { kind: 'ask', reason: 'This changes a local network profile after creating a private backup. Review the requested operation before allowing it.' }
    }
    return decision
  })

  const profileOutcome = {
    type: 'object' as const, additionalProperties: false,
    properties: {
      changed: { type: 'boolean' as const, required: true },
      sha256: { type: 'string' as const, required: true },
      backupHandle: { type: 'string' as const },
      facts: {
        type: 'object' as const, additionalProperties: false, required: true,
        properties: {
          bytes: { type: 'integer' as const, required: true },
          proxyEntries: { type: 'integer' as const, required: true },
          groupEntries: { type: 'integer' as const, required: true },
          protocolLinks: { type: 'integer' as const, required: true },
          subscriptionLinks: { type: 'integer' as const, required: true },
          hasTunSection: { type: 'boolean' as const, required: true },
          hasDnsSection: { type: 'boolean' as const, required: true },
        },
      },
    },
  } as const

  ctx.effect(() => ctx.tools.register(defineTool({
    name: 'list_local_network_profiles',
    description: 'List configured local network profile aliases without exposing paths or contents.',
    parameters: {},
    output: {
      schema: { type: 'object', additionalProperties: false,
        properties: { ids: { type: 'array', required: true, items: { type: 'string' } } } },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
    },
    execute() { return Promise.resolve({ ids: profiles.list() }) },
  })), 'content-risk-guard: list local profiles')

  ctx.effect(() => ctx.tools.register(defineTool({
    name: 'inspect_local_network_profile',
    description: 'Inspect safe counts, flags, and hash of an allowlisted local network YAML profile. No raw content or path is returned.',
    parameters: { profileId: { type: 'string', required: true } },
    output: { schema: profileOutcome,
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
    async execute(args) {
      try { return await profiles.inspect(args.profileId) }
      catch { throw new Error('Local network profile inspection failed; no profile content was returned.') }
    },
  })), 'content-risk-guard: inspect local profile')

  ctx.effect(() => ctx.tools.register(defineTool({
    name: 'change_local_network_profile',
    description: 'With human approval, set only tun.enable, dns.enable, or mode in an allowlisted local YAML profile; back up the original privately. Do not supply secrets.',
    parameters: {
      profileId: { type: 'string', required: true },
      operation: { type: 'string', required: true, enum: ['set-tun-enabled', 'set-dns-enabled', 'set-mode'] },
      enabled: { type: 'boolean' },
      mode: { type: 'string', enum: ['rule', 'global', 'direct'] },
    },
    output: { schema: profileOutcome,
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
    async execute(args) {
      let change: NetworkProfileChange
      if (args.operation === 'set-mode') {
        if (args.mode !== 'rule' && args.mode !== 'global' && args.mode !== 'direct') {
          throw new Error('A supported mode is required.')
        }
        change = { operation: 'set-mode', mode: args.mode }
      } else {
        if (typeof args.enabled !== 'boolean') throw new Error('An enabled boolean is required.')
        change = { operation: args.operation, enabled: args.enabled }
      }
      try { return await profiles.apply(args.profileId, change) }
      catch { throw new Error('Local network profile change failed; no profile content was returned.') }
    },
  })), 'content-risk-guard: change local profile')

  ctx.effect(() => ctx.tools.register(defineTool({
    name: 'restore_local_network_profile',
    description: 'With human approval, restore a private backup to its originating allowlisted profile; the current file is backed up first.',
    parameters: {
      profileId: { type: 'string', required: true },
      backupHandle: { type: 'string', required: true },
    },
    output: { schema: profileOutcome,
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
    async execute(args) {
      try { return await profiles.restore(args.profileId, args.backupHandle) }
      catch { throw new Error('Local network profile restore failed; no profile content was returned.') }
    },
  })), 'content-risk-guard: restore local profile')
}
