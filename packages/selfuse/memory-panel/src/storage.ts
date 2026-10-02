/** Local Markdown collections with bounded reads and exclusive note creation. */
import { randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import { lstat, mkdir, open, readdir, unlink } from 'node:fs/promises'
import { basename, isAbsolute, join } from 'node:path'
import type { MemoryPanelDocument, MemoryPanelMatch, MemoryPanelNoteItem, MemoryPanelOps } from './types.ts'

type Kind = 'pages' | 'notes'
const DIRS = { pages: 'knowledge', notes: 'notes' } as const
const ID_RE = /^[A-Za-z0-9\u4e00-\u9fa5][A-Za-z0-9\u4e00-\u9fa5._-]{0,119}$/

async function directory(path: string): Promise<void> {
  await mkdir(path, { recursive: true, mode: 0o700 })
  const entry = await lstat(path)
  if (!entry.isDirectory() || entry.isSymbolicLink()) throw new Error('Memory store directories must not be links')
}

function titleOf(content: string, fallback: string): string {
  const lines = content.split(/\r?\n/)
  for (const line of lines.slice(0, 8)) {
    const title = /^title:\s*(.*)$/.exec(line)?.[1]?.trim()
    if (title) return title
    const heading = /^#\s+(.*)$/.exec(line)?.[1]?.trim()
    if (heading) return heading
  }
  return lines.find(line => line.trim())?.trim().slice(0, 60) || fallback
}

/**
 * Open a store without changing existing Markdown files or their permissions.
 * @param root - Absolute Host directory containing knowledge and notes.
 * @param maxFileBytes - Maximum complete file or newly composed note size.
 * @param searchLimit - Maximum matches returned across both collections.
 * @returns Operations bound to this directory; IO and validation failures reject.
 */
export async function createMemoryStore(root: string, maxFileBytes: number, searchLimit: number): Promise<MemoryPanelOps> {
  if (!isAbsolute(root)) throw new Error('Memory store must be an absolute Host path')
  await directory(root)
  await directory(join(root, DIRS.pages))
  await directory(join(root, DIRS.notes))

  async function collection(kind: Kind, signal?: AbortSignal): Promise<string> {
    signal?.throwIfAborted()
    await directory(root)
    const path = join(root, DIRS[kind])
    await directory(path)
    signal?.throwIfAborted()
    return path
  }

  async function pathFor(kind: Kind, id: string, signal?: AbortSignal): Promise<string> {
    if (!ID_RE.test(id)) throw new Error('Invalid memory file id')
    return join(await collection(kind, signal), `${id}.md`)
  }

  async function read(kind: Kind, id: string, signal?: AbortSignal): Promise<MemoryPanelDocument> {
    const path = await pathFor(kind, id, signal)
    const before = await lstat(path)
    if (!before.isFile() || before.isSymbolicLink()) throw new Error('Memory file must be a regular file, not a link')
    const flags = process.platform === 'win32' ? constants.O_RDONLY : constants.O_RDONLY | constants.O_NOFOLLOW
    const file = await open(path, flags)
    try {
      const stat = await file.stat()
      if (!stat.isFile() || stat.size > maxFileBytes) throw new Error('Memory file exceeds the configured byte limit')
      const buffer = Buffer.alloc(maxFileBytes + 1)
      let used = 0
      while (used < buffer.length) {
        signal?.throwIfAborted()
        const { bytesRead } = await file.read(buffer, used, buffer.length - used, used)
        if (bytesRead === 0) break
        used += bytesRead
      }
      if (used > maxFileBytes) throw new Error('Memory file exceeds the configured byte limit')
      signal?.throwIfAborted()
      const content = new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, used))
      return { id, name: titleOf(content, id), content }
    } finally { await file.close() }
  }

  async function list(kind: Kind, signal?: AbortSignal): Promise<MemoryPanelNoteItem[]> {
    const path = await collection(kind, signal)
    const rows: MemoryPanelNoteItem[] = []
    for (const entry of await readdir(path, { withFileTypes: true })) {
      signal?.throwIfAborted()
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue
      const id = basename(entry.name, '.md')
      if (!ID_RE.test(id)) continue
      const stat = await lstat(join(path, entry.name))
      if (!stat.isFile() || stat.isSymbolicLink()) continue
      rows.push({ id, name: id, size: stat.size, mtime: stat.mtimeMs })
    }
    rows.sort(kind === 'pages' ? (a, b) => a.id.localeCompare(b.id) : (a, b) => b.mtime - a.mtime || a.id.localeCompare(b.id))
    return rows
  }

  return {
    async status(signal) {
      const pages = await list('pages', signal)
      const notes = await list('notes', signal)
      return { store: root, counts: { pages: pages.length, notes: notes.length },
        bytes: [...pages, ...notes].reduce((total, file) => total + file.size, 0) }
    },
    async pages(signal) {
      const items = []
      for (const row of await list('pages', signal)) {
        const document = await read('pages', row.id, signal)
        items.push({ id: row.id, name: document.name, size: row.size })
      }
      return { items }
    },
    async page(id, signal) { return { page: await read('pages', id, signal) } },
    async notes(limit, offset, signal) {
      if (!Number.isInteger(limit) || limit < 1 || limit > 500 || !Number.isInteger(offset) || offset < 0 || offset > 100000) {
        throw new Error('Notes require limit 1..500 and offset 0..100000')
      }
      const rows = await list('notes', signal)
      const items = []
      for (const row of rows.slice(offset, offset + limit)) {
        const document = await read('notes', row.id, signal)
        items.push({ ...row, name: document.name })
      }
      return { items, total: rows.length, limit, offset }
    },
    async note(id, signal) { return { note: await read('notes', id, signal) } },
    async search(query, signal) {
      const needle = query.trim().toLowerCase()
      if (needle.length > 1024) throw new Error('Search text must not exceed 1024 characters')
      const results: MemoryPanelMatch[] = []
      if (!needle) return { results }
      for (const kind of ['pages', 'notes'] as const) {
        for (const row of await list(kind, signal)) {
          const document = await read(kind, row.id, signal)
          const contentAt = document.content.toLowerCase().indexOf(needle)
          if (contentAt === -1 && !document.name.toLowerCase().includes(needle)) continue
          const start = Math.max(0, contentAt - 40)
          const end = Math.min(document.content.length, Math.max(0, contentAt) + needle.length + 100)
          const snippet = `${start ? '…' : ''}${document.content.slice(start, end).replace(/\r?\n/g, ' ')}${end < document.content.length ? '…' : ''}`
          results.push({ id: row.id, kind: kind === 'pages' ? 'page' : 'note', name: document.name, snippet })
          if (results.length >= searchLimit) return { results }
        }
      }
      return { results }
    },
    async saveNote(title, text, signal) {
      const heading = title.trim()
      const body = text.trim()
      if (!body) throw new Error('Note content must not be empty')
      if (/[\r\n]/.test(heading)) throw new Error('Note title must be one line')
      const content = heading ? `# ${heading}\n\n${body}\n` : `${body}\n`
      if (Buffer.byteLength(content, 'utf8') > maxFileBytes) throw new Error('Note exceeds the configured byte limit')
      const slug = (heading || body.slice(0, 20)).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'note'
      const stamp = new Date().toISOString().replace(/[^0-9]/g, '')
      const id = `${stamp}-${slug}-${randomUUID()}`
      const path = await pathFor('notes', id, signal)
      signal?.throwIfAborted()
      const file = await open(path, 'wx', 0o600)
      let committed = false
      try {
        signal?.throwIfAborted()
        await file.writeFile(content, 'utf8')
        signal?.throwIfAborted()
        committed = true
      } finally {
        await file.close()
        if (!committed) await unlink(path)
      }
      return { id, name: titleOf(content, id), path }
    },
  }
}
