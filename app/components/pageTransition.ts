import { getLenis } from "./lenisRegistry"

type CoverFn = (label: string) => Promise<void>
type RevealFn = () => Promise<void>
type ForceResetFn = () => void

let coverImpl: CoverFn | null = null
let revealImpl: RevealFn | null = null
let forceResetImpl: ForceResetFn | null = null
let isTransitioning = false

/** PageTransitionOverlay registers its imperative animation functions here
 * once mounted, so TransitionLink (which has no ref to the overlay) can
 * drive them without prop-drilling through the whole tree. */
export function registerTransition(cover: CoverFn, reveal: RevealFn, forceReset: ForceResetFn) {
  coverImpl = cover
  revealImpl = reveal
  forceResetImpl = forceReset
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type ScrollTarget = { scrollTo: (target: number | HTMLElement, options?: object) => void }

/** Puts the incoming page at the right place while the cover still hides it:
 * the top for a plain route, or the anchored section for a `#hash` link.
 *
 * Always `immediate` — an eased scroll would still be travelling when the
 * cover lifts, so the reveal would show the page sliding into position instead
 * of already being there. */
function scrollToTarget(href: string, lenis: ScrollTarget | null) {
  const hash = href.slice(href.indexOf("#"))
  const target = href.includes("#") ? document.querySelector<HTMLElement>(hash) : null

  if (target) {
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true })
    else target.scrollIntoView()
    return
  }

  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}

// The earlier version chained cover → router.push → "wait for usePathname()
// to change" → reveal. Two things made that fragile enough to hang for
// real: clicking a link back to the CURRENT route means the pathname never
// changes, so that wait had no way to resolve on its own; and nothing ever
// forced a reset if any step threw or a click landed mid-transition,
// leaving the (still pointer-events:auto) overlay permanently blocking the
// site. This version drops the pathname race for a flat delay, refuses to
// start a second transition while one's already running, and guarantees
// cleanup via try/finally no matter what goes wrong.
const SETTLE_DELAY_MS = 900

export async function navigateWithTransition(
  router: { push: (href: string) => void },
  href: string,
  label: string,
) {
  if (isTransitioning) return

  if (!coverImpl || !revealImpl || !forceResetImpl) {
    router.push(href)
    return
  }

  isTransitioning = true
  // The overlay's own pointer-events:auto stops clicks, but wheel/touch
  // scrolling isn't a click — without an explicit lock the user can keep
  // scrolling the outgoing page underneath the cover, so the reveal exposes
  // whatever mid-page position they scrolled to instead of the new page's top.
  // Lenis has to be stopped as well as the document: it drives scrolling from
  // its own wheel listener, so overflow:hidden alone would not hold it.
  const lenis = getLenis()
  const previousOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = "hidden"
  lenis?.stop()
  try {
    await coverImpl(label)
    router.push(href)
    // Positioned AFTER the settle delay, not before it: an anchored link needs
    // its target section to exist in the DOM before it can be measured, and on
    // a cross-page jump that section only arrives with the new page.
    await delay(SETTLE_DELAY_MS)
    scrollToTarget(href, lenis)
    await revealImpl()
  } catch {
    // Swallow — the finally block below guarantees the overlay is left in
    // a clean, non-blocking state regardless of what failed.
  } finally {
    document.documentElement.style.overflow = previousOverflow
    lenis?.start()
    forceResetImpl()
    isTransitioning = false
  }
}
