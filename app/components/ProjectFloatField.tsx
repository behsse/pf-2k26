"use client"

import { useLayoutEffect, useRef } from "react"
import Image from "next/image"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { placeholderProjects } from "@/app/data/portfolio"

gsap.registerPlugin(ScrollTrigger)

/** Deterministic pseudo-random in 0..1. Seeded from the index so the INITIAL
 * layout is identical on server and client — Math.random there would reshuffle
 * between the two renders and break hydration. Once mounted, the roaming below
 * uses real randomness, which is safe because it only runs in an effect. */
function noise(index: number, salt: number) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

type Slot = { x: number; y: number; w: number }

/** Positions are GENERATED from a count rather than read from a fixed list — a
 * hardcoded set silently drops any project past its length once the portfolio
 * grows.
 *
 * Each sits on a ring around the viewport centre: spacing by angle keeps them
 * spread however many there are, and the ring's hollow middle is what keeps the
 * title clear without hand-picking coordinates. Radius and size are jittered
 * per index so the ring never reads as a circle. */
function buildSlots(count: number): Slot[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 + noise(index, 1) * 0.6
    // Rounded, because these end up in inline styles: React serialises a raw
    // float to full precision on the server but trims it on the client, and the
    // two strings not matching is a hydration mismatch.
    const round = (value: number) => Math.round(value * 100) / 100
    return {
      x: round(50 + Math.cos(angle) * (34 + noise(index, 2) * 14)),
      y: round(50 + Math.sin(angle) * (32 + noise(index, 3) * 14)),
      w: Math.round(88 + noise(index, 4) * 40),
    }
  })
}

const COUNT = placeholderProjects.length

/** Twice as many positions as thumbnails. A thumbnail relocates while hidden,
 * so there has to be somewhere free to go — with one slot each, every position
 * would already be taken and nothing could ever move. */
const SLOTS = buildSlots(COUNT * 2)

/** Thumbnails start on every other slot, leaving the rest open as targets. */
const INITIAL_SLOT = (index: number) => index * 2

const FADE_OUT = 0.7
const FADE_IN = 0.9
/** Seconds a thumbnail stays put before moving on. Randomised per cycle within
 * this range so the thumbnails never settle into a shared rhythm — the span is
 * wide on purpose, since a narrow one lets them creep back into step. */
const HOLD_MIN = 9
const HOLD_MAX = 20
/** Peak-to-peak pixels of the idle drift, before the per-item jitter that
 * scales each thumbnail's own share of it. */
const DRIFT_RANGE = 440

/** Thumbnails that each independently fade out, move somewhere else, and fade
 * back in — then all rush down to the bottom centre once you start scrolling,
 * reading as the scattered work gathering itself up before the ordered columns
 * arrive. */
