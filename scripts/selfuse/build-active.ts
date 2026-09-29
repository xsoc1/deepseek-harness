/** Build active private selfuse packages whose runtime files are not vendored. */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import yaml from 'js-yaml'
import { pnpmInvocation } from '../pnpm-invocation.ts'

const DEFAULT_ROOT = resolve(import.meta.dirname, '../..')

interface SelfuseBuild {
  name: string
  script: 'build' | 'build:fs'
}

function record(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('selfuse build: expected an object')
  }
  return value as Record<string, unknown>
}

function names(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || !value.every(item => typeof item === 'string')) {
    throw new Error(`selfuse build: ${field} must be a string list`)
  }
  return value
}

/** Return active private build scripts in dependency order, rejecting missing workspace packages. */
export function collectActiveSelfuseBuilds(root: string = DEFAULT_ROOT): SelfuseBuild[] {
  const manifest = record(yaml.load(readFileSync(join(root, 'config/selfuse/profiles.build.yml'), 'utf8')))
  const enabled = [
    ...names(manifest.bundles, 'bundles'),
    ...names(manifest.patchPlugins, 'patchPlugins'),
  ]
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const builds: SelfuseBuild[] = []

  function visit(name: string): void {
    if (!name.startsWith('@dsh-selfuse/') || visited.has(name)) return
    if (visiting.has(name)) throw new Error(`selfuse build: dependency cycle at ${name}`)
    const directory = join(root, 'packages/selfuse', name.slice('@dsh-selfuse/'.length))
    const manifestPath = join(directory, 'package.json')
    if (!existsSync(manifestPath)) throw new Error(`selfuse build: package missing: ${name}`)
    const pkg = record(JSON.parse(readFileSync(manifestPath, 'utf8')))
    if (pkg.name !== name) throw new Error(`selfuse build: package name mismatch: ${name}`)
    visiting.add(name)
    const dependencies = record(pkg.dependencies ?? {})
    for (const dependency of Object.keys(dependencies)) visit(dependency)
    visiting.delete(name)
    visited.add(name)
    const scripts = record(pkg.scripts ?? {})
    const script = typeof scripts.build === 'string'
      ? 'build'
      : typeof scripts['build:fs'] === 'string' ? 'build:fs' : undefined
    if (pkg.private === true) {
      if (script === undefined) throw new Error(`selfuse build: private package has no build script: ${name}`)
      builds.push({ name, script })
    }
  }

  for (const name of enabled) visit(name)
  return builds
}

function main(): void {
  for (const { name, script } of collectActiveSelfuseBuilds()) {
    console.log(`selfuse build: ${name} (${script})`)
    const invocation = pnpmInvocation(['--filter', name, 'run', script])
    const result = spawnSync(invocation.command, invocation.args, {
      cwd: DEFAULT_ROOT,
      env: process.env,
      stdio: 'inherit',
    })
    if (result.error !== undefined) throw result.error
    if (result.status !== 0) {
      throw new Error(`selfuse build: ${name} ${script} exited with ${String(result.status ?? result.signal)}`)
    }
  }
}

if (import.meta.main) main()
