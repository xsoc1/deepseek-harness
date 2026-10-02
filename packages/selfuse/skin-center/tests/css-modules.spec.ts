/** Keep the specific CSS module declaration equal to Lightning CSS's real export table. */
import { readFile } from 'node:fs/promises'
import { transform } from 'lightningcss'
import { expect, it } from 'vitest'

it('declares exactly the emitted local classes, rejecting missing or invented keys', async () => {
  const code = await readFile(new URL('../src/client/skin-center.module.css', import.meta.url))
  const declaration = await readFile(new URL('../src/client/css-modules.d.ts', import.meta.url), 'utf8')
  const emitted = Object.keys(transform({ filename: 'skin-center.module.css', code, cssModules: true }).exports ?? {}).sort()
  const declared = [...declaration.matchAll(/readonly ([A-Za-z][A-Za-z0-9]*): string/g)].map(match => match[1]).sort()
  expect(emitted.length).toBeGreaterThan(0)
  expect(declared).toEqual(emitted)
  expect(declared.slice(1)).not.toEqual(emitted)
  expect([...declared, 'notAnExportedClass'].sort()).not.toEqual(emitted)
})
