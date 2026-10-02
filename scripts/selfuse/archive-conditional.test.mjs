/** Reject ambiguous archive commands before any inventory or move is attempted. */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const script = fileURLToPath(new URL('./archive-conditional.mjs', import.meta.url))
for (const argv of [['--move', '--verify'], ['--mvoe'], ['--verify', '--force']]) {
  test('archive rejects ' + argv.join(' '), () => {
    const result = spawnSync(process.execPath, [script, ...argv], { encoding: 'utf8' })
    assert.equal(result.status, 1)
    assert.match(result.stderr, /choose --move or --verify/u)
    assert.equal(result.stdout, '')
  })
}
