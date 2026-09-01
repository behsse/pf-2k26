import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { HeaderColorController } from "./HeaderColorController";

/** A titled block inside a legal page.
 *
 * These documents are read by someone looking for ONE thing: how to have their
 * data deleted, who hosts the site, which court applies. Headings are what make
 * that findable, and being real `h2`s they also give the page an outline a
 * screen reader can jump through. */
export function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl tracking-[-0.02em] text-black md:text-3xl">{title}</h2>
      {children}
    </section>
  )
}

/** A definition list for the blocks that are pure facts: an editor's details,
 * a host's address, a retention period. Prose would bury them. */
export function LegalFacts({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <dl className="flex flex-col gap-3">
      {rows.map(([label, value]) => (
        // `items-baseline`, not the default `stretch`. The label is set smaller
        // than the value, so aligning the two boxes by their tops leaves the
        // label's text visibly riding above the value's: two different line
        // heights starting at the same y. Aligning the first BASELINES puts the
        // two strings on the same line of writing, which is what the eye reads
        // as aligned, and it keeps holding when either side wraps.
        <div key={label} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
          <dt className="shrink-0 text-sm uppercase tracking-[0.12em] text-black/40 sm:w-56">
            {label}
          </dt>
          <dd className="min-w-0 flex-1 text-black/70">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Shared shell for the legal pages, so the three of them stay consistent and
 * only their wording differs. */
export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string
  /** Shown under the title. A legal notice with no date is impossible to rely
   * on: nobody can tell which version they agreed to. */
  updatedAt: string
  children: ReactNode
}) {
  return (
    <div data-scroll-root className="relative isolate flex flex-1 flex-col bg-white">
      <HeaderColorController />
      {/* min-h-dvh even for a two-paragraph page: the footer is fixed behind
        * the content, so anything shorter than the viewport leaves it showing
        * before a single scroll. */}
      <section className="relative z-10 min-h-dvh bg-white px-4 pt-40 pb-32 text-black md:px-8 md:pt-52">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 mb-12 text-sm uppercase tracking-[0.12em] text-black/40">
            Dernière mise à jour : {updatedAt}
          </p>
          <div className="flex flex-col gap-12 text-base leading-relaxed text-black/70 md:text-lg">
            {children}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
