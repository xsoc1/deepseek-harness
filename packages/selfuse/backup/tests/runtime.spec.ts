/** Loader and native-tool acceptance against disposable data and a local bare Git remote. */
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { get } from 'node:http'
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { expect, it, onTestFinished, vi } from 'vitest'
import { Context, FiberState } from '@deepseek-ai/cordis'
import Loader, { EntryTree } from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import Timer from '@deepseek-ai/cordis-plugin-timer'
import Tools from '@deepseek-ai/dsh-tools'
import Commands from '@deepseek-ai/dsh-commands'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import LocalSubprocess from '@deepseek-ai/dsh-subprocess-local'
import Typert from '@deepseek-ai/dsh-typert-registry'
import WebServer from '@deepseek-ai/dsh-host-webserver'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { createLaunchEnvironmentSnapshot } from '@deepseek-ai/dsh-launch-environment'
const Backup = await vi.importActual<typeof import('../src/index.ts')>('../lib/index.js')
const exec = promisify(execFile)

async function load(root: string, repo = '', web = false) {
  const home = join(root, 'home')
  const data = join(home, '.dsh')
  const destination = join(root, 'backups')
  await mkdir(data, { recursive: true })
  await writeFile(join(data, 'fixture.txt'), 'original fixture\n')
  const ctx = new Context()
  onTestFinished(async () => {
    try { await ctx.fiber.dispose() }
    finally { await rm(root, { recursive: true, force: true }) }
  })
  ctx.provide('launchEnvironment', createLaunchEnvironmentSnapshot([
    { source: 'process', values: { HOME: home, DSH_HOME: data } },
  ]))
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(Tools)
  await ctx.plugin(Commands)
  await ctx.plugin(Timer)
  await ctx.plugin(LocalSubprocess)
  await ctx.plugin(Typert)
  if (web) await ctx.plugin(WebServer, { host: '127.0.0.1', port: 0 })
  await ctx.plugin(Loader)
  ctx.loader.builtins.include = Include
  const config = join(root, 'cordis.yml')
  await writeFile(config, [
    "- id: '@dsh-selfuse/backup'", "  name: '@dsh-selfuse/backup'", '  config:',
    `    destination: ${JSON.stringify(destination)}`, '    keep: 1',
    `    githubRepo: ${JSON.stringify(repo)}`, '',
  ].join('\n'))
  const resolver = vi.spyOn(EntryTree.prototype, 'import')
  onTestFinished(() => { resolver.mockRestore() })
  resolver.mockImplementation(function (this: EntryTree, name: string): unknown {
    if (name === '@dsh-selfuse/backup') return Backup
    if (name.startsWith('cordis:')) return this.ctx.loader.builtins[name.slice(7)]
    throw new Error(`unexpected test import: ${name}`)
  })
  await ctx.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(config).href } })
  await ctx.loader.await()
  for (const entry of ctx.loader.entries()) await entry.fiber?.await()
  const activated = [...ctx.loader.entries()].map(entry => ({ name: entry.options.name, state: entry.fiber?.state }))
  expect(activated, JSON.stringify(activated)).toContainEqual({ name: Backup.name, state: FiberState.ACTIVE })
  const invoke = (mode: string, args: Record<string, unknown> = {}) => ctx.tools.execute({
    name: 'backup_dsh', callId: ToolCallId(`backup-${mode}`), arguments: { mode, ...args },
    signal: new AbortController().signal,
  })
  return { ctx, data, destination, resolver, invoke }
}

it('loads rebuilt backup through cordis.yml, verifies, restores and unloads without registry residue', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-backup-loader-'))
  const state = await load(root)
  try {
    const created = await state.invoke('backup')
    expect(created, JSON.stringify(created)).toMatchObject({ isError: false })
    expect(created.value).toMatchObject({ ok: true })
    expect(await state.ctx.backupPanel.status()).toMatchObject({ downloadAvailable: false })
    expect((await state.invoke('verify', { selector: 'all' })).value).toMatchObject({ ok: true })
    await writeFile(join(state.data, 'fixture.txt'), 'changed fixture\n')
    expect((await state.invoke('restore', { selector: 'latest', dryRun: true })).value).toMatchObject({ ok: true })
    expect(await readFile(join(state.data, 'fixture.txt'), 'utf8')).toBe('changed fixture\n')
    // keep=1 used to delete the selected archive while creating the restore snapshot.
    expect((await state.invoke('restore', { selector: 'latest', dryRun: false })).value).toMatchObject({ ok: true })
    expect(await readFile(join(state.data, 'fixture.txt'), 'utf8')).toBe('original fixture\n')
    const asides = (await readdir(join(root, 'home'))).filter(name => name.startsWith('.dsh.pre-restore-'))
    expect(asides).toHaveLength(1)
    const aside = asides[0]
    if (aside === undefined) throw new Error('restore did not preserve an aside directory')
    expect(await readFile(join(root, 'home', aside, 'fixture.txt'), 'utf8')).toBe('changed fixture\n')
    expect((await state.invoke('auto', { hours: 4 })).value).toMatchObject({ ok: true })
    const row = [...state.ctx.loader.entries()].find(entry => entry.options.name === Backup.name)
    if (row === undefined) throw new Error('backup Loader row did not activate')
    expect(state.ctx.typert.local.get('backupPanel/status')).toBeDefined()
    await row.update({ disabled: true })
    await state.ctx.loader.await()
    expect((await state.invoke('list')).isError).toBe(true)
    expect(state.ctx.typert.local.get('backupPanel/status')).toBeUndefined()
    await row.update({ disabled: false })
    await state.ctx.loader.await()
    const resumed = await state.invoke('auto')
    expect(resumed.value).toMatchObject({ ok: true })
    expect(JSON.stringify(resumed.value)).toContain('4')
    expect((await state.invoke('list')).isError).toBe(false)
  } finally {
    await state.ctx.fiber.dispose()
    state.resolver.mockRestore()
    await rm(root, { recursive: true, force: true })
  }
}, 20_000)

