"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { RevealText } from "./RevealText"
import { PROCESS_STEPS } from "../data/process"

gsap.registerPlugin(ScrollTrigger)

const STEP_COUNT = PROCESS_STEPS.length

/** Marker positions along the rail: one at each end plus one per boundary
 * between steps. */
const MARKER_COUNT = STEP_COUNT + 1

/** Extra viewports of scroll the sticky section holds on for — one per step,
 * plus one so the last step can be read before the pin releases. */
const SCROLL_VIEWPORTS = STEP_COUNT + 1

const TITLE_MUTED = "#c2c2c2"
const TITLE_ACTIVE = "#111111"

/** Scroll-driven walkthrough of the working method.
 *
 * On desktop the block sticks to the top of the viewport while the page keeps
 * scrolling underneath, and that scroll distance is what plays the reveal: each
 * step's label fades in ahead of its own turn, then its title lifts and darkens
 * with the paragraph behind it, while a rail draws itself left to right. The
 * rail's leading edge carries an "×" that turns into a "+" as it lands on each
 * boundary.
 *
 * Everything is scrubbed rather than fired once, so scrolling back up unwinds
 * it exactly the way it was built.
 *
 * On phones the same idea turns a quarter turn: steps stack, the rail runs down
 * the left gutter, and nothing sticks — hijacking a touch scroll to play an
 * animation sideways is a good way to make a page feel broken. */
