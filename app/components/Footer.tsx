"use client"

import Link from "next/link"
import { useLayoutEffect, useRef, useState } from "react"
import { LogoMark } from "./LogoMark"
import { RevealText } from "./RevealText"

/** pamidordesign.com's actual technique: the footer is `position: fixed`,
 * always sitting at the same spot in the viewport, behind everything else
 * (lower z-index than every section before it, which all have opaque
 * backgrounds). Since a fixed element takes no space in document flow, a
 * spacer of matching height is rendered in its place so the page has real
 * scroll room — as the page scrolls through that room, the flowed content
 * above runs out and slides away, revealing the fixed footer that was
 * sitting there the whole time. No sticky, no transform, no scroll math.
 *
 * That same spacer also stands in as the scroll trigger for the text
 * reveals below: the footer's own content is inside the fixed box, whose
 * position never changes with scroll, so watching it directly would fire
 * immediately on mount — long before the footer is ever visually
 * uncovered. The spacer, being in normal flow, scrolls into view at
 * exactly the right moment instead. */
export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const footer = footerRef.current
    if (!footer) return

    const update = () => setHeight(footer.offsetHeight)
    update()

    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(footer)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <>
      <div ref={spacerRef} style={{ height }} aria-hidden="true" />
      <footer
        ref={footerRef}
        data-footer-section
        className="fixed inset-x-0 bottom-0 z-0 bg-[#050505] px-4 py-16 text-white md:px-8 md:py-24"
      >
        <div className="mx-auto flex max-w-[1600px] flex-col gap-16 md:gap-24">
          <RevealText triggerElement={spacerRef} className="w-20 md:w-28">
            <LogoMark className="h-auto w-20 md:w-28" />
          </RevealText>

          <div className="grid gap-12 border-t border-white/20 pt-8 md:grid-cols-2">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/50">
                <RevealText triggerElement={spacerRef} delay={0.1}>
                  Informations de contact
                </RevealText>
              </p>
              <Link href="mailto:behsse.pro@gmail.com" className="text-2xl tracking-[-0.03em] md:text-4xl">
                <RevealText triggerElement={spacerRef} delay={0.15}>
                  behsse.pro@gmail.com
                </RevealText>
              </Link>
            </div>
            <div className="flex gap-6 md:justify-end">
              <Link href="https://www.linkedin.com/in/sebastien-zielinski/" target="_blank" rel="noreferrer">
                <RevealText triggerElement={spacerRef} delay={0.2}>
                  LinkedIn
                </RevealText>
              </Link>
              <Link href="https://www.instagram.com/behsse/" target="_blank" rel="noreferrer">
                <RevealText triggerElement={spacerRef} delay={0.25}>
                  Instagram
                </RevealText>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
