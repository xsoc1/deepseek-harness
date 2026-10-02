import { runInNewContext } from 'node:vm'
import { expect, it } from 'vitest'
import { serializeBrowserChunk } from './browser-output.ts'

it('preserves multiline whitespace and tagged raw text while composing a source map', async () => {
  const source = 'globalThis.literal = `alpha  \n  \n中文\n`; globalThis.raw = String.raw`a\\nb`;'
  const { code, map } = await serializeBrowserChunk(source, 'native-client.js')
  const scope: { literal?: string; raw?: string } = {}
  runInNewContext(code, scope, { timeout: 1000 })
  expect(scope.literal).toBe('alpha  \n  \n中文\n')
  expect(scope.raw).toBe('a\\nb')
  expect(code).not.toMatch(/[\t ]+$/mu)
  expect(JSON.parse(map)).toMatchObject({ sources: ['native-client.js'], sourcesContent: [source] })
})
