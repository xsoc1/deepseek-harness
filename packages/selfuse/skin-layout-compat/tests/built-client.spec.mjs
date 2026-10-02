import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { runInContext } from 'node:vm'
import { JSDOM } from 'jsdom'
import { Context } from '@deepseek-ai/cordis'

test('the built browser factory activates and disposes the layout adapter', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  const dom = new JSDOM('<main><aside class="sidebarCol"></aside><section class="centerCol"></section></main>', {
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  })
  const ctx = new Context()
  let plugin
  dom.window.__ModuleLoader__ = {
    load(module) {
      assert.equal(module.id, '@dsh-selfuse/skin-layout-compat')
      plugin = module.factory(specifier => { throw new Error(`unexpected browser import: ${specifier}`) })
    },
  }
  try {
    runInContext(source, dom.getInternalVMContext(), { timeout: 1000 })
    assert.equal(typeof plugin?.apply, 'function')
    await ctx.plugin(plugin)
    assert.equal(dom.window.document.querySelector('.centerCol')?.getAttribute('data-pane'), 'conversation')
    await ctx.fiber.dispose()
    assert.equal(dom.window.document.querySelector('[data-pane]'), null)
    assert.equal(dom.window.document.querySelector('[data-dsh-frame]'), null)
  } finally {
    await ctx.fiber.dispose()
    dom.window.close()
  }
})
