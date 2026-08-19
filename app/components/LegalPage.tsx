import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { HeaderColorController } from "./HeaderColorController";

/** Shared shell for the legal pages, so the three of them stay consistent and
 * only their wording differs. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div data-scroll-root className="relative isolate flex flex-1 flex-col bg-white">
      <HeaderColorController />
      {/* min-h-dvh even for a two-paragraph page: the footer is fixed behind
        * the content, so anything shorter than the viewport leaves it showing
        * before a single scroll. */}
      <section className="relative z-10 min-h-dvh bg-white px-4 pt-40 pb-32 text-black md:px-8 md:pt-52">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-10 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-6xl">
            {title}
          </h1>
          <div className="flex flex-col gap-6 text-base leading-relaxed text-black/70 md:text-lg">
            {children}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
