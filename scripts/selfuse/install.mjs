#!/usr/bin/env node
/**
 * One-click selfuse installer for the dsh source-run environment.
 *
 * It:
 *   1. verifies the repo has the selfuse workspace packages installed,
 *   2. generates/refreshes ~/.dsh/profiles/web from config/selfuse/profiles.build.yml,
 *   3. syncs ~/.dsh/settings.yaml from config/selfuse/settings.yaml,
 *   4. installs vendored skills (real copies, never junctions) into ~/.dsh/skills.
 *
 * The dsh process itself is not restarted here; run `dsh-control.ps1 restart`
 * or the GUI "重启" button after installation when you want the new profile to
 * take effect.
 */
import { existsSync, cpSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const dshHome = argValue('--dsh-home', process.env.DSH_HOME || join(homedir(), '.dsh'))
const dryRun = args.includes('--dry-run')
const force = args.includes('--force')
const skipPnpmReady = args.includes('--skip-install-check')

function argValue(name, fallback) {
  const idx = args.indexOf(name)
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback
}

function step(message) {
  console.log(`\n==> ${message}`)
}

function run(cmd, argsList, opts = {}) {
  console.log(`    $ ${cmd} ${argsList.join(' ')}`)
  if (dryRun) return
  execFileSync(cmd, argsList, { stdio: 'inherit', ...opts })
}

function copyIfNew(src, dst, backup = true) {
  if (!existsSync(src)) {
    console.log(`    - missing source, skip: ${src}`)
    return false
  }
  if (existsSync(dst)) {
    if (!force) {
      console.log(`    - exists, skip (use --force to replace): ${dst}`)
      return false
    }
    if (backup) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-')
      const bak = `${dst}.bak-${ts}`
      renameSync(dst, bak)
      console.log(`    - backed up: ${dst} -> ${bak}`)
    } else {
      rmSync(dst, { recursive: true, force: true })
    }
  }
  if (dryRun) {
    console.log(`    [dry-run] would copy: ${src} -> ${dst}`)
    return true
  }
  mkdirSync(dirname(dst), { recursive: true })
  cpSync(src, dst, { recursive: true })
  console.log(`    - copied: ${dst}`)
  return true
}

function walkSkillRoots(base) {
  const results = []
  function walk(dir) {
    if (!existsSync(dir)) return
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry)
      if (!statSync(p).isDirectory()) continue
      if (existsSync(join(p, 'SKILL.md'))) {
        results.push(p)
        continue // don't recurse into a skill itself
      }
      walk(p)
    }
  }
  walk(base)
  return results
}


console.log('dsh-selfuse installer')
console.log(`  repo root: ${repoRoot}`)
console.log(`  DSH_HOME:  ${dshHome}`)
if (dryRun) console.log('  mode: DRY RUN')
if (force) console.log('  mode: FORCE')

// --- 0. install check -------------------------------------------------------
step('Check selfuse workspace packages are linked into the CLI')
const cliPkg = JSON.parse(readFileSync(join(repoRoot, 'apps/cli/package.json'), 'utf8'))
const selfuseCount = Object.keys(cliPkg.dependencies || {}).filter((k) => k.startsWith('@dsh-selfuse/')).length
console.log(`    apps/cli declares ${selfuseCount} @dsh-selfuse/* direct dependencies`)
if (!skipPnpmReady && selfuseCount === 0) {
  console.error('    @dsh-selfuse packages are not declared in apps/cli/package.json; run pnpm install first')
  process.exit(1)
}

// --- 1. profile -------------------------------------------------------------
step('Generate/refresh web profile')
const genPath = join(repoRoot, 'scripts/selfuse/generate-profile.mjs')
if (dryRun) {
  console.log(`    dry-run: node ${genPath} --dsh-home ${dshHome}`)
} else {
  run(process.execPath, [genPath, '--dsh-home', dshHome])
}

// --- 2. settings ------------------------------------------------------------
step('Sync settings.yaml')
copyIfNew(join(repoRoot, 'config/selfuse/settings.yaml'), join(dshHome, 'settings.yaml'), true)

// --- 3. profile cordis/workspace are already written by generator -------------
// no extra action in this script beyond the generator.

// --- 4. skills --------------------------------------------------------------
step('Install vendored skills')
const skillsSrc = join(repoRoot, 'config/selfuse/skills')
const skillsDst = join(dshHome, 'skills')
let installedSkills = 0
if (existsSync(skillsSrc)) {
  for (const group of readdirSync(skillsSrc)) {
    const groupDir = join(skillsSrc, group)
    if (!statSync(groupDir).isDirectory()) continue
    const skillDirs = walkSkillRoots(join(groupDir, 'skills'))
    for (const skillDir of skillDirs) {
      const name = skillDir.split('/').pop()
      const ok = copyIfNew(skillDir, join(skillsDst, name), true)
      if (ok) installedSkills++
    }
  }
} else {
  console.log('    no vendored skills under config/selfuse/skills; skip')
}
console.log(`    skills considered: ${installedSkills}`)

console.log('\nDone. Restart dsh to load the selfuse profile.')
