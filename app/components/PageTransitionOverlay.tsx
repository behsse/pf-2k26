"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { registerTransition } from "./pageTransition"

const STRIPE_COUNT = 5
const STRIPE_STAGGER_SPAN = 0.5
const STRIPE_DURATION = 0.65
// Belt-and-suspenders: if GSAP's onComplete somehow never fires (a tween
// getting killed mid-flight by an overlapping call, a stalled tab), this
// guarantees cover/reveal still resolve instead of leaving
// navigateWithTransition's own try/finally as the only way out.
const ANIMATION_TIMEOUT_MS = 1500

/** How far into the lift the incoming page is allowed to start animating.
 * Late enough that the bands are mostly out of the way and the entrance is
 * actually watchable, early enough that the page is not sitting frozen once
 * the last band clears. */
const REVEAL_RELEASE_RATIO = 0.50

/** Full-page black/white stripe wipe between routes — same technique as the
 * hero→about transition-stripes, just covering the whole viewport and
 * driven by navigation instead of scroll. TransitionLink calls into this
 * via pageTransition.ts (cover → router.push → settle → reveal). */
export function PageTransitionOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const stripeRefs = useRef<Array<HTMLDivElement | null>>([])
  const labelRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const stripes = stripeRefs.current.filter((el): el is HTMLDivElement => el !== null)
    if (stripes.length === 0) return
    gsap.set(stripes, { scaleY: 0, transformOrigin: "50% 100%" })
  }, [])

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    const getElements = () => {
      const overlay = overlayRef.current
      const stripes = stripeRefs.current.filter((el): el is HTMLDivElement => el !== null)
      const labelEl = labelRef.current
      if (!overlay || stripes.length === 0 || !labelEl) return null
      return { overlay, stripes, labelEl }
    }

    const withAnimationTimeout = (run: (resolve: () => void) => void) =>
      new Promise<void>((resolve) => {
        let settled = false
        const finish = () => {
          if (settled) return
          settled = true
          resolve()
        }
        window.setTimeout(finish, ANIMATION_TIMEOUT_MS)
        run(finish)
      })

    const cover = (label: string) =>
      withAnimationTimeout((resolve) => {
        const elements = getElements()
        if (!elements) {
          resolve()
          return
        }
        const { overlay, stripes, labelEl } = elements

        gsap.killTweensOf([...stripes, labelEl])
        gsap.set(overlay, { pointerEvents: "auto" })
        labelEl.textContent = `[ ${label} ]`

        if (reducedMotionQuery.matches) {
          gsap.set(stripes, { scaleY: 1 })
          gsap.set(labelEl, { opacity: 1 })
          resolve()
          return
        }

        gsap.set(labelEl, { opacity: 0 })
        // Bottom-fixed: each band grows upward out of the screen's bottom edge.
        gsap.set(stripes, { transformOrigin: "50% 100%" })
        const timeline = gsap.timeline({ onComplete: resolve })
        // Same cascade as the About→Projects scroll wipe: the bottom band
        // starts growing first, the top band last, so the cover rises up
        // the screen in a diagonal stagger instead of a flat curtain.
        stripes.forEach((stripe, index) => {
          const reverseIndex = STRIPE_COUNT - 1 - index
          const start = STRIPE_STAGGER_SPAN * (reverseIndex / (STRIPE_COUNT - 1))
          timeline.to(
            stripe,
            { scaleY: 1, duration: STRIPE_DURATION, ease: "power3.inOut" },
            start,
          )
        })
        timeline.to(labelEl, { opacity: 1, duration: 0.3 }, "-=0.25")
      })

    /** `onMostlyCleared` fires partway through the lift rather than at either
      * end of it, which is what lets the incoming page's entrance animations
      * start while the last bands are still sliding off. */
    const reveal = (onMostlyCleared?: () => void) =>
      withAnimationTimeout((resolve) => {
        const elements = getElements()
        if (!elements) {
          onMostlyCleared?.()
          resolve()
          return
        }
        const { overlay, stripes, labelEl } = elements

        gsap.killTweensOf([...stripes, labelEl])

        if (reducedMotionQuery.matches) {
          gsap.set(stripes, { scaleY: 0 })
          gsap.set(labelEl, { opacity: 0 })
          gsap.set(overlay, { pointerEvents: "none" })
          onMostlyCleared?.()
          resolve()
          return
        }

        // Top-fixed: each band now shrinks with its top edge held in place,
        // so the visible remainder recedes upward — same bottom-to-top
        // sweep direction as the cover, just clearing instead of filling.
        gsap.set(stripes, { transformOrigin: "50% 0%" })

        const timeline = gsap.timeline({
          onComplete: () => {
            gsap.set(overlay, { pointerEvents: "none" })
            resolve()
          },
        })
        timeline.to(labelEl, { opacity: 0, duration: 0.2 })
        // Same cascade order as the cover: bottom band clears first, top
        // band last, keeping the sweep direction identical open vs close.
        stripes.forEach((stripe, index) => {
          const reverseIndex = STRIPE_COUNT - 1 - index
          const start = STRIPE_STAGGER_SPAN * (reverseIndex / (STRIPE_COUNT - 1))
          timeline.to(
            stripe,
            { scaleY: 0, duration: STRIPE_DURATION, ease: "power3.inOut" },
            start,
          )
        })

        // Read the duration only once the bands are in, then drop the callback
        // at a fraction of it. Inserting inside the existing span rather than
        // past its end, so this never stretches the animation.
        if (onMostlyCleared) {
          timeline.call(onMostlyCleared, undefined, timeline.duration() * REVEAL_RELEASE_RATIO)
        }
      })

    const forceReset = () => {
      const elements = getElements()
      if (!elements) return
      const { overlay, stripes, labelEl } = elements

      gsap.killTweensOf([...stripes, labelEl])
      gsap.set(stripes, { scaleY: 0 })
      gsap.set(labelEl, { opacity: 0 })
      gsap.set(overlay, { pointerEvents: "none" })
    }

    registerTransition(cover, reveal, forceReset)
  }, [])

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="transition-stripes pointer-events-none fixed inset-0 z-[200] flex flex-col"
    >
      {Array.from({ length: STRIPE_COUNT }, (_, index) => (
        <div
          key={index}
          ref={(el) => {
            stripeRefs.current[index] = el
          }}
          className="transition-stripe"
          style={{ backgroundColor: "#d9d9d9" }}
        />
      ))}
      <span
        ref={labelRef}
        className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium tracking-[0.3em] text-black uppercase"
      />
    </div>
  )
}
