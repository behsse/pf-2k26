"use client"

import { useLayoutEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Header from "./Header"
import { PROJECT_BACKGROUND, ProjectGrid } from "./ProjectGrid"

gsap.registerPlugin(ScrollTrigger)

const ABOUT_TEXT =
  "Moi, c’est Behsse. Les idées tièdes ne m’intéressent pas. Je conçois des identités et des expériences digitales qui prennent position, attirent le regard et refusent de se fondre dans le décor. J’enlève le superflu, je pousse ce qui rend chaque projet unique et je travaille chaque détail jusqu’à ce qu’il devienne évident. Le but n’est pas de faire joli. Le but, c’est d’être impossible à oublier."

const ABOUT_WORDS = ABOUT_TEXT.split(" ")
const STRIPE_COUNT = 5
const WORD_REVEAL_DURATION = 2.2
const WORD_FADE_DURATION = 0.15
const STRIPE_DURATION = 0.9
const STRIPE_STAGGER_SPAN = 1
const TRANSITION_TAIL_DURATION = 0.1
const LINE_REVEAL_DURATION = 0.9
const LINE_REVEAL_STAGGER = 0.08

const getScrollDistance = () => (window.innerWidth >= 1200 ? 420 : 315)

type AboutStatementProps = {
  entranceTriggerRef: RefObject<HTMLDivElement | null>
  onWordsReady: () => void
}

/** Two independent animations layered on the same text:
 *  1. A per-LINE mask-and-slide entrance (position only — same technique as
 *     RevealText elsewhere on the site), played once as the section
 *     approaches, well before it's pinned.
 *  2. The original per-WORD opacity scrub (dim gray → white), tied to the
 *     pin's own scroll progress, set up by the parent once these words
 *     exist in the DOM.
 * Lines are detected at runtime (grouping individually-measured words by
 * shared offsetTop) so they match the real, responsive line wrap instead of
 * a guess baked in at build time. */
function AboutStatement({ entranceTriggerRef, onWordsReady }: AboutStatementProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [lines, setLines] = useState<string[][] | null>(null)
  const lineInnerRefs = useRef<Array<HTMLSpanElement | null>>([])

  useLayoutEffect(() => {
    const heading = headingRef.current
    if (!heading) return

    let retryFrame = 0
    let retriesLeft = 8

    const measure = () => {
      const wordEls = Array.from(
        heading.querySelectorAll<HTMLElement>("[data-measure-word]"),
      )
      if (wordEls.length === 0) return

      // The pinned container's height/width can still be settling on a cold
      // load (see the "defer past a paint" note in HeroProjectTransition's
      // own effect) — measuring mid-collapse wraps every single word onto
      // its own "line". A single deferred frame isn't reliably enough (the
      // exact timing varies), so keep retrying against a sanity check
      // instead of trusting whichever frame happens to run first.
      if (heading.getBoundingClientRect().width < 200 && retriesLeft > 0) {
        retriesLeft -= 1
        retryFrame = window.requestAnimationFrame(measure)
        return
      }

      const grouped: string[][] = []
      let lastTop: number | null = null
      wordEls.forEach((el) => {
        const top = el.offsetTop
        const word = el.dataset.word ?? ""
        // A same-line difference is sub-pixel/rounding noise; a real line
        // break is a full line-height (tens of px) — a wide-open threshold
        // tells them apart without being thrown off by either.
        if (lastTop === null || Math.abs(top - lastTop) > 8) {
          grouped.push([word])
          lastTop = top
        } else {
          grouped[grouped.length - 1].push(word)
        }
      })

      // Once lines are set the flat measurement words are gone, so a bad
      // grouping (e.g. every word ending up alone) can't self-correct on a
      // later pass — retry once more rather than committing to it.
      if (grouped.length === wordEls.length && wordEls.length > 3 && retriesLeft > 0) {
        retriesLeft -= 1
        retryFrame = window.requestAnimationFrame(measure)
        return
      }

      setLines(grouped)
    }

    const measureFrame = window.requestAnimationFrame(measure)
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(heading)
    void document.fonts.ready.then(measure).catch(() => {})

    return () => {
      window.cancelAnimationFrame(measureFrame)
      window.cancelAnimationFrame(retryFrame)
      resizeObserver.disconnect()
    }
  }, [])

  useLayoutEffect(() => {
    if (!lines) return
    const trigger = entranceTriggerRef.current
    const inners = lineInnerRefs.current.filter(
      (el): el is HTMLSpanElement => el !== null,
    )
    if (!trigger || inners.length === 0) return

    onWordsReady()

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reducedMotionQuery.matches) {
      gsap.set(inners, { yPercent: 0 })
      return
    }

    gsap.set(inners, { yPercent: 100 })

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(inners, {
            yPercent: 0,
            duration: LINE_REVEAL_DURATION,
            ease: "power3.out",
            stagger: LINE_REVEAL_STAGGER,
          })
        },
      })
    })

    return () => context.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, entranceTriggerRef])

  return (
    <div
      data-about-section
      className="absolute inset-0 z-10 flex items-center bg-black px-4 py-24 text-white md:px-8"
    >
      <div className="mx-auto w-full max-w-360">
        <h2
          ref={headingRef}
          id="about-statement"
          aria-label={ABOUT_TEXT}
          className="max-w-340 text-[clamp(1.5rem,2.2vw,2.2rem)] font-medium uppercase leading-[1.4] tracking-tight"
        >
          {lines
            ? lines.map((lineWords, lineIndex) => (
                <span key={lineIndex} aria-hidden="true" className="block overflow-hidden">
                  <span
                    ref={(element) => {
                      lineInnerRefs.current[lineIndex] = element
                    }}
                    className="block whitespace-nowrap"
                  >
                    {lineWords.flatMap((word, wordIndex) => {
                      const span = (
                        <span key={wordIndex} data-about-word className="inline-block">
                          {word}
                        </span>
                      )
                      return wordIndex < lineWords.length - 1 ? [span, " "] : [span]
                    })}
                  </span>
                </span>
              ))
            : ABOUT_WORDS.flatMap((word, index) => {
                const span = (
                  <span
                    key={`${word}-${index}`}
                    data-measure-word
                    data-word={word}
                    aria-hidden="true"
                    className="inline-block"
                  >
                    {word}
                  </span>
                )
                return index < ABOUT_WORDS.length - 1 ? [span, " "] : [span]
              })}
        </h2>
      </div>
    </div>
  )
}

