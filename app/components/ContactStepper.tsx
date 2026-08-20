"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"

type ContactStepperProps = {
  /** Zero-based index of the step being answered. Equals `total` on the recap,
   * which is what fills the rail all the way to its last marker. */
  index: number
  total: number
  /** Label of the forward button — "Suivant" during the flow, "Envoyer" on the
   * recap. */
  nextLabel: string
  nextDisabled?: boolean
  backLabel: string
  onBack: () => void
  onNext: () => void
}

const DURATION = 0.55

/** The header's own pill, at the size these controls need. */
const CONTROL_CLASS =
  "cursor-pointer rounded-full border px-5 py-2 text-sm transition-colors md:px-6"

/** The controls at the foot of the experience: a progress rail, then
 * `Retour · 01 / 06 · Suivant`, centred under the question.
 *
 * The rail is the one borrowed from `ProcessSteps` — a hairline that draws
 * itself left to right with a `+` at every boundary and an `×` riding the
 * leading edge. There it is driven by scroll; here it is driven by answers, one
 * marker per question cleared, but the vocabulary is deliberately identical. */
export function ContactStepper({
  index,
  total,
  nextLabel,
  nextDisabled = false,
  backLabel,
  onBack,
  onNext,
}: ContactStepperProps) {
  const lineRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLSpanElement>(null)
  const markerRefs = useRef<Array<HTMLSpanElement | null>>([])

  const progress = total === 0 ? 0 : Math.min(index / total, 1)

  useLayoutEffect(() => {
    const line = lineRef.current
    const head = headRef.current
    const markers = markerRefs.current.filter((marker): marker is HTMLSpanElement => marker !== null)

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const duration = reduceMotion ? 0 : DURATION

    if (line) gsap.to(line, { scaleX: progress, duration, ease: "power2.out", overwrite: true })
    if (head) {
      gsap.to(head, {
        left: `${progress * 100}%`,
        // The head is the "in progress" marker. Once the rail is complete the
        // final `+` underneath it is the one that stays.
        autoAlpha: progress >= 1 ? 0 : 1,
        duration,
        ease: "power2.out",
        overwrite: true,
      })
    }

    markers.forEach((marker, markerIndex) => {
      gsap.to(marker, {
        autoAlpha: markerIndex <= index ? 1 : 0.25,
        duration,
        ease: "power2.out",
        overwrite: true,
      })
    })
  }, [index, progress])

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <div className="relative h-4 w-full" aria-hidden="true">
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-black/12" />
        <div
          ref={lineRef}
          className="absolute left-0 top-1/2 h-px w-full origin-left -translate-y-1/2 scale-x-0 bg-black/45"
        />
        <div className="absolute inset-0 flex items-center justify-between">
          {/* One marker per boundary: both ends plus every gap between steps. */}
          {Array.from({ length: total + 1 }, (_, markerIndex) => (
            <span
              key={markerIndex}
              ref={(element) => {
                markerRefs.current[markerIndex] = element
              }}
              className="text-[10px] leading-none text-black/45"
            >
              +
            </span>
          ))}
        </div>
        <span
          ref={headRef}
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] leading-none text-black/60"
        >
          ×
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className={`${CONTROL_CLASS} border-black/20 text-black/60 hover:border-black/60 hover:text-black`}
        >
          {backLabel}
        </button>

        <p className="px-2 font-mono text-xs tracking-[0.16em] text-black/40 tabular-nums">
          {String(Math.min(index + 1, total)).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>

        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={`${CONTROL_CLASS} border-black bg-black font-medium text-white hover:bg-black/85 disabled:cursor-not-allowed disabled:border-black/15 disabled:bg-black/15 disabled:text-black/35`}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