export function ProjectFloatField() {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    // Resolved from the DOM rather than taken as a ref to the parent section:
    // React attaches a parent's ref AFTER its children's layout effects have
    // run, so reading one here finds null and the whole setup bails out.
    const trigger = root.closest("section")
    if (!trigger) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const items = gsap.utils.toArray<HTMLElement>("[data-float-item]", root)
    if (items.length === 0) return

    let roaming = true
    const occupied = new Set(items.map((_, index) => INITIAL_SLOT(index)))
    const currentSlot = items.map((_, index) => INITIAL_SLOT(index))

    const takeFreeSlot = (from: number) => {
      const free = SLOTS.map((_, index) => index).filter(
        (index) => index !== from && !occupied.has(index),
      )
      if (free.length === 0) return from
      return free[Math.floor(Math.random() * free.length)]
    }

    // Filled once the convergence tweens exist, further down. The roaming
    // trigger below closes over the array rather than the tweens themselves, so
    // it can invalidate them even though it is created first — and it MUST be
    // created first, since ScrollTrigger fires callbacks for an identical start
    // in creation order, and the invalidation has to land before the scrub
    // moves anything.
    const convergences: gsap.core.Tween[] = []

    const context = gsap.context(() => {
      items.forEach((item, index) => {
        const inner = item.firstElementChild as HTMLElement | null
        if (!inner) return

        // Continuous drift, on top of the relocation below. Without it a
        // thumbnail is completely still between moves — the field only twitches
        // when something happens to be changing place.
        //
        // It lives on the INNER element as a transform, leaving the outer
        // element's left/top free for the relocation and the scroll
        // convergence, so none of the three ever write the same property.
        //
        // x and y run on SEPARATE tweens of different durations so they fall
        // out of phase and trace a wandering loop; one tween for both would
        // only shuttle back and forth along a straight line.
        const driftX = (noise(index, 5) - 0.5) * DRIFT_RANGE
        const driftY = (noise(index, 6) - 0.5) * DRIFT_RANGE

        gsap.fromTo(
          inner,
          { x: -driftX / 2 },
          {
            x: driftX / 2,
            duration: 4.5 + noise(index, 8) * 3,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          },
        )
        gsap.fromTo(
          inner,
          { y: -driftY / 2 },
          {
            y: driftY / 2,
            duration: 6 + noise(index, 9) * 3.5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          },
        )

        // Each thumbnail drives its OWN loop, re-scheduled on completion with a
        // fresh random hold. A single shared timeline — however the phases were
        // spread — makes the field pulse in unison: all present, a run of
        // disappearances, all back. Independent loops of differing lengths
        // drift apart and stay apart.
        const step = () => {
          if (!roaming) return

          gsap
            .timeline({ onComplete: step })
            .to(inner, { opacity: 0, duration: FADE_OUT, ease: "power2.in" })
            .add(() => {
              // Checked again here, not just at the top of `step`: the guard up
              // there only stops the NEXT cycle from starting. A timeline
              // already mid-fade when the scroll begins would still run this
              // callback and move the thumbnail out from under the convergence.
              if (!roaming) return

              // Relocating happens while fully hidden, so the jump is never
              // seen — only the arrival somewhere new.
              const next = takeFreeSlot(currentSlot[index])
              occupied.delete(currentSlot[index])
              occupied.add(next)
              currentSlot[index] = next
              const slot = SLOTS[next]
              gsap.set(item, { left: `${slot.x}%`, top: `${slot.y}%`, width: slot.w })
            })
            .to(inner, { opacity: 1, duration: FADE_IN, ease: "power2.out" })
            .to({}, { duration: gsap.utils.random(HOLD_MIN, HOLD_MAX) })
        }

        // Staggered kick-off only; from here each loop keeps its own time.
        gsap.delayedCall(gsap.utils.random(0, HOLD_MAX), step)
      })

      ScrollTrigger.create({
        trigger,
        start: "top top",
        end: "+=70%",
        // Roaming has to stop before the convergence runs: both write the
        // element's position, and a thumbnail relocating mid-scroll would jump
        // out of its converging path.
        onEnter: () => {
          roaming = false
          // The convergence tweens recorded their starting left/top when they
          // were BUILT, on page load. Every relocation since then was written
          // with gsap.set behind their backs, so scrubbing from those stale
          // values yanks the thumbnail back to the slot it held at setup before
          // it starts descending. Invalidating here drops the recorded values,
          // and the tween re-reads the position the thumbnail is actually in.
          convergences.forEach((tween) => tween.invalidate())
        },
        onLeaveBack: () => {
          roaming = true
          items.forEach((item, index) => {
            const inner = item.firstElementChild as HTMLElement | null
            if (inner) gsap.delayedCall(gsap.utils.random(0, 2), () => {
              if (!roaming) return
              gsap.to(inner, { opacity: 1, duration: FADE_IN })
            })
          })
        },
      })

      items.forEach((item) => {
        convergences.push(
          gsap.to(item, {
            left: "50%",
            top: "92%",
            scale: 0.35,
            opacity: 0,
            ease: "power2.in",
            scrollTrigger: {
              trigger,
              start: "top top",
              end: "+=70%",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }),
        )
      })
    }, root)

    return () => {
      roaming = false
      context.revert()
    }
  }, [])

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {placeholderProjects.map((project, index) => {
        const slot = SLOTS[INITIAL_SLOT(index)]
        return (
          <div
            key={project.id}
            data-float-item
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: slot.w }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px]">
              <Image src={project.image} alt="" fill sizes="140px" className="object-cover" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
