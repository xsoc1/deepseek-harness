/**
 * Sanitize text that may trigger upstream content safety WAF
 * (e.g. DeepSeek official API's "Content Exists Risk" caused by proxy configs or subscriptions).
 */
export function sanitizeRiskContent(text) {
  if (!text || typeof text !== 'string') return text

  let sanitized = text

  // 1. Clash / Mihomo proxies list block
  sanitized = sanitized.replace(
    /(^|\n)([ \t]*proxies:\s*\n)(?:[ \t]*-[ \t]+[^\n]*\n(?:[ \t]+[^\n]*\n|\n)*)+/g,
    '$1$2  - name: "[代理节点配置已由 DSH 本地安全脱敏，避免触发上游风控]"\n    type: direct\n',
  )

  // 2. proxy-groups list block
  sanitized = sanitized.replace(
    /(^|\n)([ \t]*proxy-groups:\s*\n)(?:[ \t]*-[ \t]+[^\n]*\n(?:[ \t]+[^\n]*\n|\n)*)+/g,
    '$1$2  - name: "[策略组已脱敏]"\n    type: select\n    proxies: ["[代理节点已脱敏]"]\n',
  )

  // 3. Proxy protocol URIs (vmess, vless, trojan, ss, ssr, hysteria, tuic)
  sanitized = sanitized.replace(
    /\b(vmess|vless|trojan|ss|ssr|hysteria|hysteria2|tuic):\/\/[a-z0-9_.~:/?#[\]@!$&'()*+,;=-]+/gi,
    '[$1://节点配置已自动脱敏]',
  )

  // 4. Base64 subscription blobs (e.g. vmess:// base64 starting with dm1lc3M)
  sanitized = sanitized.replace(
    /\b(dm1lc3M|dmxlc3M|dHJvamFu|c3M6)[A-Za-z0-9+/=]{20,}\b/g,
    '[Base64订阅数据已脱敏]',
  )

  // 5. Subscription URLs
  sanitized = sanitized.replace(
    /https?:\/\/[^\s/$.?#].[^\s]*(?:subscribe|token=|subscription)[^\s]*/gi,
    '[订阅链接已脱敏]',
  )

  return sanitized
}

/**
 * Determine if an error or error response string represents an upstream "Content Exists Risk" rejection.
 */
export function isContentRiskError(error) {
  if (!error) return false

  if (typeof error === 'string') {
    return error.includes('Content Exists Risk') || error.includes('content_exists_risk')
  }

  if (typeof error === 'object') {
    const err = error
    const candidates = [
      err.message,
      err.detail,
      err.code,
      err.rawResponse,
      err.statusText,
      err.cause instanceof Error ? err.cause.message : String(err.cause ?? ''),
    ]
    for (const c of candidates) {
      if (typeof c === 'string' && (c.includes('Content Exists Risk') || c.includes('content_exists_risk'))) {
        return true
      }
    }
    if ('cause' in err && err.cause) {
      return isContentRiskError(err.cause)
    }
  }

  return false
}

function sanitizeContentBlocks(blocks) {
  let changed = false
  const mapped = []

  for (const block of blocks) {
    if (block.type === 'text') {
      const sanitized = sanitizeRiskContent(block.text)
      if (sanitized !== block.text) {
        changed = true
        mapped.push({ ...block, text: sanitized })
      } else {
        mapped.push(block)
      }
    } else if (block.type === 'tool-result') {
      const inner = sanitizeContentBlocks(block.content)
      if (inner.changed) {
        changed = true
        mapped.push({ ...block, content: inner.blocks })
      } else {
        mapped.push(block)
      }
    } else {
      mapped.push(block)
    }
  }

  return { changed, blocks: changed ? mapped : blocks }
}

/**
 * Sanitize all tool results and text messages in the conversation history.
 */
export function sanitizeMessagesForRisk(messages) {
  let anyChanged = false
  const result = []

  for (const message of messages) {
    const { changed, blocks } = sanitizeContentBlocks(message.content)
    if (changed) {
      anyChanged = true
      result.push({ ...message, content: blocks })
    } else {
      result.push(message)
    }
  }

  return anyChanged ? result : messages
}

function redactBlocks(blocks) {
  return blocks.map(block => {
    if (block.type === 'tool-result') {
      return {
        ...block,
        content: [
          {
            type: 'text',
            text: '[该工具输出因触发上游内容审查 (Content Exists Risk) 已由安全机制自动截断脱敏]',
          },
        ],
      }
    }
    return block
  })
}

/**
 * Deeply redact all historical tool results in messages to guarantee the retry avoids Content Exists Risk.
 */
export function deepRedactToolResults(messages) {
  return messages.map(message => ({
    ...message,
    content: redactBlocks(message.content),
  }))
}