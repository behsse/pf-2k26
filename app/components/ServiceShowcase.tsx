"use client"

import Image from "next/image"
import { useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TransitionLink } from "./TransitionLink"
import { RevealText } from "./RevealText"
import { SERVICE_OFFER } from "../data/serviceOffer"
import type { ServiceItem } from "../data/serviceOffer"

gsap.registerPlugin(ScrollTrigger)

/** Nothing open. One row at a time across the whole section, so the list never
 * turns into a wall of expanded panels. */
const CLOSED = { group: -1, item: -1 }

/** One prestation: a rule with its number, its name and a chevron, hiding the
 * stack behind it.
 *
 * The open/close animation runs on `grid-template-rows` between 0fr and 1fr
 * rather than on a height. A CSS transition cannot animate to `height: auto`,
 * and measuring the panel in JS would have to be redone on every resize and
 * every font swap; the fr trick lets the browser animate to the panel's own
 * natural height with no measuring at all. */
function ServiceAccordionRow({
  number,
  item,
  isOpen,
  onToggle,
}: {
  number: number
  item: ServiceItem
  isOpen: boolean
  onToggle: () => void
}) {
  const panelId = `service-panel-${item.label.replace(/\s+/g, "-").toLowerCase()}`

  return (
    <li className="border-b border-white/12">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group flex w-full cursor-pointer items-center gap-6 py-5 text-left md:gap-10"
      >
        <span className="w-8 shrink-0 text-xs text-white/35 tabular-nums">
          <RevealText>{number}.</RevealText>
        </span>
        <span
          className={`flex-1 text-base tracking-[-0.01em] transition-colors md:text-lg ${
            isOpen ? "text-white" : "text-white/75 group-hover:text-white"
          }`}
        >
          <RevealText delay={0.04}>{item.label}</RevealText>
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-sm text-white/45 transition-transform duration-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ↓
        </span>
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        {/* min-h-0 is what makes the 0fr row actually collapse: a grid item's
          * automatic minimum size would otherwise hold it open at its content
          * height. */}
        <div className="min-h-0 overflow-hidden">
          <div
            className={`flex flex-col gap-8 pb-8 pl-14 transition-opacity duration-400 sm:flex-row sm:gap-16 md:pl-18 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            {item.panels.map((panel) => (
              <div key={panel.title}>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/35">
                  {panel.title}
                </p>
                <ul className="mt-3 flex flex-col gap-1.5 text-sm text-white/70">
                  {panel.entries.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  )
}

/** Services, laid out as a fixed index against a moving list.
 *
 * The left column holds the category names and the visual of the matching
 * case study, and it sticks to the viewport for the whole section. The right
 * column is what actually scrolls: one block per category, each with its
 * heading, a line of context, and its prestations as rules.
 *
 * Whichever block currently owns the middle of the screen lights up its name on
 * the left and swaps the visual under it, so the left column reads as a
 * position indicator rather than decoration. */
export function ServiceShowcase() {
  const rootRef = useRef<HTMLElement>(null)
  const blockRefs = useRef<Array<HTMLDivElement | null>>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [openRow, setOpenRow] = useState(CLOSED)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const context = gsap.context(() => {
      blockRefs.current.forEach((block, index) => {
        if (!block) return

        ScrollTrigger.create({
          trigger: block,
          // The band the left column reports on: a block owns the index from
          // the moment its top passes the middle of the screen until the next
          // one takes over.
          start: "top 55%",
          end: "bottom 55%",
          onEnter: () => setActiveIndex(index),
          onEnterBack: () => setActiveIndex(index),
          invalidateOnRefresh: true,
        })
      })
    }, root)

    return () => context.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      data-service-showcase
      className="relative z-10 bg-black px-4 py-24 text-white md:px-8 md:py-32"
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-12 md:flex-row md:gap-16 lg:gap-24">
        {/* self-start is what lets sticky work here: a flex child stretches to
          * the row's full height by default, and a box as tall as the whole
          * section has nothing left to stick against. */}
        <div className="md:sticky md:top-28 md:h-fit md:w-64 md:shrink-0 md:self-start lg:w-72">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.18em] md:flex-col md:gap-2">
            {SERVICE_OFFER.map((group, index) => (
              <li key={group.id}>
                <span
                  className={`transition-colors duration-300 ${
                    index === activeIndex ? "text-white" : "text-white/35"
                  }`}
                >
                  <RevealText delay={index * 0.05}>{group.title}</RevealText>
                </span>
              </li>
            ))}
          </ul>

          <div className="relative mt-8 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-[4px] md:max-w-none">
            {SERVICE_OFFER.map((group, index) => (
              <Image
                key={group.id}
                src={group.image}
                alt={group.alt}
                fill
                sizes="288px"
                className={`object-cover transition-opacity duration-500 ${
                  index === activeIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}

            <TransitionLink
              href={SERVICE_OFFER[activeIndex].caseStudyHref}
              label="Projets"
              className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-black transition-colors hover:bg-white"
            >
              <RevealText>Voir le projet</RevealText>
            </TransitionLink>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-24 md:gap-32">
          {SERVICE_OFFER.map((group, index) => (
            <div
              key={group.id}
              id={group.id}
              ref={(element) => {
                blockRefs.current[index] = element
              }}
            >
              <h2 className="text-4xl leading-[0.95] tracking-[-0.04em] md:text-7xl">
                <RevealText>{group.title}</RevealText>
              </h2>
              <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-white/55 md:text-base">
                <RevealText delay={0.08}>{group.blurb}</RevealText>
              </p>

              <ul className="mt-10 flex flex-col border-t border-white/12">
                {group.items.map((item, itemIndex) => (
                  <ServiceAccordionRow
                    key={item.label}
                    number={itemIndex + 1}
                    item={item}
                    isOpen={openRow.group === index && openRow.item === itemIndex}
                    onToggle={() =>
                      setOpenRow((current) =>
                        current.group === index && current.item === itemIndex
                          ? CLOSED
                          : { group: index, item: itemIndex },
                      )
                    }
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
