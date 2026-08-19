"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/** Circular scroll hint: the arrow eases down from above, holds at the centre
 * of the ring, then eases out of the bottom (see the keyframes in globals.css).
 * The ring clips it, which is what sells the "passes through" feel.
 *
 * It fades away as soon as the page starts moving — its whole job is to prompt
 * a scroll that has not happened yet, so leaving it over the columns would be
 * both redundant and in the way. */
export function ScrollCue({
  className = "",
  tone = "light",
}: {
  className?: string
  /** "light" for the cue drawn in white on a dark page, "dark" for black on a
   * light one. An explicit prop rather than letting `className` override the
   * colours: which of two same-property utilities wins comes down to their
   * order in the generated stylesheet, not the order they are written in. */
  tone?: "light" | "dark"
}) {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    // Resolved from the DOM, not a ref passed down from the section: a parent's
    // ref is still null while its children's layout effects run.
    const trigger = root.closest("section")
    if (!trigger) return

    const context = gsap.context(() => {
      gsap.to(root, {
        opacity: 0,
        y: 20,
        ease: "none",
        scrollTrigger: {
          trigger,
          start: "top top",
          end: "+=25%",
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      })
    }, root)

    return () => context.revert()
  }, [])

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border ${
        tone === "dark" ? "border-black/25" : "border-white/25"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`scroll-cue-arrow h-[18px] w-[18px] ${
          tone === "dark" ? "text-black/70" : "text-white/80"
        }`}
      >
        <path d="M12 5v14" />
        <path d="m19 12-7 7-7-7" />
      </svg>
    </div>
  )
}
