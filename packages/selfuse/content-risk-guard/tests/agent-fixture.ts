/** Real agent/session composition for privacy and approval boundary tests. */
import type { Context } from '@deepseek-ai/cordis'
import AgentRegistry, { type Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import LlmRuntime from '@deepseek-ai/dsh-llm'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'

/**
 * Create an idle real agent without contacting an external model provider.
 * @param ctx - owner, already composed with system-prompt and tools.
 * @param id - isolated test-session identity.
 * @returns the published agent; disposing the owner releases its session and scope.
 */
export async function createPrivacyTestAgent(ctx: Context, id: string): Promise<Agent> {
  if (!ctx.get('llm')) await ctx.plugin(LlmRuntime)
  if (!ctx.get('sessions')) await ctx.plugin(SessionStore)
  if (!ctx.get('sessionProjections')) await ctx.plugin(SessionProjectionRegistry)
  if (!ctx.get('agents')) await ctx.plugin(AgentRegistry)
  if (!ctx.get('agentLoop')) await ctx.plugin(AgentLoop, { agents: [] })
  return ctx.agentLoop.create(SessionId(id), { provider: 'risk-fixture', model: 'fixture' })
}
