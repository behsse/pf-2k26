const SITE_READY_EVENT = "site-ready"

let ready = false

/** Set while a page transition is covering the screen. The incoming page mounts
 * underneath that cover, so anything that plays "as soon as it exists" would
 * play where nobody can see it. */
let entranceHeld = false

/** Callbacks that asked to run while the cover was up, waiting for it to lift. */
let heldCallbacks: Array<() => void> = []

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

/** Called by the page transition as soon as a navigation starts, before the new
 * route is pushed, so the incoming page's entrance animations are already held
 * by the time its components mount. */
export function holdEntrance() {
  entranceHeld = true
}

/** Called as the cover starts lifting — the same moment the loader picks to
 * release its own reveal. Waiting for the cover to be fully gone would leave
 * the page sitting frozen through the whole lift; releasing here means the
 * animations are already under way as the page comes into view. */
export function releaseEntrance() {
  if (!entranceHeld && heldCallbacks.length === 0) return

  entranceHeld = false
  const callbacks = heldCallbacks
  heldCallbacks = []
  for (const callback of callbacks) callback()
}

/** The signal for anything that animates in on arrival rather than on scroll.
 *
 * It answers "is this page actually on screen yet", which has two different
 * answers depending on how the visitor got here: on a cold load the loader
 * decides, and on an in-site navigation the transition cover does. Using
 * `onSiteReady` alone was right for the first case and wrong for the second —
 * once the site had been marked ready, every later page fired its entrance
 * instantly, behind the cover, and was already finished by the time the cover
 * lifted. */
export function onEntranceReady(callback: () => void) {
  if (entranceHeld) {
    heldCallbacks.push(callback)
    return () => {
      heldCallbacks = heldCallbacks.filter((held) => held !== callback)
    }
  }

  return onSiteReady(callback)
}
