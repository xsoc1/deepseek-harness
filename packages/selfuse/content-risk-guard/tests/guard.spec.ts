import { describe, expect, it } from 'vitest'
import {
  deepRedactToolResults,
  isContentRiskError,
  sanitizeMessagesForRisk,
  sanitizeRiskContent,
} from '../src/sanitizer.ts'
import type { ContentBlock, Message } from '@deepseek-ai/dsh-llm'

describe('@dsh-selfuse/content-risk-guard sanitizer', () => {
  it('sanitizes Clash proxies list block', () => {
    const yaml = `
mixed-port: 7890
proxies:
  - name: "HK-VIP-01"
    type: vmess
    server: hk.example.com
    port: 443
    uuid: 12345678-1234-1234-1234-123456789abc
    alterId: 0
  - name: "US-Node"
    type: ss
    server: us.example.com
    port: 8388
    cipher: aes-256-gcm
    password: secret
proxy-groups:
  - name: PROXY
    type: select
    proxies: ["HK-VIP-01"]
`
    const cleaned = sanitizeRiskContent(yaml)
    expect(cleaned).not.toContain('HK-VIP-01')
    expect(cleaned).not.toContain('us.example.com')
    expect(cleaned).toContain('[代理节点配置已由 DSH 本地安全脱敏，避免触发上游风控]')
    expect(cleaned).toContain('[策略组已脱敏]')
  })

  it('sanitizes proxy URIs (vmess, trojan, ss, etc.)', () => {
    const text = 'Check out these nodes: vmess://eyJhZGQiOiIxMjcuMC4wLjEifQ== and trojan://pwd@1.2.3.4:443#name and ss://YWVzLTI1Ni1nY206cGFzc3dvcmRAMTI3LjAuMC4xOjEyMzQ=!'
    const cleaned = sanitizeRiskContent(text)
    expect(cleaned).not.toContain('vmess://eyJhZGQiOiIxMjcuMC4wLjEifQ==')
    expect(cleaned).not.toContain('trojan://pwd@1.2.3.4:443#name')
    expect(cleaned).toContain('[vmess://节点配置已自动脱敏]')
    expect(cleaned).toContain('[trojan://节点配置已自动脱敏]')
    expect(cleaned).toContain('[ss://节点配置已自动脱敏]')
  })

  it('sanitizes subscription URLs', () => {
    const text = 'Download config from https://vpn.service.net/api/v1/client/subscribe?token=9876543210abcdef to start'
    const cleaned = sanitizeRiskContent(text)
    expect(cleaned).not.toContain('token=9876543210abcdef')
    expect(cleaned).toContain('[订阅链接已脱敏]')
  })

  it('preserves normal code and ordinary prose', () => {
    const normal = `
function calculateSum(a: number, b: number): number {
  return a + b;
}
console.log("Normal application running on http://localhost:3000");
`
    expect(sanitizeRiskContent(normal)).toBe(normal)
  })

  it('identifies Content Exists Risk errors', () => {
    expect(isContentRiskError('HTTP 400 Content Exists Risk: sensitive content')).toBe(true)
    expect(isContentRiskError(new Error('DeepSeek API error: Content Exists Risk'))).toBe(true)
    expect(isContentRiskError({ code: 'content_exists_risk', message: 'Rejected' })).toBe(true)
    expect(isContentRiskError({ cause: { message: 'HTTP 400: {"error":{"message":"Content Exists Risk"}}' } })).toBe(true)
    expect(isContentRiskError(new Error('Normal connection timeout'))).toBe(false)
  })

  it('sanitizes messages with tool-result containing proxy configs', () => {
    const messages: Message[] = [
      {
        role: 'user',
        content: [{ type: 'text', text: 'Please inspect the config' }],
      },
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            id: 'call_1',
            name: 'read_file',
            content: [
              {
                type: 'text',
                text: 'proxies:\n  - name: "node-1"\n    type: vmess\n    server: 1.1.1.1\n',
              },
            ],
          },
        ],
      },
    ]

    const sanitized = sanitizeMessagesForRisk(messages)
    const toolResult = sanitized[1]!.content[0] as Extract<ContentBlock, { type: 'tool-result' }>
    const textBlock = toolResult.content[0] as Extract<ContentBlock, { type: 'text' }>
    expect(textBlock.text).toContain('[代理节点配置已由 DSH 本地安全脱敏，避免触发上游风控]')
    expect(textBlock.text).not.toContain('node-1')
  })

  it('deeply redacts tool results for emergency retry', () => {
    const messages: Message[] = [
      {
        role: 'user',
        content: [{ type: 'text', text: 'Run the script' }],
      },
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            id: 'call_2',
            name: 'bash',
            content: [{ type: 'text', text: 'Sensitive output that was blocked' }],
          },
        ],
      },
    ]

    const redacted = deepRedactToolResults(messages)
    const toolBlock = redacted[1]!.content[0] as Extract<ContentBlock, { type: 'tool-result' }>
    const textBlock = toolBlock.content[0] as Extract<ContentBlock, { type: 'text' }>
    expect(textBlock.text).toContain('Content Exists Risk')
    expect(textBlock.text).not.toContain('Sensitive output')
  })
})
