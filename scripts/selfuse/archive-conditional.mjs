/** Archive explicitly retired packages with hash verification, never deleting data. */
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, realpathSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = realpathSync(fileURLToPath(new URL('../..', import.meta.url)))
const archive = '/home/huangzy/tools/dsh-retired-20261001/conditional-packages'
const targets = [
  ['packages/selfuse/ssh', 'ssh'],
  ['packages/selfuse/web-ui-task-board', 'web-ui-task-board'],
  ['packages/selfuse/mineru', 'mineru'],
  ['packages/client/runtime', 'legacy-client-runtime'],
  ['packages/host/apiproxy', 'legacy-host-apiproxy'],
]
const moving = process.argv.includes('--move')
const verifying = process.argv.includes('--verify')
if (process.argv.slice(2).some(argument => argument !== '--move' && argument !== '--verify')) {
  throw new Error('unsupported argument; choose --move or --verify')
}
if (moving && verifying) throw new Error('choose --move or --verify, not both')

function inventory(directory) {
  const rows = []
  function visit(path, relative = '') {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const local = join(path, entry.name)
      const name = relative + entry.name
      if (entry.isSymbolicLink()) rows.push({ name, link: readlinkSync(local) })
      else if (entry.isDirectory()) visit(local, name + '/')
      else {
        const data = readFileSync(local)
        rows.push({ name, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') })
      }
    }
  }
  visit(directory)
  return rows
}

if (!verifying) mkdirSync(archive, { recursive: true })
if (realpathSync(archive) !== archive) throw new Error('archive parent is not the expected literal path')
const result = []
for (const [source, name] of targets) {
  const from = resolve(root, source)
  const to = join(archive, name)
  if (!from.startsWith(root + '/') || dirname(to) !== archive) throw new Error('out-of-scope archive target')
  if (verifying) {
    if (existsSync(from)) throw new Error('retired workspace directory exists again: ' + from)
    if (!lstatSync(to).isDirectory() || realpathSync(to) !== to) throw new Error('archive target is not a literal directory')
    const before = JSON.parse(readFileSync(join(archive, name + '.before.json'), 'utf8'))
    const after = inventory(to)
    if (before.source !== source || before.archive !== to || JSON.stringify(before.inventory) !== JSON.stringify(after)) {
      throw new Error('archive verification failed: ' + source)
    }
    result.push({ source, archive: to, files: after.length, bytes: after.reduce((sum, row) => sum + (row.bytes ?? 0), 0), verified: true })
    continue
  }
  if (existsSync(to)) throw new Error('archive destination already exists: ' + to)
  if (!lstatSync(from).isDirectory() || realpathSync(from) !== from) throw new Error('source is not a literal workspace directory')
  const before = inventory(from)
  const record = { source, archive: to, files: before.length, bytes: before.reduce((sum, row) => sum + (row.bytes ?? 0), 0), inventory: before }
  writeFileSync(join(archive, name + '.before.json'), JSON.stringify(record, null, 2) + '\n', { flag: 'wx' })
  if (moving) {
    renameSync(from, to)
    const after = inventory(to)
    if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('archive hash mismatch: ' + source)
  }
  result.push({ ...record, inventory: undefined, verified: moving })
}
if (!verifying) writeFileSync(join(archive, 'acceptance.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result, null, 2))
