"use client"

import { useEffect, useRef } from "react"
import type { RefObject } from "react"
import { NavFluidOverlay } from "./navFluidOverlay"
import { LOGO_PATHS, LOGO_VIEWBOX } from "./LogoMark"
import { measureFontAscent } from "./textBake"

const REVEAL_COLOR = "#ffffff"

type NavFluidMaskProps = {
  navRef: RefObject<HTMLElement | null>
  logoRef: RefObject<HTMLElement | null>
  menuButtonRef: RefObject<HTMLElement | null>
  menuTextRef: RefObject<HTMLElement | null>
  barRefs: RefObject<Array<HTMLElement | null>>
  ctaButtonRef: RefObject<HTMLElement | null>
  ctaTextRef: RefObject<HTMLElement | null>
  isMenuOpen: boolean
}

export function NavFluidMask({
  navRef,
  logoRef,
  menuButtonRef,
  menuTextRef,
  barRefs,
  ctaButtonRef,
  ctaTextRef,
  isMenuOpen,
}: NavFluidMaskProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isMenuOpenRef = useRef(isMenuOpen)
  isMenuOpenRef.current = isMenuOpen

  useEffect(() => {
    const canvas = canvasRef.current
    const nav = navRef.current
    if (!canvas || !nav) return

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reducedMotionQuery.matches) return

    let overlay: NavFluidOverlay | null = null
    try {
      overlay = new NavFluidOverlay(canvas, {
        isSuspended: () => isMenuOpenRef.current,
        drawReveal: (ctx, width, height) => {
          ctx.clearRect(0, 0, width, height)
          const containerRect = nav.getBoundingClientRect()

          const logo = logoRef.current
          if (logo) {
            const rect = logo.getBoundingClientRect()
            if (rect.width > 0) {
              const scale = rect.width / LOGO_VIEWBOX.width
              ctx.save()
              ctx.translate(rect.left - containerRect.left, rect.top - containerRect.top)
              ctx.scale(scale, scale)
              ctx.fillStyle = REVEAL_COLOR
              const path = new Path2D()
              LOGO_PATHS.forEach((d) => path.addPath(new Path2D(d)))
              ctx.fill(path)
              ctx.restore()
            }
          }

          const menuButton = menuButtonRef.current
          const menuText = menuTextRef.current
          if (menuButton && menuText) {
            const rect = menuButton.getBoundingClientRect()
            if (rect.width > 0) {
              const buttonStyle = getComputedStyle(menuButton)
              const textStyle = getComputedStyle(menuText)
              // Menu's resting fill is the contrast color, text/icon are
              // current — the hover reveal is the inverted swap of that.
              const invertedFill = buttonStyle.color
              const invertedText = buttonStyle.backgroundColor

              const borderWidth = parseFloat(buttonStyle.borderTopWidth) || 1

              ctx.beginPath()
              ctx.roundRect(
                rect.left - containerRect.left,
                rect.top - containerRect.top,
                rect.width,
                rect.height,
                rect.height / 2,
              )
              ctx.fillStyle = invertedFill
              ctx.fill()
              ctx.strokeStyle = invertedText
              ctx.lineWidth = borderWidth
              ctx.stroke()

              const textRect = menuText.getBoundingClientRect()
              const fontSize = parseFloat(textStyle.fontSize)
              if (fontSize && textRect.width > 0) {
                ctx.font = `${textStyle.fontWeight} ${fontSize}px ${textStyle.fontFamily}`
                ctx.fillStyle = invertedText
                ctx.textAlign = "left"
                ctx.textBaseline = "alphabetic"
                const ascent = measureFontAscent(ctx, fontSize)
                ctx.fillText(
                  menuText.textContent ?? "",
                  textRect.left - containerRect.left,
                  textRect.top - containerRect.top + ascent,
                )
              }

              barRefs.current?.forEach((bar) => {
                if (!bar) return
                const barRect = bar.getBoundingClientRect()
                if (barRect.width === 0 || barRect.height === 0) return
                ctx.fillStyle = invertedText
                ctx.fillRect(
                  barRect.left - containerRect.left,
                  barRect.top - containerRect.top,
                  barRect.width,
                  barRect.height,
                )
              })
            }
          }

          const ctaButton = ctaButtonRef.current
          const ctaText = ctaTextRef.current
          if (ctaButton && ctaText) {
            const rect = ctaButton.getBoundingClientRect()
            if (rect.width > 0) {
              const buttonStyle = getComputedStyle(ctaButton)
              const textStyle = getComputedStyle(ctaText)
              // The overlay shows the swapped state: current text color becomes the fill,
              // current background becomes the text — a true color inversion of the pill.
              const invertedFill = textStyle.color
              const invertedText = buttonStyle.backgroundColor

              ctx.beginPath()
              ctx.roundRect(
                rect.left - containerRect.left,
                rect.top - containerRect.top,
                rect.width,
                rect.height,
                rect.height / 2,
              )
              ctx.fillStyle = invertedFill
              ctx.fill()

              const textRect = ctaText.getBoundingClientRect()
              const fontSize = parseFloat(textStyle.fontSize)
              if (fontSize && textRect.width > 0) {
                ctx.font = `${textStyle.fontWeight} ${fontSize}px ${textStyle.fontFamily}`
                ctx.fillStyle = invertedText
                ctx.textAlign = "left"
                ctx.textBaseline = "alphabetic"
                const ascent = measureFontAscent(ctx, fontSize)
                ctx.fillText(
                  ctaText.textContent ?? "",
                  textRect.left - containerRect.left,
                  textRect.top - containerRect.top + ascent,
                )
              }
            }
          }
        },
      })
    } catch {
      overlay = null
    }

    if (!overlay) return
    const activeOverlay = overlay

    const resize = () => {
      const bounds = nav.getBoundingClientRect()
      activeOverlay.resize(bounds.width, bounds.height)
    }

    const rebakeColors = () => {
      const bounds = nav.getBoundingClientRect()
      activeOverlay.rebake(bounds.width, bounds.height)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(nav)
    for (const el of [logoRef.current, menuButtonRef.current, ctaButtonRef.current]) {
      if (el) resizeObserver.observe(el)
    }
    resize()
    requestAnimationFrame(() => requestAnimationFrame(resize))

    document.fonts.ready.then(resize).catch(() => {})
    window.addEventListener("site-header-color-refresh", rebakeColors)
    window.addEventListener("header-color-changed", rebakeColors)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("site-header-color-refresh", rebakeColors)
      window.removeEventListener("header-color-changed", rebakeColors)
      activeOverlay.dispose()
    }
  }, [navRef, logoRef, menuButtonRef, menuTextRef, barRefs, ctaButtonRef, ctaTextRef])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 block h-full w-full"
      aria-hidden="true"
    />
  )
}
