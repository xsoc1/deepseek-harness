import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import test from 'node:test'

const execFileAsync = promisify(execFile)
const repoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const installer = join(repoRoot, 'scripts', 'selfuse', 'install.mjs')
const generator = join(repoRoot, 'scripts', 'selfuse', 'generate-profile.mjs')
const sourceRoot = join(repoRoot, 'config', 'selfuse', 'agent-presets')

test('presets-only repairs canonical presets without touching other deployment state', async () => {
  const dshHome = await mkdtemp(join(tmpdir(), 'dsh-selfuse-presets-'))
  try {
    await execFileAsync(process.execPath, [
      installer,
      '--presets-only',
      '--skip-install-check',
      '--dsh-home',
      dshHome,
    ])

    const sourcePresets = (await readdir(sourceRoot, { withFileTypes: true }))
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort()
    assert.deepEqual(sourcePresets, ['router-spec', 'router-standard'])

    for (const preset of sourcePresets) {
      const source = await readFile(join(sourceRoot, preset, 'agent.cordis.yml'), 'utf8')
      const deployed = await readFile(join(dshHome, '.agent-presets', preset, 'agent.cordis.yml'), 'utf8')
      assert.equal(deployed, source)
    }

    await assert.rejects(stat(join(dshHome, 'settings.yaml')), { code: 'ENOENT' })
    await assert.rejects(stat(join(dshHome, 'profiles')), { code: 'ENOENT' })
    await assert.rejects(stat(join(dshHome, 'skills')), { code: 'ENOENT' })
  } finally {
    await rm(dshHome, { recursive: true, force: true })
  }
})

test('the managed and runnable Web startup scripts stay identical', async () => {
  const runnable = await readFile(join(repoRoot, 'run-dsh-web.ps1'), 'utf8')
  const managed = await readFile(join(repoRoot, 'scripts', 'selfuse', 'management', 'run-dsh-web.ps1'), 'utf8')
  assert.equal(managed, runnable)
  assert.match(runnable, /ProgramFiles.*Tailscale\\tailscale\.exe/su)
  assert.match(runnable, /F:\\Tailscale\\tailscale\.exe/u)
})

test('the generated Web profile applies managed overrides to inherited rows', async () => {
  const dshHome = await mkdtemp(join(tmpdir(), 'dsh-selfuse-profile-'))
  try {
    const officialWebPatch = await readFile(
      join(repoRoot, 'packages', 'bundle', 'web-app', 'cordis.patch.yml'),
      'utf8',
    )
    assert.match(officialWebPatch, /    - id: ui-sidebar-documentpreview\n/u)

    await execFileAsync(process.execPath, [generator, '--dsh-home', dshHome])

    const patch = await readFile(join(dshHome, 'profiles', 'web', 'cordis.patch.yml'), 'utf8')
    assert.match(patch, /- id: ui-sidebar-documentpreview\n  disabled: true/u)
    assert.match(
      patch,
      /- id: typert-gateway\n  config:\n    websocketHeartbeatIntervalMs: 10000/u,
    )
    for (const retired of [
      '@deepseek-ai/dsh-web-shell-bridge',
      '@deepseek-ai/dsh-file-changes',
      '@deepseek-ai/dsh-client-file-changes',
      '@deepseek-ai/dsh-shell-terminal',
      '@deepseek-ai/dsh-easy-setup',
      '@dsh-selfuse/skill-router',
    ]) {
      assert.equal(patch.includes(retired), false)
    }
    const profilePackage = await readFile(join(dshHome, 'profiles', 'web', 'package.json'), 'utf8')
    assert.equal(profilePackage.includes('@dsh-selfuse/market'), false)
    for (const nativeRow of [
      'workspace-files',
      'ui-sidebar-terminal',
      'ui-sidebar-files',
      'ui-settings-plugin-inventory',
    ]) {
      assert.equal(officialWebPatch.includes(`- id: ${nativeRow}`), true)
    }
  } finally {
    await rm(dshHome, { recursive: true, force: true })
  }
})

test('profile regeneration preserves plugins installed through the native CLI', async () => {
  const dshHome = await mkdtemp(join(tmpdir(), 'dsh-selfuse-cli-plugin-'))
  try {
    await execFileAsync(process.execPath, [generator, '--dsh-home', dshHome])
    const packagePath = join(dshHome, 'profiles', 'web', 'package.json')
    const profile = JSON.parse(await readFile(packagePath, 'utf8'))
    profile.dependencies['@example/local-plugin'] = '1.0.0'
    profile.dsh.profile.bundles.push('@example/local-plugin')
    await writeFile(packagePath, JSON.stringify(profile, null, 2) + '\n')

    await execFileAsync(process.execPath, [generator, '--dsh-home', dshHome])
    const regenerated = JSON.parse(await readFile(packagePath, 'utf8'))
    assert.equal(regenerated.dependencies['@example/local-plugin'], '1.0.0')
    assert.equal(regenerated.dsh.profile.bundles.at(-1), '@example/local-plugin')
    assert.equal(regenerated.dsh.profile.bundles.includes('@dsh-selfuse/market'), false)
  } finally {
    await rm(dshHome, { recursive: true, force: true })
  }
})

test('the retired balance widget is absent from the selfuse deployment', async () => {
  const manifest = await readFile(join(repoRoot, 'config', 'selfuse', 'profiles.build.yml'), 'utf8')
  const cliPackage = await readFile(join(repoRoot, 'apps', 'cli', 'package.json'), 'utf8')
  const bridgeClient = await readFile(
    join(repoRoot, 'packages', 'selfuse', 'eac-web-shell-bridge', 'lib', 'client.js'),
    'utf8',
  )
  const bridgeHost = await readFile(
    join(repoRoot, 'packages', 'selfuse', 'eac-web-shell-bridge', 'lib', 'index.js'),
    'utf8',
  )

  for (const content of [manifest, cliPackage, bridgeClient, bridgeHost]) {
    assert.equal(content.includes('dsh-balance'), false)
  }
  assert.equal(bridgeClient.includes('refreshBalance'), false)
  assert.equal(bridgeHost.includes('/api/dsh-shell/balance'), false)
  await assert.rejects(
    stat(join(repoRoot, 'packages', 'selfuse', 'eac-balance')),
    { code: 'ENOENT' },
  )
})
