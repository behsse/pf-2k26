"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Image from "next/image"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { placeholderProjects, type PlaceholderProject } from "@/app/data/portfolio"
import { ProjectFloatField } from "./ProjectFloatField"
import { RevealText } from "./RevealText"
import { ScrollCue } from "./ScrollCue"
import { TransitionLink } from "./TransitionLink"

gsap.registerPlugin(ScrollTrigger)

/** Parallax drift per column, in pixels. Each column travels from the negated
 * value to the value, so its full course is twice this.
 *
 * What actually registers is the DIFFERENCE between neighbouring columns, not
 * the absolute travel — and it is spread across the gallery's whole height, so
 * small numbers vanish entirely. Alternating the signs doubles that difference
 * for free: neighbours move in opposite directions, so they separate at twice
 * the rate either one travels. Still a fraction of the home grid's, which runs
 * in the hundreds. */
const PARALLAX_DRIFTS = [-65, 40, -52, 58]

/** Vertical offset per column, in pixels, so neighbouring columns never start
 * on the same line. Indexed by column, and read modulo the live column count. */
const COLUMN_OFFSETS = [0, 112, 56, 84]

const COLUMN_QUERIES = [
  { query: "(min-width: 1280px)", columns: 4 },
  { query: "(min-width: 768px)", columns: 3 },
] as const

/** Deals the projects across `count` columns round-robin, so reading down the
 * columns left to right preserves the original order. */
function buildColumns<T>(items: T[], count: number): T[][] {
  const columns: T[][] = Array.from({ length: count }, () => [])
  items.forEach((item, index) => columns[index % count].push(item))
  return columns
}

/** The stagger is driven from JS rather than nth-child variants because the
 * column count changes with the breakpoint. In CSS, the three-column rules
 * keep matching once four columns are active, and which margin wins comes down
 * to Tailwind's generation order rather than anything expressed here — so
 * columns silently land on the wrong offsets. Reading the count explicitly
 * keeps each layout's offsets unambiguous. */
function useColumnCount() {
  const [columns, setColumns] = useState(2)

  useEffect(() => {
    const lists = COLUMN_QUERIES.map((entry) => ({
      ...entry,
      list: window.matchMedia(entry.query),
    }))

    const update = () => {
      setColumns(lists.find(({ list }) => list.matches)?.columns ?? 2)
    }

    update()
    lists.forEach(({ list }) => list.addEventListener("change", update))
    // Belt-and-braces: a media query's own change event is the precise signal,
    // but it does not fire in every environment (some embedded/automated
    // browsers resize without dispatching it), which strands the offsets on
    // the previous breakpoint's pattern. A plain resize listener re-reads the
    // same queries and costs nothing when they have not actually changed.
    window.addEventListener("resize", update)

    return () => {
      lists.forEach(({ list }) => list.removeEventListener("change", update))
      window.removeEventListener("resize", update)
    }
  }, [])

  return columns
}

/** One gallery card. Only the projects that have a case study written become
 * links — the rest keep exactly the markup they had, with no cursor change and
 * no hover, so nothing promises a page that does not exist. */
