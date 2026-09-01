"use client"

import { useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"
import { LogoMark } from "./LogoMark"
import { markSiteReady } from "./siteReady"
import { getLenis } from "./lenisRegistry"

/** Seconds the counter takes to reach 100%.
 *
 * The whole curtain (this, plus the pause and the slide below) is dead time in
 * front of the page: nothing is painted behind it, so it lands directly on FCP,
 * LCP and Speed Index. At 2s the page measured 2.9s to first paint on a
 * throttled phone and the LARGEST element Lighthouse could find was the cookie
 * banner, everything else still being hidden. Shortened rather than removed:
 * the gesture still reads, it just stops costing three seconds. */
const LOAD_DURATION = 0.8

export function Loader() {
  const [isDone, setIsDone] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const numberRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const loader = loaderRef.current
    const bar = barRef.current
    const number = numberRef.current
    if (!loader || !bar || !number) return

    const html = document.documentElement
    const previousOverflow = html.style.overflow
    html.style.overflow = "hidden"
    // Lenis scrolls from its own wheel listener, so overflow:hidden alone
    // would not hold the page still behind the loader.
    getLenis()?.stop()

    const restoreScroll = () => {
      html.style.overflow = previousOverflow
      getLenis()?.start()
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reducedMotionQuery.matches) {
      restoreScroll()
      markSiteReady()
      setIsDone(true)
      return
    }

    const progress = { value: 0 }
    const timeline = gsap.timeline({
      onComplete: () => {
        const SLIDE_DURATION = 0.5
        const reveal = gsap.timeline({
          delay: 0.05,
          onStart: () => {
            loader.style.pointerEvents = "none"
          },
          onComplete: () => {
            restoreScroll()
            setIsDone(true)
          },
        })

        reveal.to(loader, {
          yPercent: -100,
          duration: SLIDE_DURATION,
          ease: "power4.inOut",
        })
        // Header's own reveal needs a moment of lead time to be mid-motion
        // (not just starting) once the curtain actually clears. Firing this at
        // the very end left a beat of blank page; firing it at the very start
        // raced the header's animation to finish while still hidden behind the
        // loader, making it invisible either way. The fraction is what matters,
        // so it survives the shortened durations unchanged.
        reveal.call(markSiteReady, undefined, SLIDE_DURATION * 0.35)
      },
    })

    timeline.to(progress, {
      value: 100,
      duration: LOAD_DURATION,
      ease: "power2.out",
      onUpdate: () => {
        const rounded = Math.round(progress.value)
        bar.style.width = `${rounded}%`
        number.textContent = `${rounded}%`
      },
    })

    return () => {
      timeline.kill()
      restoreScroll()
    }
  }, [])

  if (isDone) return null

  return (
    <div
      ref={loaderRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-white text-black"
    >
      <LogoMark className="h-auto w-16 md:w-20" />
      <div className="flex flex-col items-center gap-3">
        <span
          ref={numberRef}
          className="text-2xl font-medium tabular-nums tracking-[-0.02em]"
        >
          0%
        </span>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-black/15 md:w-56">
          <div ref={barRef} className="h-full w-0 bg-black" />
        </div>
      </div>
    </div>
  )
}
