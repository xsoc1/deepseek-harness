import { describe, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { BUILD_SCRIPTS } from '../build.ts'
import { collectActiveSelfuseBuilds, runActiveSelfuseBuilds } from './build-active.ts'

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'selfuse-build-'))
  mkdirSync(join(root, 'config/selfuse'), { recursive: true })
  writeFileSync(join(root, 'config/selfuse/profiles.build.yml'), 'bundles: ["@dsh-selfuse/consumer"]\npatchPlugins: []\n')
  const manifest = (name: string, peers: Record<string, string> = {}) => {
    const directory = join(root, 'packages/selfuse', name)
    mkdirSync(directory, { recursive: true })
    writeFileSync(join(directory, 'package.json'), JSON.stringify({
      name: `@dsh-selfuse/${name}`, private: true, scripts: { build: 'node build.cjs' }, peerDependencies: peers,
    }))
  }
  manifest('consumer', { '@dsh-selfuse/provider': 'workspace:*', '@deepseek-ai/cordis': 'workspace:~' })
  manifest('provider')
  return { root, manifest, close: () => { rmSync(root, { recursive: true, force: true }) } }
}

describe('selfuse build integration', () => {
  it('builds active private packages after the official libraries', () => {
    expect(BUILD_SCRIPTS.indexOf('build:selfuse')).toBeGreaterThan(BUILD_SCRIPTS.indexOf('build:lib'))
    expect(BUILD_SCRIPTS.indexOf('build:selfuse')).toBeLessThan(BUILD_SCRIPTS.indexOf('build:web'))

    const builds = collectActiveSelfuseBuilds()
    expect(builds).toContainEqual({ name: '@dsh-selfuse/content-risk-guard', script: 'build' })
    expect(builds).toContainEqual({ name: '@dsh-selfuse/skin-layout-compat', script: 'build' })
    expect(builds.map(item => item.name)).toEqual([
      '@dsh-selfuse/plugin-mount',
      '@dsh-selfuse/web-ui-git-graph',
      '@dsh-selfuse/skin-layout-compat',
      '@dsh-selfuse/skin-center',
      '@dsh-selfuse/backup',
      '@dsh-selfuse/git-workflow',
      '@dsh-selfuse/memory-panel',
      '@dsh-selfuse/task-notify',
      '@dsh-selfuse/soul-md',
      '@dsh-selfuse/content-risk-guard',
    ])
  })

  it('builds private peer providers before consumers without rebuilding official peers', () => {
    const h = fixture()
    try {
      expect(collectActiveSelfuseBuilds(h.root).map(item => item.name)).toEqual([
        '@dsh-selfuse/provider', '@dsh-selfuse/consumer',
      ])
    } finally { h.close() }
  })

  it('declares the reviewed shared mount provider as a peer of both consumers', () => {
    for (const consumer of ['skin-center', 'web-ui-git-graph']) {
      const manifest: unknown = JSON.parse(readFileSync(new URL(`../../packages/selfuse/${consumer}/package.json`, import.meta.url), 'utf8'))
      expect(manifest).toHaveProperty(['peerDependencies', '@dsh-selfuse/plugin-mount'], 'workspace:~')
      expect(manifest).toHaveProperty(['devDependencies', '@dsh-selfuse/plugin-mount'], 'workspace:~')
      expect(manifest).not.toHaveProperty(['dependencies', '@dsh-selfuse/plugin-mount'])
    }
  })

  it('rejects cycles passing through peer dependencies', () => {
    const h = fixture()
    try {
      h.manifest('provider', { '@dsh-selfuse/consumer': 'workspace:*' })
      expect(() => collectActiveSelfuseBuilds(h.root)).toThrow('dependency cycle')
    } finally { h.close() }
  })

  it('runs each build from its package directory with manager-neutral run arguments', () => {
    const h = fixture()
    const entrypoint = join(h.root, 'npm-cli.cjs')
    try {
      writeFileSync(entrypoint, `const fs = require('node:fs');
        if (JSON.stringify(process.argv.slice(2)) !== '["run","build"]') process.exit(41);
        fs.writeFileSync('build.marker', process.cwd());`)
      runActiveSelfuseBuilds(h.root, { ...process.env, npm_execpath: entrypoint })
      for (const name of ['provider', 'consumer']) {
        const directory = join(h.root, 'packages/selfuse', name)
        expect(readFileSync(join(directory, 'build.marker'), 'utf8')).toBe(directory)
      }
    } finally { h.close() }
  })
})
