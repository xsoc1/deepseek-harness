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
  read: () => { status: number | undefined; body: unknown }
} {
  let status: number | undefined
  let body = ''
  const response = {
    writeHead(nextStatus: number) {
      status = nextStatus
      return this
    },
    end(chunk?: string) {
      body = chunk ?? ''
      return this
    },
  } as unknown as ServerResponse
  return {
    response,
    read: () => ({ status, body: body === '' ? undefined : JSON.parse(body) as unknown }),
  }
}

describe('desktop-only pairing links', () => {
  it('issues the full Web UI root and preserves the workspace target', async () => {
    const service = new PairingService(PAIRING_CONFIG, {
      now: () => 1_000_000,
      randomToken: () => 'token-value',
    })
    service.setPublicBaseUrl('https://remote.example')
    const route = makeRoutes({ service, lanAddresses: [] })
      .find(candidate => candidate.kind === 'exact' && candidate.path === PAIR_PATHS.issue)
    if(route === undefined) throw new Error('pair issue route missing')
    const recorder = responseRecorder()

    await route.handler(issueRequest({ workspaceId: 'workspace-7' }), recorder.response)

    expect(recorder.read()).toEqual({
      status: 200,
      body: expect.objectContaining({
        ok: true,
        url: 'https://remote.example/?pair=token-value&workspace=workspace-7',
      }),
    })
  })
})