export function HeroProjectTransition() {
  const heroSectionRef = useRef<HTMLElement>(null)
  const heroInnerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLElement>(null)
  const pinnedRef = useRef<HTMLDivElement>(null)
  const incomingRef = useRef<HTMLDivElement>(null)
  const stripeRefs = useRef<Array<HTMLDivElement | null>>([])
  const [aboutWordsReady, setAboutWordsReady] = useState(false)

  useLayoutEffect(() => {
    const heroSection = heroSectionRef.current
    const heroInner = heroInnerRef.current
    if (!heroSection || !heroInner) return

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reducedMotionQuery.matches) return

    // The hero's own section boundary scrolls away at the normal rate, but its
    // inner content is pushed DOWN as you scroll through it, so it lags behind
    // and keeps rendering (on top, since it's the positioned element) over the
    // About section arriving underneath — no overlap at rest, growing as you
    // scroll, then catching up and disappearing once fully scrolled past.
    const context = gsap.context(() => {
      const tween = gsap.fromTo(
        heroInner,
        { y: 0 },
        { y: () => window.innerHeight * 0.5, ease: "none" },
      )
      ScrollTrigger.create({
        trigger: heroSection,
        scrub: true,
        animation: tween,
        start: "top top",
        end: "bottom top",
        invalidateOnRefresh: true,
      })
    })

    return () => {
      context.revert()
    }
  }, [])

  useLayoutEffect(() => {
    const scene = sceneRef.current
    const pinned = pinnedRef.current
    const incoming = incomingRef.current
    const stripes = stripeRefs.current.filter(
      (stripe): stripe is HTMLDivElement => stripe !== null,
    )

    if (!scene || !pinned || !incoming || stripes.length !== STRIPE_COUNT) {
      return
    }

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    )
    let animationContext: gsap.Context | null = null
    let cancelled = false
    let resizeFrame = 0
    let loadFrame = 0
    let followupLoadFrame = 0
    let initFrame = 0
    let resizeObserver: ResizeObserver | null = null
    let refreshAfterLoad: (() => void) | null = null
    const originalMarginTop = incoming.style.marginTop

    const setStripeCompositing = (active: boolean) => {
      stripes.forEach((stripe) => {
        stripe.style.willChange = active ? "transform" : "auto"
      })
    }

    const updateIncomingOverlap = () => {
      incoming.style.marginTop = reducedMotionQuery.matches
        ? originalMarginTop
        : `${-pinned.offsetHeight}px`
    }

    const createAnimation = () => {
      animationContext?.revert()
      animationContext = null
      setStripeCompositing(false)
      updateIncomingOverlap()

      // Rendered only once AboutStatement has finished grouping its lines
      // (see aboutWordsReady) — before that, this simply finds none, and
      // the pin/stripe wipe below still sets up normally either way.
      const words = gsap.utils.toArray<HTMLElement>("[data-about-word]", pinned)

      if (reducedMotionQuery.matches) {
        if (words.length > 0) gsap.set(words, { opacity: 1, clearProps: "willChange" })
        gsap.set(stripes, { scaleY: 0, clearProps: "willChange" })
        ScrollTrigger.refresh()
        return
      }

      animationContext = gsap.context(() => {
        if (words.length > 0) gsap.set(words, { opacity: 0.2, willChange: "opacity" })
        gsap.set(stripes, {
          scaleY: 0,
          transformOrigin: "50% 100%",
        })

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "about-project-transition",
            trigger: pinned,
            start: "top top",
            end: () => `+=${getScrollDistance()}%`,
            pin: pinned,
            pinSpacing: true,
            fastScrollEnd: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            refreshPriority: 10,
            onEnter: () => setStripeCompositing(true),
            onEnterBack: () => setStripeCompositing(true),
            onLeave: () => {
              setStripeCompositing(false)
              if (words.length > 0) gsap.set(words, { clearProps: "willChange" })
            },
            onLeaveBack: () => setStripeCompositing(false),
          },
        })

        if (words.length > 0) {
          timeline.to(
            words,
            {
              opacity: 1,
              duration: WORD_FADE_DURATION,
              stagger: {
                amount: WORD_REVEAL_DURATION - WORD_FADE_DURATION,
              },
            },
            0,
          )
        }

        timeline.addLabel("stripes-start", WORD_REVEAL_DURATION)

        stripes.forEach((stripe, index) => {
          const reverseIndex = STRIPE_COUNT - 1 - index
          const start = STRIPE_STAGGER_SPAN * (reverseIndex / (STRIPE_COUNT - 1))

          timeline.to(
            stripe,
            {
              scaleY: 1,
              duration: STRIPE_DURATION,
            },
            `stripes-start+=${start}`,
          )
        })

        timeline.to({}, { duration: TRANSITION_TAIL_DURATION })
      }, scene)

      // The pin captures its start/end/spacer size from rects measured at
      // creation time. On first mount those rects can be momentarily wrong
      // (layout not fully settled yet), producing a bogus pin that engages
      // instantly and then snaps to the correct position a frame later.
      // An immediate synchronous refresh re-measures right away, before
      // anything paints, so no incorrect state is ever visible.
      ScrollTrigger.refresh()

      window.cancelAnimationFrame(resizeFrame)
      resizeFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())
    }

    updateIncomingOverlap()
    ScrollTrigger.addEventListener("refreshInit", updateIncomingOverlap)
    // Defer the first pin creation past a paint: on a cold load the
    // stylesheet (heights driving this trigger's measurements) can still be
    // applying when this layout effect runs, which bakes a bogus pin/spacer
    // size that only self-corrects later — visible as the pinned view
    // flashing fixed-at-top then dropping back down. Waiting a frame
    // guarantees styles are settled before anything is measured.
    initFrame = window.requestAnimationFrame(createAnimation)

    const refresh = () => ScrollTrigger.refresh()
    refreshAfterLoad = () => {
      loadFrame = window.requestAnimationFrame(() => {
        refresh()
        followupLoadFrame = window.requestAnimationFrame(refresh)
      })
    }

    if (document.readyState === "complete") {
      loadFrame = window.requestAnimationFrame(refresh)
    } else {
      window.addEventListener("load", refreshAfterLoad, { once: true })
    }

    void document.fonts.ready.then(() => {
      if (!cancelled) refresh()
    })

    resizeObserver = new ResizeObserver(() => {
      window.cancelAnimationFrame(resizeFrame)
      resizeFrame = window.requestAnimationFrame(refresh)
    })
    resizeObserver.observe(pinned)
    reducedMotionQuery.addEventListener("change", createAnimation)

    return () => {
      cancelled = true
      window.cancelAnimationFrame(initFrame)
      window.cancelAnimationFrame(resizeFrame)
      window.cancelAnimationFrame(loadFrame)
      window.cancelAnimationFrame(followupLoadFrame)
      if (refreshAfterLoad) window.removeEventListener("load", refreshAfterLoad)
      resizeObserver?.disconnect()
      reducedMotionQuery.removeEventListener("change", createAnimation)
      ScrollTrigger.removeEventListener("refreshInit", updateIncomingOverlap)
      setStripeCompositing(false)
      animationContext?.revert()
      incoming.style.marginTop = originalMarginTop
    }
  }, [aboutWordsReady])

  return (
    <>
      <section ref={heroSectionRef} data-hero-section className="relative z-10 bg-white">
        <div
          ref={heroInnerRef}
          className="hero-transition-viewport relative w-full overflow-hidden bg-white"
        >
          <Header />
        </div>
      </section>

      <section
        ref={sceneRef}
        data-hero-project-transition
        aria-labelledby="about-statement"
        className="relative z-20 bg-black"
      >
        <div
          ref={pinnedRef}
          data-about-pinned-view
          className="about-transition-viewport relative z-20 w-full overflow-hidden bg-black"
        >
          <AboutStatement
            entranceTriggerRef={pinnedRef}
            onWordsReady={() => setAboutWordsReady(true)}
          />

          <div
            className="transition-stripes pointer-events-none absolute inset-0 z-20 flex w-full flex-col"
            aria-hidden="true"
          >
            {Array.from({ length: STRIPE_COUNT }, (_, index) => (
              <div
                key={index}
                ref={(element) => {
                  stripeRefs.current[index] = element
                }}
                className="transition-stripe"
                style={{ backgroundColor: PROJECT_BACKGROUND }}
              />
            ))}
          </div>
        </div>
      </section>

      <div ref={incomingRef} data-incoming-projects className="relative z-30">
        <ProjectGrid />
      </div>
    </>
  )
}
