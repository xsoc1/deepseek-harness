import type { IncomingMessage, ServerResponse } from 'node:http'
import { describe, expect, it } from 'vitest'
import { PairingService } from './pairing.ts'
import { makeRoutes, PAIR_PATHS } from './routes.ts'

const PAIRING_CONFIG = {
  tokenTtlMs: 600_000,
  offlineAfterMs: 25_000,
  maxDevices: 4,
  idleExpireMs: 604_800_000,
  cookieName: 'dsh_pair',
}

/** Minimal loopback POST request that exercises the real issue route handler. */
function issueRequest(payload: unknown): IncomingMessage {
  return {
    method: 'POST',
    headers: { host: '127.0.0.1:3080' },
    socket: { remoteAddress: '127.0.0.1' },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(JSON.stringify(payload))
    },
  } as unknown as IncomingMessage
}

/** Minimal response recorder for the route handler. */
function responseRecorder(): {
  response: ServerResponse
  read: () => { status: number | undefined; body: unknown; cookies: string[] }
} {
  let status: number | undefined
  let body = ''
  let cookies: string[] = []
  const response = {
    writeHead(nextStatus: number, headers?: { 'set-cookie'?: string[] }) {
      status = nextStatus
      cookies = headers?.['set-cookie'] ?? []
      return this
    },
    end(chunk?: string) {
      body = chunk ?? ''
      return this
    },
  } as unknown as ServerResponse
  return {
    response,
    read: () => ({ status, body: body === '' ? undefined : JSON.parse(body) as unknown, cookies }),
  }
}

describe('desktop-only pairing links', () => {
  it('issues the browser-auth pairing landing and preserves the workspace target', async () => {
    const service = new PairingService(PAIRING_CONFIG, {
      now: () => 1_000_000,
      randomToken: () => 'token-value',
    })
    service.setPublicBaseUrl('https://remote.example')
    const route = makeRoutes({ service, lanAddresses: [], browserAuthCookie: () => 'dsh_auth=test; Path=/; HttpOnly' })
      .find(candidate => candidate.kind === 'exact' && candidate.path === PAIR_PATHS.issue)
    if(route === undefined) throw new Error('pair issue route missing')
    const recorder = responseRecorder()

    await route.handler(issueRequest({ workspaceId: 'workspace-7' }), recorder.response)

    expect(recorder.read()).toEqual({
      status: 200,
      cookies: [],
      body: expect.objectContaining({
        ok: true,
        url: 'https://remote.example/pair?pair=token-value&workspace=workspace-7',
      }),
    })
  })

  it('issues both pairing and official browser cookies only for a valid token', async () => {
    const service = new PairingService(PAIRING_CONFIG, {
      now: () => 1_000_000,
      randomToken: () => 'token-value',
    })
    service.setPublicBaseUrl('https://remote.example')
    service.issue()
    const route = makeRoutes({
      service,
      lanAddresses: [],
      browserAuthCookie: () => 'dsh_browser=test; Path=/; HttpOnly',
    }).find(candidate => candidate.kind === 'exact' && candidate.path === PAIR_PATHS.accept)
    if(route === undefined) throw new Error('pair accept route missing')
    const request = issueRequest({ token: 'token-value' })
    request.headers.host = 'remote.example'
    const recorder = responseRecorder()
    await route.handler(request, recorder.response)
    expect(recorder.read()).toMatchObject({
      status: 200,
      cookies: [expect.stringContaining('dsh_pair='), 'dsh_browser=test; Path=/; HttpOnly'],
    })
  })
})
