import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { removeFiles, renameBeside, validateArchiveEntries } from '../src/storage.ts'

it('deletes literal file names without shell expansion and rejects escaping names', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-backup-storage-'))
  try {
    await writeFile(join(root, 'a & b.tar.gz'), 'fixture')
    await writeFile(join(root, 'keep'), 'untouched')
    await removeFiles(['a & b.tar.gz'], root)
    expect(await readFile(join(root, 'keep'), 'utf8')).toBe('untouched')
    await expect(removeFiles(['../keep'], root)).rejects.toThrow('basename')
    await expect(removeFiles(['keep', '../escape'], root)).rejects.toThrow('basename')
    expect(await readFile(join(root, 'keep'), 'utf8')).toBe('untouched')
    const abort = new AbortController()
    abort.abort()
    await expect(removeFiles(['keep'], root, abort.signal)).rejects.toThrow()
    expect(await readFile(join(root, 'keep'), 'utf8')).toBe('untouched')
  } finally { await rm(root, { recursive: true, force: true }) }
})

it('never follows a symlink root or overwrites an existing aside directory', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-backup-aside-'))
  try {
    await mkdir(join(root, 'data'))
    await mkdir(join(root, 'aside'))
    await writeFile(join(root, 'data', 'note'), 'live fixture')
    await expect(renameBeside(root, 'data', 'aside')).rejects.toThrow('exists')
    expect(await readFile(join(root, 'data', 'note'), 'utf8')).toBe('live fixture')
    await symlink(join(root, 'data'), join(root, 'linked'), 'dir')
    await expect(removeFiles(['note'], join(root, 'linked'))).rejects.toThrow('symlink')
    await renameBeside(root, 'data', 'saved')
    expect(await readFile(join(root, 'saved', 'note'), 'utf8')).toBe('live fixture')
  } finally { await rm(root, { recursive: true, force: true }) }
})

it('rejects tar entries with parent traversal, backslashes, drive prefixes or another root', () => {
  validateArchiveEntries(['.dsh/', '.dsh/sessions/a'], '.dsh')
  for (const entry of ['.dsh/../escape', '.dsh/dir/../../escape', '.dsh\\escape', 'F:/.dsh/a', '/.dsh/a', 'another/a']) {
    expect(() =>{  validateArchiveEntries([entry], '.dsh') }).toThrow()
  }
})
