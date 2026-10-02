/** Scoped theme-token styles owned by one panel activation. */
const CSS = `
[data-dsh-memory] { display:flex; flex-direction:column; gap:12px; max-width:860px; min-width:0; color:var(--dsw-alias-label-primary); }
[data-dsh-memory] .dsm-card { border:1px solid var(--dsw-alias-border); border-radius:10px; padding:12px 14px; background:var(--dsw-alias-bg-layer-1); }
[data-dsh-memory] .dsm-head, [data-dsh-memory] .dsm-row { display:flex; align-items:center; flex-wrap:wrap; gap:8px; }
[data-dsh-memory] .dsm-head { justify-content:space-between; margin-bottom:8px; }
[data-dsh-memory] h3 { margin:0; font-size:14px; }
[data-dsh-memory] dl { display:grid; grid-template-columns:auto 1fr; gap:4px 12px; margin:8px 0 0; font-size:13px; }
[data-dsh-memory] dd { margin:0; overflow-wrap:anywhere; }
[data-dsh-memory] dt, [data-dsh-memory] .dsm-meta, [data-dsh-memory] .dsm-empty { color:var(--dsw-alias-label-tertiary); }
[data-dsh-memory] input, [data-dsh-memory] textarea, [data-dsh-memory] button { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); border:1px solid var(--dsw-alias-border); border-radius:6px; padding:6px 8px; font-size:13px; min-width:0; }
[data-dsh-memory] input, [data-dsh-memory] textarea { width:100%; box-sizing:border-box; }
[data-dsh-memory] textarea { resize:vertical; }
[data-dsh-memory] button { cursor:pointer; }
[data-dsh-memory] button:disabled { opacity:.5; cursor:default; }
[data-dsh-memory] button[data-active=true] { border-color:var(--dsw-alias-primary); }
[data-dsh-memory] .dsm-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px; }
[data-dsh-memory] .dsm-item { width:100%; text-align:start; display:flex; flex-direction:column; overflow-wrap:anywhere; }
[data-dsh-memory] pre { white-space:pre-wrap; overflow-wrap:anywhere; max-height:520px; overflow:auto; font-size:12px; }
`
/**
 * Install styles without reusing another activation's element.
 * @returns Disposer removing only the element created here.
 */
export function installMemoryStyles(): () => void {
  const element = document.createElement('style')
  element.dataset.dshMemory = ''
  element.textContent = CSS
  document.head.append(element)
  return () => { element.remove() }
}
