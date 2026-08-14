const SITE_READY_EVENT = "site-ready"

let ready = false

/** Signals that the loader has started revealing the page. Elements that
 * are visible immediately (Header, fixed Footer) can't rely on scroll
 * position to know when to animate in — they need this instead. */
export function markSiteReady() {
  if (ready) return
  ready = true
  window.dispatchEvent(new Event(SITE_READY_EVENT))
}

export function onSiteReady(callback: () => void) {
  if (ready) {
    callback()
    return () => {}
  }

  window.addEventListener(SITE_READY_EVENT, callback, { once: true })
  return () => window.removeEventListener(SITE_READY_EVENT, callback)
}