function ProjectCard({ project }: { project: PlaceholderProject }) {
  const captionRef = useRef<HTMLDivElement>(null)

  // Same treatment as the home grid: the title and the year live on the image
  // and slide up from its bottom edge on hover or focus.
  useLayoutEffect(() => {
    const caption = captionRef.current
    if (!caption) return

    gsap.set(caption, { yPercent: 100, autoAlpha: 0 })
  }, [])

  const animateCaption = (visible: boolean) => {
    const caption = captionRef.current
    if (!caption) return

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    gsap.to(caption, {
      yPercent: visible ? 0 : 100,
      autoAlpha: visible ? 1 : 0,
      duration: reducedMotion ? 0 : 0.45,
      ease: visible ? "power3.out" : "power3.in",
      overwrite: "auto",
    })
  }

  const card = (
    <article
      className="group"
      onMouseEnter={() => animateCaption(true)}
      onMouseLeave={() => animateCaption(false)}
      onFocus={() => animateCaption(true)}
      onBlur={() => animateCaption(false)}
    >
      <div className="relative isolate aspect-3/4 overflow-hidden bg-white/5 rounded-md">
        {/* `sizes` is twice the card's own width on purpose. The covers are
          * landscape (3:2) and the card is portrait (3:4), so object-cover
          * scales them by HEIGHT: the image is drawn twice as wide as the slot
          * it fills, and everything but the middle is cropped away. Quoting the
          * slot width here made Next serve a file half the resolution the
          * browser then had to blow up — hence the pixelation. */}
        <Image
          src={project.image}
          alt={project.alt}
          fill
          quality={90}
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 66vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div
          ref={captionRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 text-white"
        >
          {/* Same gradient as the home grid, and no backdrop-blur for the same
              reason: it resolved after the slide-up, so the band went sharp
              then blurry in view. */}
          <div
            aria-hidden
            className="absolute inset-0 [background:linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.8)_22%,rgba(0,0,0,0.5)_52%,rgba(0,0,0,0.18)_78%,rgba(0,0,0,0)_100%)]"
          />
          <div className="relative flex items-baseline justify-between gap-3 px-3 pb-3 pt-10">
            <h2 className="text-sm uppercase tracking-[0.12em]">{project.title}</h2>
            <p className="text-xs uppercase tracking-[0.12em] text-white/65">
              {project.status}
            </p>
          </div>
        </div>
      </div>
    </article>
  )

  if (!project.slug) return card

  return (
    <TransitionLink href={`/projets/${project.slug}`} label={project.title} className="block">
      {card}
    </TransitionLink>
  )
}

/** The title is a full-viewport sticky hero: it holds the screen, centred, and
 * the gallery — which follows it in flow with an opaque background and sits
 * above it in the stack — slides up over it as you scroll. Sticky rather than
 * fixed so it occupies its own viewport of scroll room first, which is what
 * gives the title a full screen to itself before anything covers it. */
export function ProjectLab() {
  const columns = useColumnCount()
  const galleryRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const gallery = galleryRef.current
    if (!gallery) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const context = gsap.context(() => {
      const columnEls = gsap.utils.toArray<HTMLElement>("[data-project-column]", gallery)

      columnEls.forEach((column, index) => {
        gsap.fromTo(
          column,
          // Starting at the opposite end means each column sweeps its whole
          // range across the section rather than only drifting from wherever
          // it happens to sit when it enters view.
          { y: -PARALLAX_DRIFTS[index % PARALLAX_DRIFTS.length] },
          {
            y: PARALLAX_DRIFTS[index % PARALLAX_DRIFTS.length],
            ease: "none",
            scrollTrigger: {
              trigger: gallery,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          },
        )
      })
    }, gallery)

    return () => context.revert()
    // Rebuilt when the column count changes: the elements themselves are
    // replaced, so the old triggers would point at detached nodes.
  }, [columns])

  return (
    <section aria-labelledby="projects-title" className="relative bg-black text-white">
      {/* Opaque AND above the footer. The site-wide footer is position:fixed
        * at z-0 and comes later in the document, so at an equal z-index it
        * paints over this hero — its divider rule showing as a stray line
        * across the title. An explicit higher z-index is what actually keeps
        * it behind, not the opaque background alone. */}
      <div className="sticky top-0 z-10 flex h-dvh flex-col items-center justify-center overflow-hidden bg-black px-4">
        <ProjectFloatField />

        {/* Above the drifting field, so the title stays legible over it. */}
        <div className="relative z-10 flex flex-col items-center">
          <h1
            id="projects-title"
            className="text-center text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-6xl"
          >
            {/* trigger="load" like every other hero on the site: this sits at
              * the top of the page, already in view before any scroll, so a
              * scroll-triggered reveal would have nothing to wait for. */}
            <RevealText trigger="load">Tous mes projets</RevealText>
          </h1>
          <p className="mt-6 max-w-2xl text-center text-base leading-relaxed text-white/60 md:text-lg">
            <RevealText trigger="load" delay={0.08}>
              Une vitrine organisée de branding, de produits numériques, de sites
              Web et d&apos;expériences mobiles
            </RevealText>
          </p>
        </div>

        <ScrollCue className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2" />
      </div>

      {/* No background of its own, so the sticky title stays visible through
        * the gaps between cards as the gallery travels over it. */}
      <div ref={galleryRef} className="relative z-20 px-4 pb-32 md:px-8 md:pb-48">
        {/* Independent columns rather than a CSS grid. In a grid every row is
          * as tall as its lowest card, so the per-card stagger offset gets
          * ADDED to the row gap — a card pushed down 112px leaves 152px under
          * its unoffset neighbour instead of the 40px asked for. Flowing each
          * column separately keeps the vertical gap exactly equal to the
          * horizontal one, with the offset applied to the column itself. */}
        <div className="flex gap-5 md:gap-10">
          {buildColumns(placeholderProjects, columns).map((column, columnIndex) => (
            <div
              key={columnIndex}
              data-project-column
              className="flex min-w-0 flex-1 flex-col gap-5 md:gap-10"
              style={{ marginTop: COLUMN_OFFSETS[columnIndex % COLUMN_OFFSETS.length] }}
            >
              {column.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
