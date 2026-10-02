/** Recoverably move untracked compiler outputs that were emitted beside authored TS. */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = realpathSync(fileURLToPath(new URL('../..', import.meta.url)))
const archive = '/home/huangzy/tools/dsh-retired-20261001/generated-src-residue'
const moving = process.argv.includes('--move')
const untracked = new Set(execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean))
const records = []
for (const path of [...untracked].sort()) {
  if (!/^packages\/[^/]+\/[^/]+\/src\/.*(?:\.js|\.d\.ts)\.map$/.test(path)) continue
  const map = JSON.parse(readFileSync(resolve(root, path), 'utf8'))
  if (!Array.isArray(map.sources) || map.sources.length !== 1 || !/^[^/]+\.ts$/.test(map.sources[0])) continue
  const from = resolve(root, path)
  const source = resolve(dirname(from), map.sources[0])
  const generated = path.slice(0, -4)
  if (!untracked.has(generated) || !existsSync(source) || source.endsWith('.d.ts')) continue
  if (!from.startsWith(root + '/') || !source.startsWith(root + '/')) throw new Error('out-of-scope source map')
  if (map.file !== generated.split('/').at(-1)) throw new Error('map/file mismatch: ' + path)
  for (const relative of [generated, path]) {
    const from = resolve(root, relative)
    const to = resolve(archive, relative)
    if (!to.startsWith(archive + '/') || existsSync(to)) throw new Error('invalid archive target: ' + to)
    const data = readFileSync(from)
    const sha256 = createHash('sha256').update(data).digest('hex')
    if (moving) {
      mkdirSync(dirname(to), { recursive: true })
      if (realpathSync(dirname(to)) !== dirname(to)) throw new Error('nonliteral archive directory')
      renameSync(from, to)
      if (createHash('sha256').update(readFileSync(to)).digest('hex') !== sha256) throw new Error('archive hash mismatch')
    }
    records.push({ path: relative, bytes: data.length, sha256 })
  }
}
if (moving) {
  mkdirSync(archive, { recursive: true })
  writeFileSync(resolve(archive, 'inventory.json'), JSON.stringify(records, null, 2) + '\n', { flag: 'wx' })
}
console.log(JSON.stringify({ files: records.length, bytes: records.reduce((sum, row) => sum + row.bytes, 0), moved: moving, archive }, null, 2))
