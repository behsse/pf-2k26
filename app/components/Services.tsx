"use client"

import { useLayoutEffect, useRef } from "react"
import { RevealText } from "./RevealText"
// Same list as the /service showcase: one catalogue, two presentations. The
// categories used to be declared here and again over there, which is how the
// two pages ended up advertising different services.
import { SERVICE_OFFER as SERVICE_CATEGORIES } from "../data/serviceOffer"

const MARQUEE_REPEAT_COUNT = 20
const MARQUEE_SPEED_PX_PER_SEC = 30

function ServiceRow({ label }: { label: string }) {
  const marqueeItems = Array.from({ length: MARQUEE_REPEAT_COUNT })
  const trackRefs = useRef<Array<HTMLDivElement | null>>([])

  useLayoutEffect(() => {
    const tracks = trackRefs.current.filter((track): track is HTMLDivElement => track !== null)
    if (tracks.length === 0) return

    // Every row loops the same "-100%" keyframe over a fixed CSS duration, so a
    // longer label (wider track) covers more pixels in that same time and
    // visibly scrolls faster. Measuring the real width and deriving the
    // duration from a constant px/sec keeps scroll speed identical everywhere.
    const applyDuration = () => {
      const width = tracks[0].scrollWidth
      if (width === 0) return
      const duration = width / MARQUEE_SPEED_PX_PER_SEC
      tracks.forEach((track) => {
        track.style.animationDuration = `${duration}s`
      })
    }

    applyDuration()
    const resizeObserver = new ResizeObserver(applyDuration)
    resizeObserver.observe(tracks[0])

    return () => resizeObserver.disconnect()
  }, [label])

  return (
    <div className="group relative overflow-hidden border-t border-black/15">
      <div className="relative z-0 flex items-center py-5 pl-24 pr-4 md:py-6 md:pl-42 md:pr-8">
        <span className="text-sm uppercase tracking-[0.14em] md:text-base">
          <RevealText>{label}</RevealText>
        </span>
      </div>

      {/* Desktop-only: the band + scrolling text is a hover affordance that
          doesn't translate to touch, so it's simply absent below md. A
          clip-path mask opens from the center outward — the text underneath
          stays full size the whole time, only its visible window grows
          (scale would squash/stretch the marquee text, this doesn't). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 hidden [clip-path:inset(0_50%_0_50%)] items-center overflow-hidden bg-black transition-[clip-path] duration-400 ease-out group-hover:[clip-path:inset(0_0%_0_0%)] md:flex"
      >
        {[0, 1].map((group) => (
          <div
            key={group}
            ref={(element) => {
              trackRefs.current[group] = element
            }}
            className="marquee-track flex shrink-0 items-center whitespace-nowrap"
          >
            {marqueeItems.map((_, index) => (
              <span key={index} className="flex items-center">
                <span className="px-6 text-lg font-medium uppercase tracking-[0.14em] text-white md:text-2xl">
                  {label}
                </span>
                <span className="text-6xl leading-none text-white/60 md:text-3xl">*</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ServiceCategory({
  number,
  title,
  items,
}: {
  number: string
  title: string
  // Only the label is needed here; the showcase on /service is what uses the
  // rest of each item.
  items: Array<{ label: string }>
}) {
  return (
    <div>
      <div className="flex items-center gap-4 border-t border-black/15 px-4 py-8 md:gap-6 md:px-8 md:py-10">
        <span className="w-16 shrink-0 text-7xl text-black/25 md:w-28 md:text-4xl">
          <RevealText>{number}</RevealText>
        </span>
        <h3 className="text-4xl font-medium tracking-[-0.03em] md:text-6xl">
          <RevealText>{title}</RevealText>
        </h3>
      </div>
      <div>
        {items.map((item) => (
          <ServiceRow key={item.label} label={item.label} />
        ))}
      </div>
    </div>
  )
}

export function Services() {
  return (
    <section
      data-services-section
      aria-labelledby="services-title"
      className="relative z-20 bg-white pt-12 pb-28 text-black md:pt-20 md:pb-40"
    >
      <div>
        <p className="mb-20 px-4 md:px-8 max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl">
          <RevealText>Services</RevealText>
        </p>
        <h2 id="services-title" className="sr-only">
          Mes services
        </h2>

        {SERVICE_CATEGORIES.map((category, index) => (
          <ServiceCategory
            key={category.title}
            number={String(index + 1).padStart(2, "0")}
            title={category.title}
            items={category.items}
          />
        ))}

        <div className="border-t border-black/15" />
      </div>
    </section>
  )
}
