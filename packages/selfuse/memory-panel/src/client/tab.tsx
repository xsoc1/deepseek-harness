/** Human-facing browsing, substring search and exclusive note creation. */
import { useEffect, useRef, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { MemoryPanelDocument, MemoryPanelItem, MemoryPanelMatch, MemoryPanelOps, MemoryPanelStatus } from '../types.ts'
import type {} from './index.ts'

type View = 'pages' | 'notes' | 'search'
/**
 * Render the settings tab with cancellation on view changes and unmount.
 * @param props - Native localized labels and the mounted store API.
 * @returns The panel; Markdown is shown as text, never executed as HTML.
 */
export function MemoryTab({ api, t }: PropsLocale<'settings.memoryPanel'> & { api: MemoryPanelOps }) {
  const [status, setStatus] = useState<MemoryPanelStatus | null>(null)
  const [failed, setFailed] = useState(false)
  const [view, setView] = useState<View>('pages')
  const [items, setItems] = useState<MemoryPanelItem[] | null>(null)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [selection, setSelection] = useState<{ kind: 'page' | 'note'; id: string } | null>(null)
  const [document, setDocument] = useState<MemoryPanelDocument | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MemoryPanelMatch[] | null>(null)
  const [busy, setBusy] = useState<'save' | 'search' | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const actions = useRef<AbortController | null>(null)
  const reload = () => { setTick(value => value + 1) }
  const errorText = (error: unknown) => error instanceof Error ? error.message : t('error')

  useEffect(() => {
    const controller = new AbortController()
    actions.current = controller
    return () => { controller.abort(); actions.current = null }
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    setFailed(false)
    setStatus(null)
    void api.status(controller.signal).then((value) => {
      if (!controller.signal.aborted) setStatus(value)
    }, () => { if (!controller.signal.aborted) setFailed(true) })
    return () => { controller.abort() }
  }, [api, tick])
  useEffect(() => {
    const controller = new AbortController()
    setItems(null)
    if (view !== 'search') {
      const request = view === 'pages' ? api.pages(controller.signal).then(value => ({ items: value.items, total: 0 })) : api.notes(50, offset, controller.signal)
      void request.then((value) => {
        if (controller.signal.aborted) return
        setItems(value.items)
        setTotal(value.total)
      }, (error: unknown) => {
        if (!controller.signal.aborted) { setItems([]); setBanner(errorText(error)) }
      })
    }
    return () => { controller.abort() }
  }, [api, view, offset, tick])
  useEffect(() => {
    const controller = new AbortController()
    setDocument(null)
    if (selection) {
      const request = selection.kind === 'note' ? api.note(selection.id, controller.signal) : api.page(selection.id, controller.signal)
      void request.then((value) => {
        if (!controller.signal.aborted) setDocument('note' in value ? value.note : value.page)
      }, (error: unknown) => { if (!controller.signal.aborted) setBanner(errorText(error)) })
    }
    return () => { controller.abort() }
  }, [api, selection])

  async function save() {
    const signal = actions.current?.signal
    if (!signal || busy) return
    setBusy('save')
    try {
      const result = await api.saveNote(title, text, signal)
      if (signal.aborted) return
      setTitle(''); setText(''); setBanner(t('saved', { n: result.name })); reload()
    } catch (error) { if (!signal.aborted) setBanner(errorText(error)) }
    finally { if (!signal.aborted) setBusy(null) }
  }
  async function search() {
    const signal = actions.current?.signal
    if (!signal || busy) return
    setBusy('search'); setResults(null)
    try {
      const result = await api.search(query, signal)
      if (!signal.aborted) setResults(result.results)
    } catch (error) { if (!signal.aborted) setBanner(errorText(error)) }
    finally { if (!signal.aborted) setBusy(null) }
  }
  function choose(next: View) { setView(next); setSelection(null); setBanner(null) }

  return <div data-dsh-memory="" aria-busy={busy !== null}>
    {status ? <section className="dsm-card"><div className="dsm-head"><h3>{t('statusTitle')}</h3>
      <span>{t('badgeOk')}</span><button type="button" onClick={reload} disabled={busy !== null}>{t('refresh')}</button></div>
    <dl><dt>{t('store')}</dt><dd>{status.store}</dd><dt>{t('countPages')}</dt><dd>{status.counts.pages}</dd>
      <dt>{t('countNotes')}</dt><dd>{status.counts.notes}</dd><dt>{t('bytes')}</dt><dd>{t('size', { n: status.bytes })}</dd></dl>
    </section> : failed ? <section className="dsm-card"><p role="alert">{t('error')}</p><button type="button" onClick={reload}>{t('retry')}</button></section> : <p>{t('loading')}</p>}
    {banner ? <p role="status">{banner}</p> : null}
    <section className="dsm-card"><div className="dsm-row">
      <button type="button" data-active={view === 'pages'} onClick={() => { choose('pages') }}>{t('viewPages')}</button>
      <button type="button" data-active={view === 'notes'} onClick={() => { choose('notes') }}>{t('viewNotes')}</button>
      <button type="button" data-active={view === 'search'} onClick={() => { choose('search') }}>{t('viewSearch')}</button></div>
    {selection ? <div><button type="button" onClick={() => { setSelection(null) }}>{t('back')}</button>
      <h3>{document?.name ?? t('pageDetail')}</h3><pre>{document ? document.content || t('emptyContent') : t('loading')}</pre></div>
      : view === 'search' ? <div><div className="dsm-row"><input type="text" value={query} placeholder={t('searchPlaceholder')}
        aria-label={t('searchPlaceholder')} onChange={(event) => { setQuery(event.target.value) }} />
      <button type="button" disabled={busy !== null || !query.trim()} onClick={() => { void search() }}>{t('searchBtn')}</button></div>
      {results === null ? <p className="dsm-empty">{t('searchEmpty')}</p> : results.length === 0 ? <p>{t('resultsNone')}</p>
        : <ul className="dsm-list">{results.map(item => <li key={`${item.kind}:${item.id}`}><button type="button" className="dsm-item"
          onClick={() => { setSelection({ kind: item.kind, id: item.id }) }}><strong>{item.name}</strong><span className="dsm-meta">{item.snippet}</span></button></li>)}</ul>}</div>
        : <div>{view === 'notes' ? <section className="dsm-card"><h3>{t('writeNote')}</h3>
          <input type="text" value={title} placeholder={t('writeTitlePlaceholder')} aria-label={t('writeTitlePlaceholder')}
            onChange={(event) => { setTitle(event.target.value) }} />
          <textarea rows={3} value={text} placeholder={t('writeTextPlaceholder')} aria-label={t('writeTextPlaceholder')}
            onChange={(event) => { setText(event.target.value) }} />
          <button type="button" disabled={busy !== null || !text.trim()} onClick={() => { void save() }}>{busy === 'save' ? t('loading') : t('save')}</button>
          <p>{t('noteTotal', { n: total })}</p></section> : null}
        {items === null ? <p>{t('loading')}</p> : items.length === 0 ? <p>{t(view === 'notes' ? 'notesEmpty' : 'pagesEmpty')}</p>
          : <ul className="dsm-list">{items.map(item => <li key={item.id}><button type="button" className="dsm-item"
            onClick={() => { setSelection({ kind: view === 'notes' ? 'note' : 'page', id: item.id }) }}><strong>{item.name}</strong><span className="dsm-meta">{item.id}</span></button></li>)}</ul>}
        {view === 'notes' ? <div className="dsm-row"><button type="button" disabled={offset === 0}
          onClick={() => { setOffset(value => Math.max(0, value - 50)) }}>{t('prev')}</button>
        <button type="button" disabled={offset + 50 >= total} onClick={() => { setOffset(value => value + 50) }}>{t('next')}</button></div> : null}</div>}
    </section>
  </div>
}
