"use client"

import { useLayoutEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const BLACK = "rgb(0, 0, 0)"
const WHITE = "rgb(255, 255, 255)"

type Rgb = { r: number; g: number; b: number }

const BG_COLOR_PATTERN = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/

/** Walks up from `element` until it finds an ancestor with a non-transparent
 * background, so the color read reflects what's actually painted there
 * (section backgrounds are set on the section itself, not every descendant). */
function findEffectiveBackground(element: Element | null): Rgb | null {
  let current = element
  while (current) {
    const match = getComputedStyle(current).backgroundColor.match(BG_COLOR_PATTERN)
    if (match) {
      const alpha = match[4] === undefined ? 1 : parseFloat(match[4])
      if (alpha > 0.5) {
        return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) }
      }
    }
    current = current.parentElement
  }
  return null
}

function isLight({ r, g, b }: Rgb) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.5
}

/** The hero→projects transition wipes in with `.transition-stripe` bands that
 * are `pointer-events: none` (so they don't block scrolling) — which also
 * makes them invisible to elementFromPoint, since hit-testing skips them
 * entirely. Check their real geometry directly so a stripe actually covering
 * the sample point is read instead of whatever sits behind it. A stripe's
 * scaleY(0)→scaleY(1) reveal is reflected in getBoundingClientRect() itself,
 * so an unrevealed stripe naturally fails this containment check. */
function findStripeBackground(sampleX: number, sampleY: number): Rgb | null {
  const stripes = document.querySelectorAll<HTMLElement>(".transition-stripe")
  for (const stripe of stripes) {
    const rect = stripe.getBoundingClientRect()
    if (sampleX < rect.left || sampleX > rect.right || sampleY < rect.top || sampleY > rect.bottom) {
      continue
    }
    const match = getComputedStyle(stripe).backgroundColor.match(BG_COLOR_PATTERN)
    if (match) {
      const alpha = match[4] === undefined ? 1 : parseFloat(match[4])
      if (alpha > 0.5) {
        return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) }
      }
    }
  }
  return null
}

export function HeaderColorController() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-scroll-root]")
    const header = document.querySelector<HTMLElement>("[data-site-header]")

    if (!root || !header) return

    let activeColor = ""

    const applyHeaderColor = (immediate = false) => {
      const menuIsOpen = header.dataset.menuOpen === "true"

      let color = BLACK
      let contrast = WHITE

      if (!menuIsOpen) {
        // Sample just BELOW the nav, in the actual page content — sampling
        // inside the nav's own box would hit the nav's own buttons (whose
        // background is `currentColor`, i.e. this very color), a feedback
        // loop that reads the header's last color instead of the page.
        const headerRect = header.getBoundingClientRect()
        const sampleX = window.innerWidth / 2
        const sampleY = Math.min(headerRect.bottom + 2, window.innerHeight - 1)
        const target = document.elementFromPoint(sampleX, sampleY)
        const bg =
          findStripeBackground(sampleX, sampleY) ??
          findEffectiveBackground(target) ??
          { r: 255, g: 255, b: 255 }
        const light = isLight(bg)
        color = light ? BLACK : WHITE
        contrast = light ? WHITE : BLACK
      }

      if (color === activeColor && !immediate) return
      activeColor = color

      const notify = () => window.dispatchEvent(new Event("header-color-changed"))

      gsap.to(header, {
        color,
        "--header-contrast-color": contrast,
        duration: immediate ? 0 : 0.22,
        ease: "power1.out",
        overwrite: true,
        onUpdate: notify,
        onComplete: notify,
      })
    }

    const context = gsap.context(() => {
      ScrollTrigger.create({
        id: "header-color-driver",
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: () => applyHeaderColor(),
        onRefresh: () => applyHeaderColor(true),
      })
    }, root)

    const refreshHeaderColor = () => applyHeaderColor(true)
    window.addEventListener("site-header-color-refresh", refreshHeaderColor)
    applyHeaderColor(true)

    return () => {
      window.removeEventListener("site-header-color-refresh", refreshHeaderColor)
      context.revert()
    }
  }, [])

  return null
}
