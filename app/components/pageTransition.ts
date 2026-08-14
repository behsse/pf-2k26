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
  const previousOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = "hidden"
  try {
    await coverImpl(label)
    router.push(href)
    window.scrollTo(0, 0)
    await delay(SETTLE_DELAY_MS)
    await revealImpl()
  } catch {
    // Swallow — the finally block below guarantees the overlay is left in
    // a clean, non-blocking state regardless of what failed.
  } finally {
    document.documentElement.style.overflow = previousOverflow
    forceResetImpl()
    isTransitioning = false
  }
}
