/** Browser-safe fields for the optional human-facing Markdown panel. */

/** One bounded Markdown file. */
export interface MemoryPanelItem { id: string; name: string; size: number }
/** Note metadata ordered by modification time. */
export interface MemoryPanelNoteItem extends MemoryPanelItem { mtime: number }
/** Complete UTF-8 content of one permitted file. */
export interface MemoryPanelDocument { id: string; name: string; content: string }
/** Directory counts and total bytes, without file contents. */
export interface MemoryPanelStatus { store: string; counts: { pages: number; notes: number }; bytes: number }
/** Knowledge-page metadata. */
export interface MemoryPanelPages { items: MemoryPanelItem[] }
/** One knowledge page. */
export interface MemoryPanelPage { page: MemoryPanelDocument }
/** One note. */
export interface MemoryPanelNote { note: MemoryPanelDocument }
/** Paginated note metadata. */
export interface MemoryPanelNotes { items: MemoryPanelNoteItem[]; total: number; limit: number; offset: number }
/** One title or content substring match. */
export interface MemoryPanelMatch { id: string; kind: 'page' | 'note'; name: string; snippet: string }
/** Bounded search results. */
export interface MemoryPanelSearch { results: MemoryPanelMatch[] }
/** Successfully created note; the path uses the configured store. */
export interface MemoryPanelSaved { id: string; name: string; path: string }
/** Human panel operations; these do not inject files into model context. */
export interface MemoryPanelOps {
  status(this: void, signal?: AbortSignal): Promise<MemoryPanelStatus>
  pages(this: void, signal?: AbortSignal): Promise<MemoryPanelPages>
  page(this: void, id: string, signal?: AbortSignal): Promise<MemoryPanelPage>
  notes(this: void, limit: number, offset: number, signal?: AbortSignal): Promise<MemoryPanelNotes>
  note(this: void, id: string, signal?: AbortSignal): Promise<MemoryPanelNote>
  search(this: void, query: string, signal?: AbortSignal): Promise<MemoryPanelSearch>
  saveNote(this: void, title: string, text: string, signal?: AbortSignal): Promise<MemoryPanelSaved>
}
