"use client"

import { useLayoutEffect, useRef } from "react"
import type { ReactNode, RefObject } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { onEntranceReady } from "./siteReady"

gsap.registerPlugin(ScrollTrigger)

type RevealTextProps = {
  children: ReactNode
  className?: string
  delay?: number
  /** "scroll" (default) plays the first time the element scrolls into
   * view. "load" plays once, right as the loader reveals the page — for
   * anything visible immediately (Header), whose position is already
   * "in view" before any scroll happens. */
  trigger?: "scroll" | "load"
  /** Only for trigger="scroll": watch this element's position instead of
   * the mask's own. Needed when the mask lives inside a `position: fixed`
   * ancestor (the Footer) — a fixed box's rect never changes with scroll,
   * so ScrollTrigger can't tell from it when the element actually becomes
   * visible. Point this at the normal-flow spacer that stands in for the
   * fixed footer's document position instead. */
  triggerElement?: RefObject<HTMLElement | null>
}

/** Line-mask reveal, same technique as noth.in: the content sits inside an
 * overflow-hidden mask, offset below it, and slides up into place. */
export function RevealText({
  children,
  className,
  delay = 0,
  trigger = "scroll",
  triggerElement,
}: RevealTextProps) {
  const maskRef = useRef<HTMLSpanElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const mask = maskRef.current
    const inner = innerRef.current
    if (!mask || !inner) return

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reducedMotionQuery.matches) return

    gsap.set(inner, { yPercent: 100, opacity: 0 })

    const play = () => {
      gsap.to(inner, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        delay,
        ease: "power3.out",
      })
    }

    if (trigger === "load") {
      // Not onSiteReady: that only knows about the first load. Arriving from
      // another page, the entrance has to wait for the transition cover to
      // start lifting instead, or it plays hidden behind it.
      const cancel = onEntranceReady(play)
      return cancel
    }

    const scrollTriggerTarget = triggerElement?.current ?? mask

    const context = gsap.context(() => {
      gsap.to(inner, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scrollTriggerTarget,
          start: "top 88%",
          once: true,
        },
      })
    })

    return () => context.revert()
  }, [delay, trigger, triggerElement])

  return (
    <span ref={maskRef} className={`inline-block overflow-hidden ${className ?? ""}`}>
      <span ref={innerRef} className="inline-block">
        {children}
      </span>
    </span>
  )
}
