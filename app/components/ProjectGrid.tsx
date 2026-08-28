"use client"

import { useLayoutEffect, useRef } from "react"
import Image from "next/image"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  placeholderProjects,
  type PlaceholderProject,
} from "@/app/data/portfolio"
import { RevealText } from "./RevealText"
import { TransitionLink } from "./TransitionLink"

gsap.registerPlugin(ScrollTrigger)

const desktopDrifts = [-250, 40, -80]
const tabletDrifts = [-200, 40, -150]

/** Home only shows a short selection; the full list lives on /projets. */
const HOME_PROJECT_COUNT = 6

export const PROJECT_BACKGROUND = "#ffffff"

type ProjectCardProps = {
  project: PlaceholderProject
}

function ProjectCard({ project }: ProjectCardProps) {
  const captionRef = useRef<HTMLDivElement>(null)

  // The title and the year are no longer printed under the card: they slide up
  // from the bottom edge of the image while the card is hovered or focused.
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
    // `group` lives here rather than on the link: the placeholder cards are not
    // links, and without it their image would be the only one that never moves.
    <article
      data-project-card
      className="group"
      onMouseEnter={() => animateCaption(true)}
      onMouseLeave={() => animateCaption(false)}
      onFocus={() => animateCaption(true)}
      onBlur={() => animateCaption(false)}
    >
      <div className="relative isolate aspect-video overflow-hidden bg-black/8 rounded-md">
        <Image
          src={project.image}
          alt={project.alt}
          fill
          quality={90}
          // A shade wider than the card actually is (33vw) on purpose: the
          // widths Next generates are a fixed ladder, and a slot that lands
          // just above a rung gets the file BELOW it stretched to fit. Asking
          // for a little more picks the next rung up. The hover zoom eats a few
          // percent on top of that.
          sizes="(max-width: 767px) 100vw, 40vw"
          // object-cover, never object-fill: the covers are 3:2 and the frame is
          // 16:9, so fill was stretching them to shape. Cover keeps the file's
          // proportions and crops the top and bottom instead.
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
        />
        <div
          ref={captionRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 text-white"
        >
          {/* A gradient and nothing else. A backdrop-blur was tried here and
              dropped: it resolves a frame or two after the slide-up, so the
              band visibly went sharp then blurry. The extra stops are what
              keep the fade from banding — a two-stop ramp of the same height
              shows its own edge halfway up. */}
          <div
            aria-hidden
            className="absolute inset-0 [background:linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.8)_22%,rgba(0,0,0,0.5)_52%,rgba(0,0,0,0.18)_78%,rgba(0,0,0,0)_100%)]"
          />
          <div className="relative flex items-baseline justify-between gap-4 px-4 pb-3 pt-12">
            <h3 className="text-lg font-medium tracking-[-0.03em] md:text-xl">
              {project.title}
            </h3>
            <p className="text-xs uppercase tracking-[0.12em] text-white/65">
              {project.status}
            </p>
          </div>
        </div>
      </div>
    </article>
  )

  // Only the projects that have a case study written become links. The rest
  // keep exactly the markup they had — no cursor change, no hover, nothing that
  // promises a page which does not exist.
  if (!project.slug) return card

  return (
    <TransitionLink
      href={`/projets/${project.slug}`}
      label={project.title}
      className="group block"
    >
      {card}
    </TransitionLink>
  )
}

export function ProjectGrid() {
  const sectionRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const desktopQuery = window.matchMedia("(min-width: 1200px)")
    const tabletQuery = window.matchMedia(
      "(min-width: 768px) and (max-width: 1199px)",
    )
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    )
    let animationContext: gsap.Context | null = null
    let refreshFrame = 0

    const createParallax = () => {
      animationContext?.revert()
      animationContext = null

      if (reducedMotionQuery.matches || (!desktopQuery.matches && !tabletQuery.matches)) {
        return
      }

      const cards = gsap.utils.toArray<HTMLElement>(
        "[data-project-card]",
        section,
      )
      const drifts = desktopQuery.matches ? desktopDrifts : tabletDrifts
      const columnCount = 3

      animationContext = gsap.context(() => {
        gsap.set(cards, { y: 0 })

        cards.forEach((card, index) => {
          const drift = drifts[index % columnCount]

          gsap.to(card, {
            y: drift,
            ease: "none",
              scrollTrigger: {
                trigger: section,
              start: "top 40%",
                end: "bottom top",
              scrub: 1,
              invalidateOnRefresh: true,
              refreshPriority: -10,
            },
          })
        })
      }, section)

      window.cancelAnimationFrame(refreshFrame)
      refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())
    }

    createParallax()
    desktopQuery.addEventListener("change", createParallax)
    tabletQuery.addEventListener("change", createParallax)
    reducedMotionQuery.addEventListener("change", createParallax)

    return () => {
      desktopQuery.removeEventListener("change", createParallax)
      tabletQuery.removeEventListener("change", createParallax)
      reducedMotionQuery.removeEventListener("change", createParallax)
      window.cancelAnimationFrame(refreshFrame)
      animationContext?.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      data-projects-section
      aria-labelledby="projects-title"
      className="relative z-20 px-4 pb-10 pt-28 text-black md:px-8 md:pb-20 md:pt-20"
      style={{ backgroundColor: PROJECT_BACKGROUND }}
    >
      <div>
        <div className="mb-20 flex items-end justify-between gap-8 md:mb-28">
          <div>
            <p className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl">
              <RevealText>Sélection de projets</RevealText>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-16 md:grid-cols-3">
          {placeholderProjects.slice(0, HOME_PROJECT_COUNT).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="mt-16 flex justify-center md:mt-24">
          <TransitionLink
            href="/projets"
            label="Projets"
            className="inline-flex items-center gap-4 rounded-full border border-black bg-black px-6 py-3 text-md font-medium text-white transition-opacity hover:opacity-80"
          >
            <RevealText>Voir tous les projets</RevealText>
          </TransitionLink>
        </div>
      </div>
    </section>
  )
}
