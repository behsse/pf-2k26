import type { Metadata } from "next";
import Image from "next/image";
import meProImage from "@/public/me-pro.webp";
import { TransitionLink } from "../components/TransitionLink";
import { Footer } from "../components/Footer";
import { HeaderColorController } from "../components/HeaderColorController";
import { AboutStory } from "../components/AboutStory";
import { RevealText } from "../components/RevealText";
import { ScrollCue } from "../components/ScrollCue";
import { pageOpenGraph } from "../lib/site";

/** Title and description are what actually show in search results, so they
 * lead with the searched phrasing rather than a bare page name. */
export const metadata: Metadata = {
  title: "À propos | Designer et développeur web freelance",
  description:
    "Sébastien, alias Behsse : designer et développeur web freelance en France, autodidacte. Je conçois et développe des sites sur-mesure pour des startups et des entreprises établies, de l'identité à la mise en ligne.",
  keywords: [
    "designer et développeur freelance",
    "freelance autodidacte",
    "création de site sur-mesure",
    "creative developer France",
  ],
  alternates: { canonical: "/about" },
  openGraph: pageOpenGraph({
    url: "/about",
    title: "À propos | Designer et développeur web freelance",
    description:
      "Sébastien, alias Behsse : designer et développeur web freelance en France. Des sites sur-mesure, de l'identité à la mise en ligne.",
  }),
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
          <RevealText trigger="load">Creative developer</RevealText>
        </h1>

        {/* flex-1 hands this wrapper whatever height is left between the title
          * and the paragraph, and the portrait sizes itself to fill it. Driving
          * the image off its own width instead would let it dictate the layout
          * and push the rest past the fold on a short viewport. min-h-0 is what
          * allows a flex child to shrink below its content's natural size. */}
        <div className="flex min-h-0 w-full flex-1 items-center justify-center py-6">
          {/* The height is the only dimension set, and the width follows from
            * the file's own proportions.
            *
            * It used to be a `fill` image in an `aspect-4/5` box, which meant
            * the box decided the shape and `object-cover` cropped whatever did
            * not agree — me-pro.webp is 941×1672, nowhere near 4:5, so its top
            * and bottom were being cut off. Importing the file gives next/image
            * its real dimensions, and `h-… w-auto` then reproduces them exactly.
            * Swap the portrait for one of any shape and the layout follows.
            *
            * The vh unit still lets it grow into whatever room the flex row has
            * left between the title and the paragraph. */}
          {/* leading-[0] because the mask's inner span is an inline-block and
            * therefore sits on a text baseline, which was leaving 7px of empty
            * line box under the portrait inside the mask. */}
          <RevealText trigger="load" delay={0.06} className="flex-none leading-0">
            <Image
              src={meProImage}
              alt="Portrait de Behsse, designer et développeur web freelance"
              sizes="(min-width: 768px) 420px, 60vw"
              className="block h-[clamp(200px,38vh,420px)] w-auto rounded-md"
              priority
            />
          </RevealText>
        </div>

        {/* Left-aligned and full width so it lines up with the logo, capped so
          * it breaks onto two lines instead of running edge to edge as one. */}
        <p className="w-full max-w-[68ch] self-start text-left text-lg uppercase leading-[1.25] tracking-[-0.01em] md:text-[1.75rem]">
          {/* One mask around the whole sentence rather than one per line: the
            * link sits mid-sentence, and splitting it would cut the phrase in
            * two and animate the halves apart. */}
          <RevealText trigger="load" delay={0.1} className="w-full">
            Une collaboration simple, une communication claire.{" "}
            <TransitionLink
              href="/contact"
              label="Contact"
              className="underline underline-offset-[6px]"
            >
              Travaillons ensemble
            </TransitionLink>{" "}
            et construisons quelque chose qui fera grandir votre activité.
          </RevealText>
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
