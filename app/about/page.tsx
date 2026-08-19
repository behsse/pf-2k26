import type { Metadata } from "next";
import Image from "next/image";
import { TransitionLink } from "../components/TransitionLink";
import { Footer } from "../components/Footer";
import { HeaderColorController } from "../components/HeaderColorController";
import { AboutStory } from "../components/AboutStory";
import { ScrollCue } from "../components/ScrollCue";

/** Title and description are what actually show in search results, so they
 * lead with the searched phrasing rather than a bare page name. */
export const metadata: Metadata = {
  title: "À propos — Behsse, designer et développeur web freelance",
  description:
    "Designer et développeur web freelance en France. Je conçois et développe des sites sur-mesure pour des startups et des entreprises établies — de l'identité à la mise en ligne.",
};

export default function AboutPage() {
  return (
    <div data-scroll-root className="relative isolate flex flex-1 flex-col bg-white">
      <HeaderColorController />

      {/* justify-end pins the whole block to the bottom of the screen; the
        * nav-sized top padding only guards against it colliding with the header
        * on short viewports. */}
      <section
        aria-labelledby="about-title"
        className="relative z-10 flex min-h-dvh flex-col items-center bg-white px-4 pt-24 pb-8 text-black md:px-8 md:pt-28"
      >
        <h1
          id="about-title"
          className="text-center text-[clamp(2.5rem,9.5vw,10rem)] font-light uppercase leading-[0.9] tracking-[-0.03em]"
        >
          Creative developer
        </h1>

        {/* flex-1 hands this wrapper whatever height is left between the title
          * and the paragraph, and the portrait sizes itself to fill it. Driving
          * the image off its own width instead would let it dictate the layout
          * and push the rest past the fold on a short viewport. min-h-0 is what
          * allows a flex child to shrink below its content's natural size. */}
        <div className="flex min-h-0 w-full flex-1 items-center justify-center py-6">
          {/* An explicit height, not h-full or self-stretch. The image inside is
            * absolutely positioned so it contributes no size of its own, and a
            * height that comes from flex stretching is not a base `aspect-ratio`
            * will derive a width from — the box ended up 0 wide either way. A
            * definite height makes the ratio produce the width, and the vh unit
            * still lets the portrait grow with the space available. */}
          <div className="relative aspect-[4/5] h-[clamp(200px,38vh,420px)] flex-none overflow-hidden">
            <Image
              src="/about.webp"
              alt="Portrait de Behsse, designer et développeur web freelance"
              fill
              sizes="336px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Left-aligned and full width so it lines up with the logo, capped so
          * it breaks onto two lines instead of running edge to edge as one. */}
        <p className="w-full max-w-[68ch] self-start text-left text-lg uppercase leading-[1.25] tracking-[-0.01em] md:text-[1.75rem]">
          Une collaboration simple, une communication claire.{" "}
          <TransitionLink
            href="/contact"
            label="Contact"
            className="underline underline-offset-[6px]"
          >
            Travaillons ensemble
          </TransitionLink>{" "}
          et construisons quelque chose qui fera grandir votre activité.
        </p>

        <ScrollCue tone="dark" className="mt-6 shrink-0 md:mt-8" />
      </section>

      <section className="relative z-10 bg-white px-4 pb-32 text-black md:px-8 md:pb-48">
        <AboutStory />
      </section>

      <Footer />
    </div>
  );
}
