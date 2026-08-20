"use client"

import { useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"

type MorphTextProps = {
  /** Change this and the component crossfades from the old wording to the new. */
  text: string
  className?: string
  /** Word-level stagger. Lower reads as one block dissolving, higher as a
   * sentence being written. Kept short on purpose: the cascade has to be
   * legible on a seven-word question without the last word arriving long after
   * the first. */
  stagger?: number
  /** Wording to dissolve out of on the very first render. Needed when the
   * component replaces something that was already on screen — without it the
   * first transition of its life would be a hard swap, since there is nothing
   * for it to morph out of. */
  morphFrom?: string
}

const OUT_DURATION = 0.26
const IN_DURATION = 0.34

/** A line of text that dissolves into its replacement **in place**.
 *
 * Unlike `RevealText`, which slides one line up behind a mask, both wordings
 * occupy the same box at once here: the outgoing words blur and fade out in a
 * left-to-right cascade while the incoming ones sharpen in on the same
 * cascade. For a beat in the middle the two sentences genuinely overlap, which
 * is the whole effect — the question does not leave and get replaced, it turns
 * into the next one.
 *
 * The outgoing copy is taken out of the layout (`absolute`) so the incoming one
 * alone decides how tall the block is; a two-line question replacing a one-line
 * question therefore grows the box immediately rather than mid-fade. */
export function MorphText({ text, className, stagger = 0.018, morphFrom }: MorphTextProps) {
  const [layers, setLayers] = useState({
    incoming: text,
    outgoing: (morphFrom ?? null) as string | null,
  })
  const incomingRef = useRef<HTMLSpanElement>(null)
  const outgoingRef = useRef<HTMLSpanElement>(null)

  // The last wording whose transition actually ran to completion.
  //
  // It has to be completion and not "started", because React invokes effects
  // twice on mount in development: marking the wording as handled on the way in
  // meant the second invocation bailed out, leaving the incoming words parked at
  // the `opacity: 0` its own killed timeline had just set. The question simply
  // never appeared.
  //
  // Seeded with the first wording when there is nothing to morph out of, so a
  // fresh mount stays still and lets the screen reveal it.
  const completedFor = useRef(morphFrom === undefined ? text : null)

  // Derived state rather than an effect: reacting to the prop in an effect
  // would paint one frame of the new text at full opacity before the animation
  // could set it to zero.
  if (text !== layers.incoming) {
    setLayers({ incoming: text, outgoing: layers.incoming })
  }

  useLayoutEffect(() => {
    const incoming = incomingRef.current
    if (!incoming) return
    if (completedFor.current === layers.incoming) return

    const settle = () => {
      completedFor.current = layers.incoming
      setLayers((current) => ({ ...current, outgoing: null }))
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle()
      return
    }

    const outgoing = outgoingRef.current
    const timeline = gsap.timeline()

    if (outgoing) {
      timeline.to(
        outgoing.querySelectorAll("[data-morph-word]"),
        { opacity: 0, filter: "blur(6px)", duration: OUT_DURATION, stagger, ease: "power2.in" },
        0,
      )
    }

    timeline.fromTo(
      incoming.querySelectorAll("[data-morph-word]"),
      { opacity: 0, filter: "blur(8px)", yPercent: 8 },
      {
        opacity: 1,
        filter: "blur(0px)",
        yPercent: 0,
        duration: IN_DURATION,
        stagger,
        ease: "power2.out",
      },
      // Starts before the old words are gone: the overlap is the effect.
      OUT_DURATION * 0.25,
    )

    // Dropping the outgoing copy from the tree releases its markup; leaving it
    // would stack one dead layer per question answered.
    timeline.call(settle)

    return () => {
      timeline.kill()
    }
  }, [layers, stagger])

  return (
    <span className={`relative block ${className ?? ""}`}>
      {layers.outgoing !== null && (
        <span ref={outgoingRef} aria-hidden="true" className="absolute inset-x-0 top-0 block">
          <Words text={layers.outgoing} />
        </span>
      )}
      <span ref={incomingRef} className="block">
        <Words text={layers.incoming} />
      </span>
    </span>
  )
}

/** Splits on spaces rather than characters: a per-character cascade on a long
 * question turns into noise, and words are also what a screen reader and a
 * line-break algorithm both expect to find. */
function Words({ text }: { text: string }) {
  const words = text.split(" ")

  return (
    <>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} data-morph-word className="inline-block whitespace-pre">
          {index < words.length - 1 ? `${word} ` : word}
        </span>
      ))}
    </>
  )
}
