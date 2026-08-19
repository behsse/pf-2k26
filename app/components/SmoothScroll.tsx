"use client"

import { useEffect } from "react"
import Lenis from "lenis"
// Required, not cosmetic: it sets `html.lenis, html.lenis body { height: auto }`.
// This layout puts `h-full` on <html>, which pins it to the viewport height —
// leaving ScrollTrigger measuring its start/end positions against a 900px
// document instead of the real one, so triggers further down never fire.
import "lenis/dist/lenis.css"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { setLenis } from "./lenisRegistry"

gsap.registerPlugin(ScrollTrigger)

/** Site-wide inertial scrolling: the page keeps gliding briefly after the wheel
 * stops instead of halting dead. Mounted once in the root layout so every route
 * inherits it.
 *
 * Lenis animates the real window scroll position, so anything already tied to
 * native scroll keeps working — the fixed-footer reveal, the sticky sections,
 * and every ScrollTrigger — provided ScrollTrigger is told to re-evaluate on
 * Lenis's own scroll events and both share one clock (below). Left on separate
 * loops they drift a frame apart and pinned sections visibly judder. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({
      duration: 1.05,
      // Exponential ease-out: quick to respond, with a long soft tail — the
      // "carries on a little after you stop" part.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Touch devices already have native inertia; doubling it up feels laggy.
      smoothWheel: true,
      touchMultiplier: 2,
    })

    setLenis(lenis)

    lenis.on("scroll", ScrollTrigger.update)

    // Drive Lenis from GSAP's ticker rather than its own rAF, so scroll
    // position and every scroll-driven animation are computed in the same
    // frame. gsap.ticker reports seconds; Lenis expects milliseconds.
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // Triggers created before this point measured the document while <html>
    // was still viewport-height, so their start/end positions are stale.
    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  return null
}
