/** Network configuration facts that contain no names, hosts, links, or credentials. */
export interface SafeNetworkFacts {
  bytes: number
  proxyEntries: number
  groupEntries: number
  protocolLinks: number
  subscriptionLinks: number
  hasTunSection: boolean
  hasDnsSection: boolean
}

function scanTexts(text: string): { texts: string[]; complete: boolean } {
  const candidates = [text]
  const fragments: string[] = []
  let complete = true
  try {
    const parsed: unknown = JSON.parse(text)
    const visit = (value: unknown, depth: number): void => {
      if (depth > 24) {
        complete = false
        return
      }
      if (typeof value === 'string') {
        candidates.push(value)
        fragments.push(value)
        if (/^[\s]*[\[{\"]/.test(value)) {
          try {
            const nested: unknown = JSON.parse(value)
            visit(nested, depth + 1)
          } catch {
            // A string that looks like JSON may still be ordinary tool text.
          }
        }
      } else if (Array.isArray(value)) {
        for (const item of value) visit(item, depth + 1)
      } else if (value !== null && typeof value === 'object') {
        for (const item of Object.values(value)) visit(item, depth + 1)
      }
    }
    visit(parsed, 0)
    candidates.push(fragments.join('\n'))
  } catch {
    // Tool text often contains prose around JSON; escaped lines are checked below.
  }
  return {
    complete,
    texts: candidates.map(candidate => candidate
      .replace(/\\r?\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/^[ \t]*(?:L)?\d{1,9}(?:[ \t]*[|:]|\t| +)([ \t]*)/gm, '$1')),
  }
}

function containsNetworkMaterial(text: string): boolean {
  const nodeType = /(?:^|\n)[ \t]*type:[ \t]*(?:socks5|vmess|vless|trojan|ss|ssr|hysteria|hysteria2|tuic)\b/im.test(text)
  const credentialField = /(?:^|\n)[ \t]*(?:username|password):/im.test(text)
  const serverField = /(?:^|\n)[ \t]*server:[ \t]*\S+/im.test(text)
  return /(?:^|\n)[ \t]*(?:proxies|proxy-groups):[ \t]*(?:\n|$)/im.test(text)
    || /\b(?:vmess|vless|trojan|ss|ssr|hysteria|hysteria2|tuic):\/\//i.test(text)
    || /\b(?:dm1lc3M|dmxlc3M|dHJvamFu|c3M6)[A-Za-z0-9+/=]{20,}\b/.test(text)
    || /https?:\/\/[^\s]*(?:subscribe|token=|subscription)[^\s]*/i.test(text)
    || serverField && (nodeType || credentialField)
}

/** Extract bounded, non-identifying facts from one locally retained result.
 * @param text result held on the local machine.
 * @returns counts and flags without names, endpoints, links, or credentials.
 */
export function summarizeRiskContent(text: string): SafeNetworkFacts {
  const candidates = scanTexts(text).texts
  const normalized = candidates.find(candidate => /(?:^|\n)[ \t]*proxies:[ \t]*\n/m.test(candidate))
    ?? candidates[0] ?? text
  const proxySection = normalized.match(/(?:^|\n)proxies:\s*\n((?:[ \t]+[^\n]*\n)*)/m)?.[1] ?? ''
  const groupSection = normalized.match(/(?:^|\n)proxy-groups:\s*\n((?:[ \t]+[^\n]*\n)*)/m)?.[1] ?? ''
  return {
    bytes: Buffer.byteLength(text, 'utf8'),
    proxyEntries: (proxySection.match(/^[ \t]*-[ \t]+name:/gm) ?? []).length,
    groupEntries: (groupSection.match(/^[ \t]*-[ \t]+name:/gm) ?? []).length,
    protocolLinks: (normalized.match(/\b(?:vmess|vless|trojan|ss|ssr|hysteria|hysteria2|tuic):\/\//gi) ?? []).length,
    subscriptionLinks: (normalized.match(/https?:\/\/[^\s]*(?:subscribe|token=|subscription)[^\s]*/gi) ?? []).length,
    hasTunSection: /(?:^|\n)tun:\s*\n/m.test(normalized),
    hasDnsSection: /(?:^|\n)dns:\s*\n/m.test(normalized),
  }
}

/** Conservative classifier; it does not claim to predict an upstream policy verdict.
 * @param text model-bound or tool-result text to inspect.
 * @returns true for recognized network material or an incomplete nested scan.
 */
export function hasSensitiveNetworkContent(text: string): boolean {
  if (!text) return false
  const scanned = scanTexts(text)
  return !scanned.complete || scanned.texts.some(containsNetworkMaterial)
}
