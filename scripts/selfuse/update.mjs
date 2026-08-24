#!/usr/bin/env node
/**
 * Selfuse one-click updater.
 *
 * Modes:
 *   --check               show local branch/commit and whether upstream master has new commits
 *   --apply               fetch upstream master, merge into the current selfuse branch,
 *                         reinstall deps, rebuild selfuse packages, refresh profile/settings/skills
 *   --dry-run             print what would happen without changing files
 *   --no-build            skip rebuilding @dsh-selfuse packages after merge
 *   --restart             optionally restart dsh web after a successful apply (default: no)
 *   --dsh-home <path>     DSH home to refresh (default: $DSH_HOME or ~/.dsh)
 *
 * Safety:
 *   - refuses to apply when tracked files are dirty
 *   - backs up the current web profile before refreshing it
 *   - never rewrites history (uses git merge, not rebase)
 *   - does not restart dsh unless --restart is explicitly passed
 */
import { execFileSync } from 'node:child_process'
import { existsSync, copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const dshHome = argValue('--dsh-home', process.env.DSH_HOME || join(homedir(), '.dsh'))
const check = args.includes('--check')
const apply = args.includes('--apply')
const dryRun = args.includes('--dry-run')
const noBuild = args.includes('--no-build')
const restart = args.includes('--restart')

function argValue(name, fallback) {
  const idx = args.indexOf(name)
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback
}

function run(cmd, cmdArgs, opts = {}) {
  console.log(`    $ ${cmd} ${cmdArgs.join(' ')}`)
  if (dryRun) return ''
  return execFileSync(cmd, cmdArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...opts }).trim()
}

function git(argsList, allowFail = false, opts = {}) {
  try {
    return run('git', argsList, opts)
  } catch (error) {
    if (allowFail) return ''
    throw error
  }
}

function fetchUpstream() {
  console.log('  fetching upstream master (GitHub IP fallback) ...')
  git(['-c', 'http.sslVerify=false', '-c', "http.extraHeader=Host: github.com", 'fetch',
    'https://140.82.112.4/deepseek-ai/deepseek-harness.git', 'master:refs/remotes/origin/master'],
    false, { timeout: 60000, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } })
}

function upstreamCount() {
  const out = git(['rev-list', '--count', 'HEAD..origin/master'], true)
  const n = parseInt(out || '0', 10)
  return Number.isFinite(n) ? n : 0
}

function currentBranch() {
  return git(['branch', '--show-current'], true) || 'unknown'
}

function trackedDirtyCount() {
  const out = git(['status', '--porcelain', '--untracked-files=no'], true)
  return out ? out.split('\n').filter(Boolean).length : 0
}

function backupProfile() {
  if (dryRun) {
    console.log('    [dry-run] would backup web profile before refreshing')
    return
  }
  const profile = join(dshHome, 'profiles', 'web')
  if (!existsSync(profile)) return
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const dest = `${profile}.bak-${ts}`
  // Shallow backup: just package.json/cordis.patch.yml/pnpm-workspace.yaml are the
  // generated files; node_modules is reproducible and likely huge.
  mkdirSync(dest, { recursive: true })
  for (const f of ['package.json', 'cordis.patch.yml', 'pnpm-workspace.yaml']) {
    const src = join(profile, f)
    if (existsSync(src)) copyFileSync(src, join(dest, f))
  }
  console.log(`    backed up generated profile files to ${dest}`)
}

function buildSelfuse() {
  if (noBuild) {
    console.log('  skipping selfuse rebuild (--no-build)')
    return
  }
  console.log('  rebuilding @dsh-selfuse packages ...')
  const pkgs = []
  for (const entry of ['backup','better-sidebar','chat-recovery','file-upload','git-workflow','market','memory-panel','mineru','remote-web-ui','skin-center','skins','ssh','undo','web-ui-all','web-ui-community-plugins','web-ui-git-graph','web-ui-settings','web-ui-task-board','wsl-workspace']) {
    const p = join(repoRoot, 'packages/selfuse', entry, 'package.json')
    if (!existsSync(p)) continue
    const pkg = JSON.parse(readFileSync(p, 'utf8'))
    if (pkg.scripts && pkg.scripts.build) pkgs.push(pkg.name)
  }
  for (const name of pkgs) {
    console.log(`  -> ${name}`)
    try {
      run('pnpm', ['--filter', name, 'run', 'build'])
    } catch (error) {
      console.error(`  build failed for ${name}; continuing with tracked lib/ artifacts`)
    }
  }
}

function refreshProfile() {
  const gen = join(repoRoot, 'scripts/selfuse/generate-profile.mjs')
  const inst = join(repoRoot, 'scripts/selfuse/install.mjs')
  if (dryRun) {
    console.log(`    [dry-run] node ${gen} --dsh-home ${dshHome}`)
    console.log(`    [dry-run] node ${inst} --dsh-home ${dshHome}`)
    return
  }
  run(process.execPath, [gen, '--dsh-home', dshHome])
  run(process.execPath, [inst, '--dsh-home', dshHome])
}

function restartDsh() {
  if (!restart) {
    console.log('\n  dsh NOT restarted. Run the normal restart when ready, or pass --restart.')
    return
  }
  console.log('  restarting dsh web ...')
  const candidates = [
    '/mnt/f/tools/dsh-local/scripts/dsh-control.ps1',
    '/mnt/f/tools/deepseek-harness/dsh-control.ps1',
    join('/home/huangzy/tools/dsh-local/scripts', 'dsh-control.ps1'),
  ]
  const winForm = [
    'F:\\tools\\dsh-local\\scripts\\dsh-control.ps1',
    'F:\\tools\\deepseek-harness\\dsh-control.ps1',
  ]
  for (let i = 0; i < candidates.length; i++) {
    if (existsSync(candidates[i])) {
      run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', winForm[i] || winForm[0], 'restart'])
      return
    }
  }
  console.warn('  could not locate dsh-control.ps1; start dsh manually.')
}

console.log('dsh-selfuse updater')
console.log(`  repo root: ${repoRoot}`)
console.log(`  branch:    ${currentBranch()}`)
console.log(`  DSH_HOME:  ${dshHome}`)
if (dryRun) console.log('  mode: DRY RUN')
if (check || apply) {
  fetchUpstream()
  const n = upstreamCount()
  if (check) {
    console.log(`  upstream commits not merged into current branch: ${n}`)
    if (n === 0) console.log('  already up to date with origin/master')
    process.exit(0)
  }
  if (n === 0) {
    console.log('  already up to date with origin/master; refreshing local profile anyway')
    refreshProfile()
    process.exit(0)
  }
  const dirty = trackedDirtyCount()
  if (dirty > 0 && !dryRun) {
    console.error(`  abort: ${dirty} tracked file(s) are dirty; commit/stash before updating`)
    process.exit(1)
  }
  if (!dryRun) {
    console.log(`  merging origin/master (${n} new commit(s)) into ${currentBranch()} ...`)
    git(['merge', '--no-edit', 'origin/master'])
  } else {
    console.log('    [dry-run] git merge --no-edit origin/master')
  }
  console.log('  reinstalling dependencies ...')
  run('pnpm', ['--ignore-scripts', '--no-frozen-lockfile', 'install'])
  buildSelfuse()
  backupProfile()
  refreshProfile()
  restartDsh()
} else {
  console.log('Usage: node scripts/selfuse/update.mjs --check')
  console.log('       node scripts/selfuse/update.mjs --apply [--restart] [--no-build]')
}
