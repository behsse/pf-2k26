import Image from "next/image"
import { TransitionLink } from "./TransitionLink"
import { RevealText } from "./RevealText"
import { ExternalLinkLabel } from "./ExternalLinkLabel"
import type { Project } from "../data/projects"
import type { ResolvedMedia } from "../lib/projectMedia"

type ProjectCaseProps = {
  project: Project
  /** Measured on the server — see app/lib/projectMedia.ts. */
  hero: ResolvedMedia
  media: ResolvedMedia[]
  previous: Project | null
  next: Project | null
}

/** A project page: a banner that fills the first screen, then a column that
 * holds still on the left while images scroll past it on the right.
 *
 * The sticky column is the point of the layout. Everything needed to interpret
 * what is on screen — what the project is, what was done on it, with what —
 * stays put for as long as the reader is looking at the images, so they never
 * scroll back up to remember whose work this is.
 *
 * The title lives in the banner rather than in that column, and not only for
 * looks: a sticky element taller than the space beneath the header sticks
 * immediately and can never be scrolled to its own end, which put the external
 * link and the pager permanently out of reach. Moving the title out is what
 * brings the column back inside the viewport.
 *
 * On phones there is no room for two columns and nothing to stick to, so
 * everything simply stacks. */
export function ProjectCase({ project, hero, media, previous, next }: ProjectCaseProps) {
  const hasPager = previous !== null || next !== null

  // The opening image appears twice on purpose: cropped into the banner band at
  // the top, then again at the head of the column at its own proportions. The
  // banner is a frame, the column is where the image is actually read.
  const columnMedia = [hero, ...media]

  const info = (
    <>
      <p className="max-w-[44ch] text-base leading-relaxed text-white/55">
        <RevealText trigger="load" delay={0.06}>
          {project.tagline}
        </RevealText>
      </p>

      <ul className="mt-6 flex flex-col gap-1.5">
        {project.services.map((service) => (
          <li key={service} className="text-sm text-white/70">
            <span aria-hidden="true" className="mr-2 text-white/35">
              ·
            </span>
            {service}
          </li>
        ))}
      </ul>

      {/* Capped in characters rather than left to fill the column: a 40% track
        * on a wide monitor is well past the line length prose stays readable
        * at. The spec table below is what actually spans the full width. */}
      <p className="mt-8 max-w-[54ch] text-sm leading-relaxed text-white/60">{project.summary}</p>

      {/* A description list, not a table: these are key/value pairs, and a
        * <table> would announce rows and columns that do not exist. */}
      <dl className="mt-8 flex flex-col">
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Fiche technique</p>
        {project.specs.map((spec) => (
          <div
            key={spec.label}
            className="flex items-baseline gap-6 border-b border-white/10 py-2.5 first:mt-3"
          >
            <dt className="w-28 shrink-0 text-[11px] uppercase tracking-[0.14em] text-white/40">
              {spec.label}
            </dt>
            <dd className="flex-1 text-sm text-white/80">{spec.value}</dd>
          </div>
        ))}
      </dl>

      {project.externalUrl && (
        <a
          href={project.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-8 inline-flex w-fit text-xs uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white"
        >
          <ExternalLinkLabel label={project.externalLabel ?? "Voir le projet"} underline />
        </a>
      )}

      {hasPager && (
        <nav
          aria-label="Navigation entre les projets"
          className="mt-10 flex items-center justify-between gap-6 border-t border-white/15 pt-5"
        >
          {previous ? (
            <TransitionLink
              href={`/projets/${previous.slug}`}
              label={previous.title}
              className="text-xs uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white"
            >
              Précédent
            </TransitionLink>
          ) : (
            <span aria-hidden="true" />
          )}
          {next && (
            <TransitionLink
              href={`/projets/${next.slug}`}
              label={next.title}
              className="text-xs uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white"
            >
              Suivant
            </TransitionLink>
          )}
        </nav>
      )}
    </>
  )

  return (
    // px-4 / md:px-8 and nothing else — the same padding the header uses, and no
    // max-width. A centred max-width box was inset from the edges on a wide
    // screen, so the title started well right of the logo above it.
    <section className="relative z-10 min-h-dvh bg-black px-4 pt-28 pb-32 text-white md:px-8 md:pt-32 md:pb-48">
      {/* The opening block is exactly one screen tall, minus the padding above
        * it, so the rule closing the meta strip lands on the bottom edge of the
        * viewport rather than somewhere down the page. The image between them
        * takes whatever height is left — a fixed height could not reach the
        * bottom on a tall screen and would overflow a short one. The min-height
        * keeps it sane on a laptop in landscape. */}
      <div className="flex h-[calc(100dvh-7rem)] min-h-[540px] flex-col md:h-[calc(100dvh-8rem)]">
        <header className="shrink-0">
          <div className="flex items-end justify-between gap-8">
            <h1 className="text-4xl leading-[0.95] tracking-[-0.03em] md:text-6xl lg:text-7xl">
              <RevealText trigger="load">{project.title}</RevealText>
            </h1>
            <TransitionLink
              href="/projets"
              label="Projets"
              className="shrink-0 pb-2 text-xs uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white"
            >
              Retour aux projets
            </TransitionLink>
          </div>
          <div className="mt-6 h-px w-full bg-white/15" />
        </header>

        {/* `fill` plus object-cover keeps the proportions intact inside a band
          * whose height it does not control: the image is cropped to the band,
          * never squashed to fit it. Its full shape is shown at the head of the
          * column below. min-h-0 lets this flex child shrink under its content,
          * which is what stops the block growing past one screen. */}
        <div className="relative mt-6 min-h-0 w-full flex-1 overflow-hidden rounded-md">
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Three tracks so the middle label sits at the centre of the page and
          * not at the centre of whatever is left over beside the year. */}
        <div className="grid shrink-0 grid-cols-3 items-center border-b border-white/10 py-3 text-[10px] uppercase tracking-[0.18em] text-white/40">
          <span>{project.bannerMeta[0]}</span>
          <span className="text-center tracking-[0.24em]">
            {project.bannerMeta.slice(1).join("   ·   ")}
          </span>
          <span aria-hidden="true" />
        </div>
      </div>

      {/* The left track is a share of the page, not a fixed width. At 20rem it
        * was 22% of a wide screen and shrank as a proportion the bigger the
        * monitor got — the same mistake the pixel ceiling made on the rings. */}
      <div className="mt-14 grid gap-14 md:grid-cols-[minmax(0,40%)_minmax(0,1fr)] lg:gap-20">
        {/* Two conditions guard the sticky, and both are load-bearing.
          *
          * self-start, because a grid item stretches to its row's full height by
          * default and an element as tall as its track has nothing left to
          * travel within — without it nothing sticks at all.
          *
          * The height query, because a sticky element taller than the space
          * under the header pins there instantly and can never be scrolled to
          * its own end: the external link and the pager end up below the fold
          * with no way to reach them. Under 800px of viewport there is no such
          * room, so the column simply scrolls with the page — which is the
          * correct behaviour on a short screen anyway.
          *
          * The underscores in the media query are Tailwind's escape for a space
          * inside an arbitrary variant. Without them it emits
          * `(min-width:768px)and(min-height:800px)`, which is not valid CSS and
          * takes the whole stylesheet down with it.
          *
          * The max-height is the last resort for a project with far more to say
          * than this one. Its scrollbar is left visible on purpose: it appears
          * only when content genuinely overflows, and hiding it there would hide
          * the fact that there is more to read. */}
        <aside className="md:max-h-[calc(100dvh-7rem)] md:self-start md:overflow-y-auto [@media(min-width:768px)_and_(min-height:800px)]:sticky [@media(min-width:768px)_and_(min-height:800px)]:top-24">
          {info}
        </aside>

        {/* Each image keeps the proportions of its own file: only the width is
          * set, the height follows. Imposing a ratio here would crop screenshots
          * of different shapes. */}
        <div className="flex flex-col gap-4 md:gap-6">
          {columnMedia.map((item, index) => (
            // The index is part of the key because the opening image also heads
            // this column, so its source appears twice on the page.
            //
            // width and height are the file's real dimensions, measured at build
            // time. They are what `h-auto w-full` derives the drawn height from,
            // and what stops the page reflowing as each image arrives.
            <Image
              key={`${index}-${item.src}`}
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(max-width: 767px) 100vw, 66vw"
              className="h-auto w-full rounded-md"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
