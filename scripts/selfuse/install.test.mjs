import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
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

test('Web startup accepts only the configured Tailnet hostname', async t => {
  let script = join(repoRoot, 'scripts', 'selfuse', 'management', 'run-dsh-web.test.ps1')
  if (process.platform !== 'win32') {
    if (!process.env.WSL_DISTRO_NAME) {
      t.skip('PowerShell startup is only exercised on Windows or WSL')
      return
    }
    const { stdout } = await execFileAsync('wslpath', ['-w', script])
    script = stdout.trim()
  }
  const { stdout } = await execFileAsync('powershell.exe', [
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script,
  ])
  assert.match(stdout, /run-dsh-web trusted-host regression: PASS/u)
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
    assert.equal(profilePackage.includes('@dsh-selfuse/wsl-workspace'), false)
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

test('the generated memory root follows the selected DSH home', async () => {
  const dshHome = await mkdtemp(join(tmpdir(), 'dsh-selfuse-memory-root-'))
  try {
    await execFileAsync(process.execPath, [generator, '--dsh-home', dshHome])
    const patch = await readFile(join(dshHome, 'profiles', 'web', 'cordis.patch.yml'), 'utf8')
    assert.equal(patch.includes(`root: ${join(dshHome, 'lingshu', 'mdcg')}`), true)
    assert.equal(patch.includes('root: /home/huangzy/.dsh/lingshu/mdcg'), false)
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
    const retiredPackages = [
      '@dsh-selfuse/web-ui-settings', '@dsh-selfuse/web-ui-community-plugins',
      '@dsh-selfuse/skins', '@dsh-selfuse/web-ui-all',
      '@dsh-selfuse/ssh', '@dsh-selfuse/web-ui-task-board', '@dsh-selfuse/mineru',
      '@deepseek-ai/dsh-client-runtime', '@deepseek-ai/dsh-host-apiproxy',
      '@dsh-selfuse/undo',
    ]
    for (const pkg of retiredPackages) {
      profile.dependencies[pkg] = '0.2.7'
      profile.dsh.profile.bundles.push(pkg)
    }
    await writeFile(packagePath, JSON.stringify(profile, null, 2) + '\n')

    await execFileAsync(process.execPath, [generator, '--dsh-home', dshHome])
    const regenerated = JSON.parse(await readFile(packagePath, 'utf8'))
    assert.equal(regenerated.dependencies['@example/local-plugin'], '1.0.0')
    assert.equal(regenerated.dsh.profile.bundles.at(-1), '@example/local-plugin')
    assert.equal(regenerated.dsh.profile.bundles.includes('@dsh-selfuse/market'), false)
    for (const pkg of retiredPackages) {
      assert.equal(Object.hasOwn(regenerated.dependencies, pkg), false)
      assert.equal(regenerated.dsh.profile.bundles.includes(pkg), false)
    }
    assert.equal(regenerated.dsh.profile.bundles.includes('@dsh-selfuse/skin-center'), true)
    assert.equal(regenerated.dsh.profile.bundles.includes('@dsh-selfuse/web-ui-git-graph'), true)
    const skinPatch = await readFile(join(repoRoot, 'packages/selfuse/skin-center/cordis.patch.yml'), 'utf8')
    assert.match(skinPatch, /name: '@dsh-selfuse\/skin-layout-compat'/u)
    assert.match(skinPatch, /name: '@dsh-selfuse\/skin-center'/u)
  } finally {
    await rm(dshHome, { recursive: true, force: true })
  }
})

for (const field of ['bundles', 'patchPlugins']) test(`a manifest cannot reactivate an explicitly retired package through ${field}`, async () => {
  const dshHome = await mkdtemp(join(tmpdir(), 'dsh-selfuse-retired-denial-'))
  try {
    const manifest = join(dshHome, 'invalid.yml')
    await writeFile(manifest, [
      'name: web',
      'retiredPackages:',
      '  - "@dsh-selfuse/web-ui-all"',
      field + ':',
      '  - "@dsh-selfuse/web-ui-all"',
      '',
    ].join('\n'))
    await assert.rejects(execFileAsync(process.execPath, [
      generator, '--manifest', manifest, '--dsh-home', dshHome,
    ]), error => {
      assert.match(error.stderr, /activates an explicitly retired package/u)
      return true
    })
    await assert.rejects(stat(join(dshHome, 'profiles')), { code: 'ENOENT' })
  } finally {
    await rm(dshHome, { recursive: true, force: true })
  }
})

test('profile regeneration retains local migrated overrides and legacy preset mappings', async () => {
  const dshHome = await mkdtemp(join(tmpdir(), 'dsh-selfuse-local-overrides-'))
  try {
    await execFileAsync(process.execPath, [generator, '--dsh-home', dshHome])
    const patchPath = join(dshHome, 'profiles', 'web', 'cordis.patch.yml')
    const local = '# Local instance overrides (preserved by profile generator).\n- id: local-account\n  config:\n    enabled: true\n'
    await writeFile(patchPath, (await readFile(patchPath, 'utf8')) + '\n' + local)
    await execFileAsync(process.execPath, [generator, '--dsh-home', dshHome])
    const patch = await readFile(patchPath, 'utf8')
    assert.equal(patch.split(local).length, 2)
    assert.match(patch, /- id: agent-preset-registry\n  config:\n    default: standard\n    selectedDefault: ptc\n    aliases:\n(?:      [^\n]+\n)*?      wsl-router-standard: standard/u)
    for (const alias of [
      'wsl-router-standard-v011-bak: standard',
      'wsl-router-standard: standard',
      'wsl-standard: standard',
      'wsl-ptc: ptc',
      'wsl-minimal: minimal',
      'wsl-cordis: cordis',
    ]) {
      assert.equal(patch.includes(`      ${alias}\n`), true)
    }
    assert.equal((patch.match(/- id: local-account/gu) ?? []).length, 1)
  } finally {
    await rm(dshHome, { recursive: true, force: true })
  }
})

test('the full installer copies vendored skills under their final path component', async () => {
  const dshHome = await mkdtemp(join(tmpdir(), 'dsh-selfuse-skills-'))
  try {
    await execFileAsync(process.execPath, [installer, '--skip-install-check', '--dsh-home', dshHome])
    const copied = await readFile(join(dshHome, 'skills', 'obsidian-cli', 'SKILL.md'), 'utf8')
    const source = await readFile(join(repoRoot, 'config', 'selfuse', 'skills', 'obsidian-skills', 'skills', 'obsidian-cli', 'SKILL.md'), 'utf8')
    assert.equal(copied, source)
  } finally {
    await rm(dshHome, { recursive: true, force: true })
  }
})

test('the retired balance widget is absent from the selfuse deployment', async () => {
  const manifest = await readFile(join(repoRoot, 'config', 'selfuse', 'profiles.build.yml'), 'utf8')
  const cliPackage = await readFile(join(repoRoot, 'apps', 'cli', 'package.json'), 'utf8')
  for (const content of [manifest, cliPackage]) {
    assert.equal(content.includes('dsh-balance'), false)
  }
  await assert.rejects(
    stat(join(repoRoot, 'packages', 'selfuse', 'eac-balance')),
    { code: 'ENOENT' },
  )
})

test('archived packages have no workspace directory or candidate deployment reference', async () => {
  const manifest = await readFile(join(repoRoot, 'config', 'selfuse', 'profiles.build.yml'), 'utf8')
  const cliPackage = await readFile(join(repoRoot, 'apps', 'cli', 'package.json'), 'utf8')
  for (const [directory, packageName] of [
    ['eac-client-file-changes', '@deepseek-ai/dsh-client-file-changes'],
    ['eac-easy-setup', '@deepseek-ai/dsh-easy-setup'],
    ['eac-file-changes', '@deepseek-ai/dsh-file-changes'],
    ['eac-shell-terminal', '@deepseek-ai/dsh-shell-terminal'],
    ['eac-web-shell-bridge', '@deepseek-ai/dsh-web-shell-bridge'],
    ['market', '@dsh-selfuse/market'],
    ['skill-router', '@dsh-selfuse/skill-router'],
    ['wsl-workspace', '@dsh-selfuse/wsl-workspace'],
  ]) {
    await assert.rejects(stat(join(repoRoot, 'packages', 'selfuse', directory)), { code: 'ENOENT' })
    assert.equal(manifest.includes(packageName), false, packageName)
    assert.equal(cliPackage.includes(packageName), false, packageName)
  }
  assert.equal(manifest.includes('@dsh-selfuse/task-notify'), true)
  await stat(join(repoRoot, 'packages', 'selfuse', 'task-notify', 'package.json'))
})

test('the retained notification package includes its real entry in the declared payload', async () => {
  const directory = join(repoRoot, 'packages', 'selfuse', 'task-notify')
  const manifest = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'))
  assert.equal(manifest.files.includes('lib/index.js'), true)
  assert.equal(manifest.files.includes('lib/types/**/*.d.ts'), true)
  assert.equal(manifest.exports['.'].default, './lib/index.js')
  const entry = await import(pathToFileURL(join(directory, manifest.main)).href)
  assert.equal(typeof entry.apply, 'function')
  assert.equal(typeof entry.name, 'string')
})
