/** A moved release tag must not silently change the source-recovery version. */
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import test from 'node:test'

const exec = promisify(execFile)
const script = fileURLToPath(new URL('./recover-sources.mjs', import.meta.url))

test('source recovery rejects a tag pointing to an unrecorded commit before any write', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'dsh-source-pin-'))
  try {
    await exec('git', ['init', '-q', fixture])
    await exec('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', 'commit', '-q', '--allow-empty', '-m', 'fixture'], { cwd: fixture })
    await exec('git', ['tag', 'v0.2.7'], { cwd: fixture })
    await assert.rejects(exec(process.execPath, [script, fixture, '--write']), error => {
      assert.match(error.stderr, /v0\.2\.7 does not match the recorded source commit/u)
      return true
    })
  } finally {
    await rm(fixture, { recursive: true, force: true })
  }
})
