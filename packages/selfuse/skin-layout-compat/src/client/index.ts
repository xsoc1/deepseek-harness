import type { Context } from '@deepseek-ai/cordis'

/** Cordis loader identity for the browser-side compatibility leaf. */
export const name = '@dsh-selfuse/skin-layout-compat'

/** No application service is needed to mark the shell's existing DOM. */
export const inject = []

interface AttributeClaim {
  readonly element: Element
  readonly attribute: string
  readonly value: string
}

/**
 * Provide only the layout attributes consumed by retained Skin Center assets.
 * Existing attributes belong to their original producer and are never changed.
 * @param ctx - Plugin fiber owning the observer, pending frame and attributes.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => {
    const claims: AttributeClaim[] = []
    let pendingFrame: number | undefined
    let live = true
    const mark = (element: Element, attribute: string, value: string): void => {
      if (element.hasAttribute(attribute)) return
      element.setAttribute(attribute, value)
      claims.push({ element, attribute, value })
    }
    const update = (): void => {
      for (const [selector, pane] of [
        ['[class*="sidebarCol"]', 'sidebar'],
        ['[class*="centerCol"]', 'conversation'],
        ['[class*="detailsCol"]', 'details'],
      ]) {
        if (selector === undefined || pane === undefined) continue
        for (const element of document.querySelectorAll(selector)) {
          mark(element, 'data-pane', pane)
          if (pane === 'sidebar' && element.parentElement !== null) {
            mark(element.parentElement, 'data-dsh-frame', '')
          }
        }
      }
      // Removed React subtrees do not need to stay strongly referenced.
      for (let index = claims.length - 1; index >= 0; index -= 1) {
        const claim = claims[index]
        if (claim === undefined || claim.element.isConnected) continue
        if (claim.element.getAttribute(claim.attribute) === claim.value) {
          claim.element.removeAttribute(claim.attribute)
        }
        claims.splice(index, 1)
      }
    }
    const observer = new MutationObserver(() => {
      if (pendingFrame !== undefined || !live) return
      pendingFrame = window.requestAnimationFrame(() => {
        pendingFrame = undefined
        if (live) update()
      })
    })
    update()
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      live = false
      observer.disconnect()
      if (pendingFrame !== undefined) window.cancelAnimationFrame(pendingFrame)
      for (const claim of claims) {
        if (claim.element.getAttribute(claim.attribute) === claim.value) {
          claim.element.removeAttribute(claim.attribute)
        }
      }
      claims.length = 0
    }
  }, 'skin-layout-compat: legacy layout attributes')
}
