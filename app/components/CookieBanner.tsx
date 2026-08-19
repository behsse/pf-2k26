"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { TransitionLink } from "./TransitionLink"
import { REOPEN_EVENT, getConsent, setConsent } from "./cookieConsent"
import type { ConsentValue } from "./cookieConsent"

/** Consent banner, built to the CNIL's reading of the ePrivacy directive and
 * the GDPR:
 *
 * - It appears before any tracker runs and no tracker is wired to it yet, so
 *   an undecided visitor is tracked by nothing at all.
 * - "Refuser" and "Accepter" are the same size, shape and weight. A refusal
 *   button that is smaller, greyer or hidden behind a second screen is the
 *   dark pattern the CNIL fines people for.
 * - Nothing here reads as consent except a click on "Accepter": there is no
 *   close cross, and scrolling or navigating away leaves the question open.
 * - The banner is not modal and does not block the page — consent must be
 *   free, and holding the site hostage is not free.
 * - It can be brought back at any time from the footer, because withdrawing
 *   has to be as easy as giving (GDPR art. 7.3). */
export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // localStorage does not exist during SSR, so the decision of whether to show
  // the banner can only be made on the client. Rendering nothing on the first
  // pass also keeps the markup identical on both sides — no hydration mismatch.
  useEffect(() => {
    if (getConsent() === null) setIsVisible(true)

    const reopen = () => setIsVisible(true)
    window.addEventListener(REOPEN_EVENT, reopen)

    // Another tab may answer for this one; keep them in sync rather than
    // asking twice.
    const syncFromOtherTab = () => setIsVisible(getConsent() === null)
    window.addEventListener("storage", syncFromOtherTab)

    return () => {
      window.removeEventListener(REOPEN_EVENT, reopen)
      window.removeEventListener("storage", syncFromOtherTab)
    }
  }, [])

  useEffect(() => {
    const card = cardRef.current
    if (!card || !isVisible) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reducedMotion) return

    gsap.fromTo(
      card,
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", delay: 0.4 },
    )
  }, [isVisible])

  const decide = useCallback((value: ConsentValue) => {
    const card = cardRef.current
    setConsent(value)

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!card || reducedMotion) {
      setIsVisible(false)
      return
    }

    gsap.to(card, {
      y: 16,
      autoAlpha: 0,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => setIsVisible(false),
    })
  }, [])

  if (!isVisible) return null

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-text"
      aria-describedby="cookie-banner-text"
      className="fixed inset-x-0 bottom-0 z-70 flex justify-center px-4 pb-4 md:pb-6"
    >
      <div
        ref={cardRef}
        className="flex w-full max-w-3xl flex-col gap-5 rounded-2xl border border-white/12 bg-[#111111]/95 px-5 py-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-8 sm:px-7"
      >
        <p id="cookie-banner-text" className="text-sm leading-relaxed text-white/75">
          J&apos;aimerais mesurer l&apos;audience de ce site pour comprendre ce qui
          intéresse les visiteurs. Ces outils ne se déclenchent et ne déposent de
          cookies que si tu acceptes.{" "}
          <TransitionLink
            href="/confidentialite"
            label="Confidentialité"
            className="underline underline-offset-4 transition-colors hover:text-white"
          >
            Politique de confidentialité
          </TransitionLink>
          .
        </p>

        {/* Identical styling on both buttons on purpose: refusing has to be
          * exactly as easy, and as visible, as accepting. */}
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => decide("denied")}
            className="flex-1 cursor-pointer rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium transition-colors hover:border-white sm:flex-none"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => decide("granted")}
            className="flex-1 cursor-pointer rounded-full border border-white bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-80 sm:flex-none"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
