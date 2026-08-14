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

gsap.registerPlugin(ScrollTrigger)

const desktopDrifts = [-250, 120, -80, 180]
const tabletDrifts = [-200, 250, -150]

export const PROJECT_BACKGROUND = "#ffffff"

type ProjectCardProps = {
  project: PlaceholderProject
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article data-project-card>
      <div className="relative aspect-video overflow-hidden bg-black/8">
        <Image
          src={project.image}
          alt={project.alt}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1199px) 33vw, 25vw"
          className="object-fill"
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4 border-t border-black/20 pt-4">
        <h3 className="text-2xl font-medium tracking-[-0.03em]">
          <RevealText>{project.title}</RevealText>
        </h3>
        <p className="max-w-36 text-right text-xs uppercase leading-relaxed tracking-[0.12em] text-black/45">
          <RevealText delay={0.05}>{project.status}</RevealText>
        </p>
      </div>
    </article>
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
      const columnCount = desktopQuery.matches ? 4 : 3

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
      className="relative z-20 px-4 pb-10 pt-28 text-black md:px-8 md:pb-80 md:pt-20"
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

        <div className="grid grid-cols-1 gap-x-5 gap-y-16 md:grid-cols-3 xl:grid-cols-4">
          {placeholderProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
