// @vitest-environment jsdom
/// <reference types="node" />
import { afterEach, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader, { EntryTree } from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import * as Layout from '../src/client/index.ts'

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

it('loads, disables and re-enables through the real Loader without losing prior attributes', async () => {
  document.body.innerHTML = '<main><aside class="sidebarCol" data-pane="original"></aside><section class="centerCol"></section><aside class="detailsCol"></aside></main>'
  const ctx = new Context()
  const root = await mkdtemp(join(tmpdir(), 'dsh-skin-layout-'))
  const resolver = vi.spyOn(EntryTree.prototype, 'import')
  resolver.mockImplementation(function (this: EntryTree, specifier: string): unknown {
    if (specifier === 'cordis:include') return this.ctx.loader.builtins.include
    if (specifier === Layout.name) return Layout
    throw new Error(`unexpected Loader import: ${specifier}`)
  })
  try {
    const path = join(root, 'cordis.yml')
    await writeFile(path, `- name: '${Layout.name}'\n`)
    ctx.baseUrl = pathToFileURL(root).href + '/'
    await ctx.plugin(Loader)
    ctx.loader.builtins.include = Include
    await ctx.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(path).href } })
    await ctx.loader.await()
    const entry = [...ctx.loader.entries()].find(candidate => candidate.options.name === Layout.name)
    if (entry === undefined) throw new Error('missing layout Loader entry')
    expect(document.querySelector('main')?.getAttribute('data-dsh-frame')).toBe('')
    expect(document.querySelector('.sidebarCol')?.getAttribute('data-pane')).toBe('original')
    expect(document.querySelector('.centerCol')?.getAttribute('data-pane')).toBe('conversation')
    expect(document.querySelector('.detailsCol')?.getAttribute('data-pane')).toBe('details')
    await entry.update({ disabled: true })
    await ctx.loader.await()
    expect(document.querySelector('[data-dsh-frame]')).toBeNull()
    expect(document.querySelector('.centerCol')?.hasAttribute('data-pane')).toBe(false)
    await entry.update({ disabled: false })
    await ctx.loader.await()
    expect(document.querySelector('.centerCol')?.getAttribute('data-pane')).toBe('conversation')
  } finally {
    await ctx.fiber.dispose()
    await rm(root, { recursive: true, force: true })
  }
})

it('marks replaced layout nodes and preserves subsequent attribute ownership', async () => {
  const ctx = new Context()
  try {
    await ctx.plugin(Layout)
    document.body.innerHTML = '<main><aside class="sidebarCol"></aside><section class="centerCol"></section></main>'
    await vi.waitFor(() => { expect(document.querySelector('.centerCol')?.getAttribute('data-pane')).toBe('conversation') })
    document.querySelector('.centerCol')?.setAttribute('data-pane', 'other-owner')
    await ctx.fiber.dispose()
    expect(document.querySelector('.centerCol')?.getAttribute('data-pane')).toBe('other-owner')
    expect(document.querySelector('.sidebarCol')?.hasAttribute('data-pane')).toBe(false)
  } finally {
    await ctx.fiber.dispose()
  }
})

it('cancels pending work on unload so it cannot mutate a later layout', async () => {
  const callbacks: FrameRequestCallback[] = []
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callbacks.push(callback)
    return 17
  })
  const cancel = vi.spyOn(window, 'cancelAnimationFrame')
  const ctx = new Context()
  await ctx.plugin(Layout)
  document.body.innerHTML = '<main><aside class="sidebarCol"></aside></main>'
  await vi.waitFor(() => { expect(callbacks).toHaveLength(1) })
  await ctx.fiber.dispose()
  expect(cancel).toHaveBeenCalledWith(17)
  for (const callback of callbacks) callback(0)
  expect(document.querySelector('[data-pane]')).toBeNull()
})

it('releases detached subtrees without waiting for plugin unload', async () => {
  document.body.innerHTML = '<main><aside class="sidebarCol"></aside></main>'
  const element = document.querySelector('.sidebarCol')
  if (element === null) throw new Error('missing sidebar fixture')
  const ctx = new Context()
  try {
    await ctx.plugin(Layout)
    expect(element.getAttribute('data-pane')).toBe('sidebar')
    element.remove()
    await vi.waitFor(() => { expect(element.hasAttribute('data-pane')).toBe(false) })
  } finally {
    await ctx.fiber.dispose()
  }
})
