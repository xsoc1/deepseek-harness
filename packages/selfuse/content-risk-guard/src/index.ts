import type { Context } from 'cordis'
import z from 'schemastery'
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm'
import {
  deepRedactToolResults,
  isContentRiskError,
  sanitizeMessagesForRisk,
  sanitizeRiskContent,
} from './sanitizer.js'

export const name = '@dsh-selfuse/content-risk-guard'
export const inject = ['llm']

export interface Config {
  enabled?: boolean
  autoRetry?: boolean
  sanitizeToolResults?: boolean
}

export const Config: z<Config> = z.object({
  enabled: z.boolean().default(true).description('是否启用风控自动拦截与脱敏守卫'),
  autoRetry: z.boolean().default(true).description('遇到上游 Content Exists Risk 报错时是否自动脱敏重试'),
  sanitizeToolResults: z.boolean().default(true).description('工具执行完毕后是否立即对敏感节点/代理配置进行脱敏'),
})

interface LlmService {
  stream(options: GenerateOptions): AsyncIterable<StreamChunk>
}

interface GuardContext extends Context {
  llm: LlmService
}

export function apply(ctx: Context, config: Config = {}): void {
  const guardCtx = ctx as unknown as GuardContext
  const enabled = config.enabled ?? true
  const autoRetry = config.autoRetry ?? true
  const sanitizeToolResults = config.sanitizeToolResults ?? true

  if (!enabled) return

  // 1. Tool-level post-execution sanitization
  ctx.on('tools/post-execute', async (_exec, result, next) => {
    if (!sanitizeToolResults || !result.content || !Array.isArray(result.content)) {
      return next()
    }
    let modified = false
    const sanitizedContent = result.content.map((block) => {
      if (block.type === 'text' && typeof block.text === 'string') {
        const cleaned = sanitizeRiskContent(block.text)
        if (cleaned !== block.text) {
          modified = true
          return { ...block, text: cleaned }
        }
      }
      return block
    })
    if (modified) {
      return { kind: 'accept', content: sanitizedContent }
    }
    return next()
  })

  // 2. LLM stream interception and auto-recovery
  ctx.on('llm/stream', async function* (options: GenerateOptions, next) {
    const sanitizedMessages = sanitizeMessagesForRisk(options.messages)
    const effectiveOptions = sanitizedMessages === options.messages
      ? options
      : { ...options, messages: sanitizedMessages }

    let stream: AsyncIterable<StreamChunk>
    try {
      stream = next()
    } catch (error: unknown) {
      if (autoRetry && isContentRiskError(error)) {
        const redacted = deepRedactToolResults(effectiveOptions.messages)
        yield* guardCtx.llm.stream({ ...effectiveOptions, messages: redacted })
        return
      }
      throw error
    }

    try {
      for await (const chunk of stream) {
        if (
          autoRetry &&
          chunk.type === 'finish' &&
          chunk.reason.kind === 'error' &&
          isContentRiskError(chunk.reason.failure)
        ) {
          // Upstream returned Content Exists Risk finish error -> auto recover!
          const redacted = deepRedactToolResults(effectiveOptions.messages)
          yield* guardCtx.llm.stream({ ...effectiveOptions, messages: redacted })
          return
        }
        yield chunk
      }
    } catch (error: unknown) {
      if (autoRetry && isContentRiskError(error)) {
        const redacted = deepRedactToolResults(effectiveOptions.messages)
        yield* guardCtx.llm.stream({ ...effectiveOptions, messages: redacted })
        return
      }
      throw error
    }
  }, { prepend: true })
}
