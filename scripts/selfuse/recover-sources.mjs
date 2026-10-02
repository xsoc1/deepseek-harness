/** Recover pinned Skin Center source without restoring retired packages or replacing local edits. */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../..', import.meta.url))
const upstream = process.argv[2]
if (!upstream) throw new Error('Usage: node scripts/selfuse/recover-sources.mjs <upstream-checkout> [--write]')
const commit = '314f9ea7524c1a8fa2bb6c9a2c3bcaaa440cee5f'
const resolved = execFileSync('git', ['rev-parse', 'v0.2.7^{commit}'], { cwd: upstream, encoding: 'utf8' }).trim()
if (resolved !== commit) throw new Error('v0.2.7 does not match the recorded source commit')
const mappings = {
  'packages/skins/skin-center': 'packages/selfuse/skin-center',
}
const files = execFileSync('git', ['ls-tree', '-r', '--name-only', '-z', commit], { cwd: upstream }).toString().split('\0')
const recovered = []
for (const [source, destination] of Object.entries(mappings)) {
  for (const file of files.filter(file => file.startsWith(`${source}/src/`))) {
    const target = resolve(root, destination, file.slice(source.length + 1))
    if (!target.startsWith(`${resolve(root, destination)}/`)) throw new Error(`Out-of-package path: ${file}`)
    if (existsSync(target)) continue
    const content = execFileSync('git', ['show', `${commit}:${file}`], { cwd: upstream, maxBuffer: 8 * 1024 * 1024 })
    recovered.push({ source: file, target: relative(root, target), sha256: createHash('sha256').update(content).digest('hex') })
    if (process.argv.includes('--write')) {
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, content, { flag: 'wx' })
    }
  }
}
console.log(JSON.stringify({ upstream: 'https://github.com/zhu1090093659/dsh-web', commit, recovered }, null, 2))
