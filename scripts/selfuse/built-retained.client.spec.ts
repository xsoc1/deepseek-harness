/** Execute rebuilt browser factories against the official platform module table. */
import { readFile } from 'node:fs/promises'
import { runInContext } from 'node:vm'
import { JSDOM } from 'jsdom'
import { expect, it } from 'vitest'
import { getStaticModules } from '../../packages/client/web/src/seed.ts'

interface Registration {
  id: string
  factory(require: (specifier: string) => unknown): unknown
}

for (const name of ['skin-center', 'web-ui-git-graph']) {
  it(`rebuilt ${name} resolves official platform modules and registers its own CSS`, async () => {
    const id = '@dsh-selfuse/' + name
    const source = await readFile(new URL(`../../packages/selfuse/${name}/lib/client.js`, import.meta.url), 'utf8')
    const dom = new JSDOM('<main></main>', { runScripts: 'outside-only' })
    const modules = getStaticModules()
    const requested: string[] = []
    let registration: string | undefined
    let plugin: unknown
    Object.defineProperty(dom.window, '__ModuleLoader__', {
      value: {
        load(value: Registration) {
          registration = value.id
          plugin = value.factory((specifier) => {
            expect(Object.hasOwn(modules, specifier), specifier).toBe(true)
            requested.push(specifier)
            return modules[specifier]
          })
        },
      },
    })
    try {
      runInContext(source, dom.getInternalVMContext(), { timeout: 2000 })
      expect(registration).toBe(id)
      if (plugin === null || typeof plugin !== 'object' || !('apply' in plugin)) throw new Error('factory did not export apply')
      expect(typeof plugin.apply).toBe('function')
      expect(requested).toContain('react')
      expect(Object.keys(modules).some(item => item.includes('dsh-client-runtime'))).toBe(false)
      expect(dom.window.document.querySelector(`style[data-plugin="${id}"]`)).not.toBeNull()
    } finally {
      dom.window.close()
    }
  })
}
