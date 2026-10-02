/** Native CLI layer reconciliation against a disposable user profile. */
import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { expect, onTestFinished } from 'vitest'
import { resolveExampleLaunch } from '@deepseek-ai/dsh-loader-smoke'

const exec = promisify(execFile)
const root = resolve(import.meta.dirname, '../..')

/**
 * Install and remove a private source-linked layer using the shipped CLI launcher.
 * @param packageName - workspace package's unscoped directory.
 * @returns after dependency, bundle metadata and patch readback pass.
 */
export async function acceptProfileLayer(packageName: string): Promise<void> {
  const identity = `@dsh-selfuse/${packageName}`
  const home = await mkdtemp(join(tmpdir(), `dsh-${packageName}-profile-`))
  onTestFinished(async () => { await rm(home, { recursive: true, force: true }) })
  const profileName = `${packageName}-acceptance`
  const profile = join(home, 'profiles', profileName)
  await mkdir(profile, { recursive: true })
  await writeFile(join(profile, 'package.json'), JSON.stringify({
    name: profileName, private: true, type: 'module', dependencies: {},
  }))
  await writeFile(join(profile, 'cordis.yml'), '[]\n')
  const launch = resolveExampleLaunch({
    srcBin: join(root, 'apps/cli/src/bin.ts'), tsconfigPath: join(root, 'tsconfig.json'), env: { DSH_HOME: home },
    configArgs: ['plugin', '--profile', profileName],
  })
  const options = { cwd: root, env: { ...process.env, ...launch.env }, timeout: 60_000 }
  await exec(launch.command, [...launch.args, 'add', `link:${join(root, 'packages/selfuse', packageName)}`], options)
  const added: unknown = JSON.parse(await readFile(join(profile, 'package.json'), 'utf8'))
  expect(added).toMatchObject({ dsh: { profile: { bundles: [identity] } } })
  expect(await readFile(join(profile, 'node_modules', identity, 'cordis.patch.yml'), 'utf8')).toContain(identity)
  await exec(launch.command, [...launch.args, 'remove', identity], options)
  const removed = await readFile(join(profile, 'package.json'), 'utf8')
  expect(removed).not.toContain(identity)
  expect(JSON.parse(removed)).toMatchObject({ dsh: { profile: { bundles: [] } } })
}