it('pushes only archive files to a local bare remote, never credentials, and updates the selected remote', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-backup-git-'))
  const remote = join(root, 'remote.git')
  await exec('git', ['init', '--bare', remote])
  const state = await load(root, remote)
  try {
    expect((await state.invoke('backup')).value).toMatchObject({ ok: true })
    const files = (await exec('git', ['--git-dir', remote, 'ls-tree', '-r', '--name-only', 'main'])).stdout.trim().split('\n')
    expect(files).toContain('.gitignore')
    expect(files.some(file => /^dsh-.*\.tar\.gz$/.test(file))).toBe(true)
    expect(files).not.toContain('.git-credentials')
    expect(files).not.toContain('auto.json')
    const secondRemote = join(root, 'second.git')
    await exec('git', ['init', '--bare', secondRemote])
    expect(await state.ctx.backupPanel.setGithubRepo(secondRemote)).toMatchObject({ ok: true })
    expect((await state.invoke('backup')).value).toMatchObject({ ok: true })
    expect((await exec('git', ['--git-dir', secondRemote, 'ls-tree', '-r', '--name-only', 'main'])).stdout).toContain('.tar.gz')
  } finally {
    await state.ctx.fiber.dispose()
    state.resolver.mockRestore()
    await rm(root, { recursive: true, force: true })
  }
}, 20_000)

it('rejects a checksum-valid traversal or linked archive before touching the current home', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-backup-reject-'))
  const state = await load(root)
  try {
    await mkdir(state.destination)
    const evil = join(root, 'evil')
    await mkdir(join(evil, '.dsh'), { recursive: true })
    await symlink('/outside-test-target', join(evil, '.dsh', 'linked'))
    const archive = join(state.destination, 'dsh-linked.tar.gz')
    await exec('tar', ['-czf', archive, '-C', evil, '.dsh'])
    const digest = createHash('sha256').update(await readFile(archive)).digest('hex')
    await writeFile(`${archive}.sha256`, `${digest}  dsh-linked.tar.gz\n`)
    expect((await state.invoke('restore', { selector: 'latest' })).value).toMatchObject({ ok: false })
    expect(await readFile(join(state.data, 'fixture.txt'), 'utf8')).toBe('original fixture\n')
    expect(await readdir(join(root, 'home'))).toEqual(['.dsh'])
  } finally {
    await state.ctx.fiber.dispose()
    state.resolver.mockRestore()
    await rm(root, { recursive: true, force: true })
  }
})

it('validates the complete spilled listing of a many-file archive', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-backup-spill-'))
  const state = await load(root)
  for (let i = 0; i < 200; i++) {
    await writeFile(join(state.data, `fixture-${i}-${'x'.repeat(80)}.txt`), 'fixture\n')
  }
  expect((await state.invoke('backup')).value).toMatchObject({ ok: true })
  expect(await state.ctx.backupPanel.restore('latest', true)).toMatchObject({ ok: true, files: 202 })
}, 20_000)

function download(port: number, name: string, host = '127.0.0.1') {
  return new Promise<{ status: number | undefined; bytes: Buffer }>((resolve, reject) => {
    const request = get({ hostname: '127.0.0.1', port, path: `/backup-download/${name}`, headers: { host } }, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.once('error', reject)
      res.once('end', () =>{  resolve({ status: res.statusCode, bytes: Buffer.concat(chunks) }) })
    })
    request.once('error', reject)
    request.setTimeout(2000, () => request.destroy(new Error('download test timed out')))
  })
}

it('streams a local regular archive and rejects a non-loopback Host, symlink and removed route', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-backup-http-'))
  const state = await load(root, '', true)
  expect((await state.invoke('backup')).value).toMatchObject({ ok: true })
  const names = (await readdir(state.destination)).filter(name => name.endsWith('.tar.gz'))
  const name = names[0]
  if (name === undefined) throw new Error('backup did not create an archive')
  const port = state.ctx.webServer.port
  expect(await state.ctx.backupPanel.status()).toMatchObject({ downloadAvailable: true })
  const response = await download(port, name)
  expect(response.status).toBe(200)
  expect(response.bytes).toEqual(await readFile(join(state.destination, name)))
  expect((await download(port, name, 'untrusted.test')).status).toBe(403)
  await writeFile(join(root, 'private-fixture.txt'), 'must not download\n')
  await symlink(join(root, 'private-fixture.txt'), join(state.destination, 'dsh-linked.tar.gz'))
  expect((await download(port, 'dsh-linked.tar.gz')).status).toBe(404)
  const row = [...state.ctx.loader.entries()].find(entry => entry.options.name === Backup.name)
  if (row === undefined) throw new Error('backup Loader row did not activate')
  await row.update({ disabled: true })
  await state.ctx.loader.await()
  expect((await download(port, name)).status).toBe(404)
}, 20_000)