export function ProcessSteps() {
  const sectionRef = useRef<HTMLElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<Array<HTMLParagraphElement | null>>([])
  const titleRefs = useRef<Array<HTMLHeadingElement | null>>([])
  const bodyRefs = useRef<Array<HTMLDivElement | null>>([])

  // Two rails exist in the markup — a horizontal one under the columns and a
  // vertical one in the phone layout's gutter. Only the one matching the
  // current breakpoint is ever animated.
  const railLineRefs = useRef<Record<"desktop" | "mobile", HTMLDivElement | null>>({
    desktop: null,
    mobile: null,
  })
  const railHeadRefs = useRef<Record<"desktop" | "mobile", HTMLSpanElement | null>>({
    desktop: null,
    mobile: null,
  })
  const markerRefs = useRef<Record<"desktop" | "mobile", Array<HTMLSpanElement | null>>>({
    desktop: [],
    mobile: [],
  })

  useLayoutEffect(() => {
    const section = sectionRef.current
    const stack = stackRef.current
    if (!section || !stack) return

    const media = gsap.matchMedia()

    media.add(
      {
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isDesktop, reduceMotion } = context.conditions as {
          isDesktop: boolean
          isMobile: boolean
          reduceMotion: boolean
        }

        const mode = isDesktop ? "desktop" : "mobile"
        const line = railLineRefs.current[mode]
        const head = railHeadRefs.current[mode]
        const markers = markerRefs.current[mode].filter(
          (marker): marker is HTMLSpanElement => marker !== null,
        )
        const labels = labelRefs.current
        const titles = titleRefs.current
        const bodies = bodyRefs.current

        // Reduced motion gets the finished state, not a broken one: everything
        // readable, rail fully drawn, no scroll-driven movement at all.
        if (reduceMotion) {
          gsap.set([...labels, ...titles, ...bodies], { autoAlpha: 1, y: 0 })
          gsap.set(titles, { color: TITLE_ACTIVE })
          gsap.set(markers, { autoAlpha: 1 })
          if (line) gsap.set(line, { scaleX: 1, scaleY: 1 })
          if (head) gsap.set(head, { autoAlpha: 0 })
          return
        }

        const growAxis = isDesktop ? "scaleX" : "scaleY"

        gsap.set(labels, { autoAlpha: 0 })
        gsap.set(titles, { autoAlpha: 0, y: 22, color: TITLE_MUTED })
        gsap.set(bodies, { autoAlpha: 0, y: 22 })
        gsap.set(markers, { autoAlpha: 0 })
        if (line) gsap.set(line, { [growAxis]: 0 })
        if (head) gsap.set(head, { autoAlpha: 0 })

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: isDesktop ? section : stack,
            // Desktop: the sticky child is already parked at the top of the
            // viewport for the whole of the section's extra height, so the
            // section's own top/bottom edges are exactly the pin's lifetime.
            start: isDesktop ? "top top" : "top 85%",
            // Phones have no pinned viewports to spend, so the range is the
            // stack's own travel: ending well down the screen keeps the three
            // steps from all landing within the first flick.
            end: isDesktop ? "bottom bottom" : "bottom 40%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })

        // One time unit per step, so positions read as step indices.
        timeline.to(line, { [growAxis]: 1, ease: "none", duration: STEP_COUNT }, 0)
        if (head) {
          const headTravel = isDesktop ? { left: "100%" } : { top: "100%" }
          timeline
            .set(head, { autoAlpha: 1 }, 0)
            .to(head, { ...headTravel, ease: "none", duration: STEP_COUNT }, 0)
            // The head is the "still drawing" marker; once the rail is complete
            // the boundary "+" underneath it is the one that stays.
            .to(head, { autoAlpha: 0, duration: 0.15 }, STEP_COUNT - 0.15)
        }

        markers.forEach((marker, index) => {
          timeline.to(marker, { autoAlpha: 1, duration: 0.12 }, index)
        })

        PROCESS_STEPS.forEach((_, index) => {
          const label = labels[index]
          const title = titles[index]
          const body = bodies[index]

          // The label lands before its own step does — that faint "Étape · 3"
          // sitting ahead of the rail is what makes the section feel like it is
          // announcing what comes next.
          //
          // Only from the second step on: the first has nothing to announce
          // ahead of, and clamping its preview to position 0 put it on top of
          // its own arrival tween. The longer preview then finished last and
          // pinned the label back to 0.35, leaving step 1 permanently dimmer
          // than the other two.
          if (label && index > 0) {
            timeline.to(label, { autoAlpha: 0.35, duration: 0.3 }, index - 0.55)
          }
          if (label) {
            timeline.to(label, { autoAlpha: 1, duration: 0.25 }, index)
          }
          if (title) {
            timeline.to(
              title,
              { autoAlpha: 1, y: 0, color: TITLE_ACTIVE, duration: 0.5, ease: "power2.out" },
              index,
            )
          }
          if (body) {
            timeline.to(
              body,
              { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
              index + 0.12,
            )
          }
        })

        return () => {
          timeline.kill()
        }
      },
    )

    return () => media.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      data-process-section
      // The extra height is what the sticky child scrolls against; on phones
      // there is no pin, so the section is just as tall as its content.
      style={{ "--process-scroll": `${SCROLL_VIEWPORTS * 100}vh` } as React.CSSProperties}
      className="relative z-10 bg-[#f2f2f2] text-black md:h-[var(--process-scroll)]"
    >
      <div className="flex flex-col justify-center px-4 py-24 md:sticky md:top-0 md:h-dvh md:px-8 md:py-0">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-12 md:flex-row md:gap-16">
          <p className="text-xs uppercase tracking-[0.18em] text-black/40 md:w-40 md:shrink-0">
            <RevealText>Ma méthode</RevealText>
          </p>

          <div className="flex-1">
            <h2 className="max-w-[14ch] text-4xl leading-[0.95] tracking-[-0.04em] md:text-7xl">
              <RevealText delay={0.06}>Comment je travaille</RevealText>
            </h2>
            <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-black/50 md:text-base">
              <RevealText delay={0.12}>
                Une méthode qui ne change pas d&apos;un projet à l&apos;autre,
                parce qu&apos;elle marche.
              </RevealText>
            </p>

            {/* pl-8 opens the gutter the vertical rail lives in on phones; from
              * md up the rail moves under the columns and the gutter closes. */}
            <div className="relative mt-14 pl-8 md:mt-20 md:pl-0">
              <div className="absolute inset-y-0 left-0 w-4 md:hidden" aria-hidden="true">
                <div
                  ref={(element) => {
                    railLineRefs.current.mobile = element
                  }}
                  className="absolute left-1/2 top-0 h-full w-px origin-top -translate-x-1/2 bg-black/20"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-between">
                  {Array.from({ length: MARKER_COUNT }, (_, index) => (
                    <span
                      key={index}
                      ref={(element) => {
                        markerRefs.current.mobile[index] = element
                      }}
                      className="text-xs leading-none text-black/45"
                    >
                      +
                    </span>
                  ))}
                </div>
                <span
                  ref={(element) => {
                    railHeadRefs.current.mobile = element
                  }}
                  className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-xs leading-none text-black/45"
                >
                  ×
                </span>
              </div>

              <div
                ref={stackRef}
                className="flex flex-col gap-14 md:grid md:grid-cols-3 md:gap-10 lg:gap-16"
              >
                {PROCESS_STEPS.map((step, index) => (
                  <div key={step.title} className="flex flex-col">
                    <p
                      ref={(element) => {
                        labelRefs.current[index] = element
                      }}
                      className="text-xs uppercase tracking-[0.18em] text-black/60"
                    >
                      Étape · {index + 1}
                    </p>
                    <h3
                      ref={(element) => {
                        titleRefs.current[index] = element
                      }}
                      className="mt-6 text-2xl tracking-[-0.02em] md:text-3xl"
                    >
                      {step.title}
                    </h3>
                    <div
                      ref={(element) => {
                        bodyRefs.current[index] = element
                      }}
                      className="mt-4 max-w-[36ch] text-sm leading-relaxed text-black/55"
                    >
                      {step.body}
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative mt-14 hidden h-4 md:block" aria-hidden="true">
                <div
                  ref={(element) => {
                    railLineRefs.current.desktop = element
                  }}
                  className="absolute left-0 top-1/2 h-px w-full origin-left bg-black/20"
                />
                <div className="absolute inset-0 flex items-center justify-between">
                  {Array.from({ length: MARKER_COUNT }, (_, index) => (
                    <span
                      key={index}
                      ref={(element) => {
                        markerRefs.current.desktop[index] = element
                      }}
                      className="text-xs leading-none text-black/45"
                    >
                      +
                    </span>
                  ))}
                </div>
                <span
                  ref={(element) => {
                    railHeadRefs.current.desktop = element
                  }}
                  className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 text-xs leading-none text-black/45"
                >
                  ×
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
