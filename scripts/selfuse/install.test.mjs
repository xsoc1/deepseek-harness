import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import test from 'node:test'

const execFileAsync = promisify(execFile)
const repoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const installer = join(repoRoot, 'scripts', 'selfuse', 'install.mjs')
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
