"use client"

import { useEffect, useRef, useState } from "react"
import { FluidTextReveal } from "./fluidTextReveal"
import { registerHeroFluidEngine, unregisterHeroFluidEngine } from "./heroFluidRegistry"
import { measureFontAscent } from "./textBake"
import { RevealText } from "./RevealText"
import { ScrollCue } from "./ScrollCue"

const REVEAL_BG = "#0a0a0a"
const REVEAL_TEXT_COLOR = "#ffffff"

const RELIEF_WEIGHTS = [400, 500, 700, 900]
const RELIEF_INTERVAL_MS = 1800

function AnimatedWeightWord({ word, weights, intervalMs }: { word: string; weights: number[]; intervalMs: number }) {
  const [weightIndex, setWeightIndex] = useState(0)
  const directionRef = useRef(1)
  const maxWeight = Math.max(...weights)

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reducedMotionQuery.matches) return

    const id = window.setInterval(() => {
      setWeightIndex((current) => {
        if (weights.length < 2) return current
        if (current === weights.length - 1) directionRef.current = -1
        else if (current === 0) directionRef.current = 1
        return current + directionRef.current
      })
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [weights, intervalMs])

  return (
    <>
      {/* The hidden reference reserves the widest weight's width in the grid
          cell, so the live word morphing on top never shifts neighboring text. */}
      <span className="relative inline-grid align-baseline text-center" aria-hidden="true">
        <span className="[grid-area:1/1] whitespace-nowrap opacity-0" style={{ fontWeight: maxWeight }}>
          {word}
        </span>
        <span
          className="[grid-area:1/1] whitespace-nowrap transition-[font-weight] duration-700 ease-in-out"
          style={{ fontWeight: weights[weightIndex] }}
        >
          {word}
        </span>
      </span>
      <span className="sr-only">{word}</span>
    </>
  )
}

type Align = "left" | "right" | "center"

function drawLabel(ctx: CanvasRenderingContext2D, el: HTMLElement | null, containerRect: DOMRect, color: string) {
  if (!el) return

  const rect = el.getBoundingClientRect()
  const style = getComputedStyle(el)
  const fontSize = parseFloat(style.fontSize)
  if (!fontSize || rect.width === 0) return

  const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2
  const align: Align = style.textAlign === "right" ? "right" : style.textAlign === "center" ? "center" : "left"
  const x =
    align === "right"
      ? rect.right - containerRect.left
      : align === "center"
        ? rect.left - containerRect.left + rect.width / 2
        : rect.left - containerRect.left
  const maxWidth = rect.width

  ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = "alphabetic"

  const words = (el.textContent ?? "").trim().split(/\s+/)
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)

  const ascent = measureFontAscent(ctx, fontSize)
  const blockHeight = lines.length * lineHeight
  const top = rect.top - containerRect.top + (rect.height - blockHeight) / 2
  lines.forEach((line, index) => {
    ctx.fillText(line, x, top + ascent + index * lineHeight)
  })
}

const Header = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = wordmarkRef.current
    const section = el?.parentElement
    if (!el || !section) return

    const fitWordmark = () => {
      const sectionStyle = getComputedStyle(section)
      const paddingX = parseFloat(sectionStyle.paddingLeft) + parseFloat(sectionStyle.paddingRight)
      const availableWidth = section.clientWidth - paddingX
      if (availableWidth <= 0) return

      const probeFontSize = 100
      el.style.fontSize = `${probeFontSize}px`
      const naturalWidth = el.getBoundingClientRect().width
      if (naturalWidth <= 0) return

      el.style.fontSize = `${(probeFontSize * availableWidth) / naturalWidth}px`
    }

    fitWordmark()
    const resizeObserver = new ResizeObserver(fitWordmark)
    resizeObserver.observe(section)
    document.fonts.ready.then(fitWordmark).catch(() => {})

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reducedMotionQuery.matches) return

    let engine: FluidTextReveal | null = null
    try {
      engine = new FluidTextReveal(canvas, {
        drawReveal: (ctx, width, height) => {
          ctx.fillStyle = REVEAL_BG
          ctx.fillRect(0, 0, width, height)
        },
      })
    } catch {
      engine = null
    }

    if (!engine) return
    const activeEngine = engine
    registerHeroFluidEngine(activeEngine, canvas)

    const resize = () => {
      const bounds = container.getBoundingClientRect()
      activeEngine.resize(bounds.width, bounds.height)
    }

    const onPointerMove = (event: PointerEvent) => {
      // The nav sits on top of the hero with a transparent background, so
      // any dye splatted while the cursor is over it would bleed straight
      // through the nav's empty gaps (unmasked, since only NavFluidMask's
      // own drawn shapes get the proper reveal clipping) — never register
      // it there in the first place.
      if ((event.target as Element | null)?.closest("[data-site-header]")) return
      activeEngine.updatePointer(event.clientX, event.clientY)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    document.fonts.ready.then(resize).catch(() => {})
    window.addEventListener("pointermove", onPointerMove)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("pointermove", onPointerMove)
      unregisterHeroFluidEngine(activeEngine)
      activeEngine.dispose()
    }
  }, [])

  return (
    <div ref={containerRef} className="relative h-full w-full bg-white">
      <section
        data-hero-overlay
        aria-labelledby="hero-title"
        className="hero-overlay absolute inset-0 z-20 flex flex-col justify-between px-4 pb-7 pt-40 mix-blend-difference text-white pointer-events-none md:px-8 md:pb-8"
      >
        
        <p
          ref={wordmarkRef}
          className="w-max whitespace-nowrap font-bold uppercase leading-[0.85] tracking-[-0.04em]"
        >
          <RevealText trigger="load">Behsse</RevealText>
        </p>

        <div className=" flex w-full items-end justify-between gap-8">
          <h1
            id="hero-title"
            className="max-w-4xl text-3xl font-medium leading-[0.92] tracking-[-0.055em] sm:text-4xl md:text-6xl"
          >
            <RevealText trigger="load" delay={0.06}>
              {"Je donne du "}
              <AnimatedWeightWord word="relief" weights={RELIEF_WEIGHTS} intervalMs={RELIEF_INTERVAL_MS} />
              {" aux idées qui méritent d’exister."}
            </RevealText>
          </h1>
          {/* The cue rides along with the label rather than sitting on its own:
            * both say the same thing, and splitting them would put two scroll
            * prompts in one corner. */}
          <div className="hidden shrink-0 items-center gap-3 pb-1 md:flex">
            <ScrollCue tone="light" />
            {/* flex + leading-none rather than a plain block: RevealText's mask
              * is an inline-block, and an inline-block sits on the text
              * baseline, which leaves descender space under it. That padding is
              * inside the paragraph's box, so centring the boxes still left the
              * glyphs sitting 6px low next to the ring. */}
            <p className="flex items-center font-light text-xs uppercase leading-none tracking-[0.18em]">
              <RevealText trigger="load" delay={0.12}>
                Défiler pour explorer
              </RevealText>
            </p>
          </div>
        </div>
      </section>

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 block h-full w-full"
        aria-hidden="true"
      />
    </div>
  )
}

export default Header
