import { describe, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { checkClientPackage, resolveClientImport } from './verify-client-domain-graph.ts'

function violations(file: string, source: string, extra: Record<string, string> = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'client-domain-'))
  try {
    for (const [name, text] of Object.entries({ [file]: source, ...extra })) {
      const path = join(dir, name)
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, text)
    }
    return checkClientPackage('fixture', dir)
  } finally { rmSync(dir, { force: true, recursive: true }) }
}

describe('client domain import resolution', () => {
  it('preserves imports that leave src/client from a top-level file', () => {
    expect(resolveClientImport('styles.ts', '../styles/base.css?inline'))
      .toBe('../styles/base.css?inline')
  })

  it('normalizes imports between domains inside src/client', () => {
    expect(resolveClientImport('input/hub.ts', '../queue/store.ts'))
      .toBe('queue/store.ts')
  })
})

describe('client domain ownership', () => {
  it.each(['png', 'svg'])('admits existing shared %s assets, not a source domain', (extension) => {
    const asset = `assets/welcome.${extension}`
    expect(violations('Welcome.tsx', `import welcome from './${asset}'`, { [asset]: '' })).toEqual([])
  })

  it.each(['ts', 'tsx', 'js', 'css', 'module.css', 'svg.ts'])('does not exempt %s implementations or styles in assets/', (extension) => {
    const asset = `assets/welcome.${extension}`
    expect(violations('Welcome.tsx', `import welcome from './${asset}'`, { [asset]: '' })).toHaveLength(1)
  })

  it('rejects missing assets instead of silently narrowing the graph', () => {
    expect(violations('Welcome.tsx', "import welcome from './assets/missing.svg'")).toHaveLength(1)
  })

  it('does not exempt another domain whose file happens to be an image', () => {
    expect(violations('input/bar.tsx', "import icon from '../chat/icon.svg'", { 'chat/icon.svg': '' })).toHaveLength(1)
  })

  it.each([
    "import value from '../chat/store.ts'",
    "import type { Value } from '../chat/store.ts'",
    "export { value } from '../chat/store.ts'",
    "export * from '../chat/store.ts'",
    "import '../chat/store.ts'",
    "const value = import('../chat/store.ts')",
    "type Value = import('../chat/store.ts').Value",
    "import value = require('../chat/store.ts')",
  ])('detects every module dependency form: %s', (source) => {
    expect(violations('input/bar.tsx', source)).toHaveLength(1)
  })

  it('does not treat comments or quoted examples as imports', () => {
    expect(violations('input/bar.tsx', `// import value from '../chat/store.ts'
      const example = "import value from '../chat/store.ts'"`)).toEqual([])
  })

  it.each(['apply.ts', 'index.ts', 'index.tsx'])('allows the explicit assembly point %s', (file) => {
    expect(violations(file, "import value from './chat/store.ts'")).toEqual([])
  })

  it.each([
    ['input/bar.tsx', '../input/store.ts'],
    ['input/bar.tsx', '../contract/slots.ts'],
    ['input/bar.tsx', '../shared.ts'],
    ['input/bar.tsx', '../../host.ts'],
  ])('preserves permitted imports from %s to %s', (file, spec) => {
    expect(violations(file, `import value from '${spec}'`)).toEqual([])
  })

  it('rejects shared contracts importing domain implementations', () => {
    expect(violations('contract/slots.ts', "import value from '../input/store.ts'")).toHaveLength(1)
  })
})
