import type { Metadata } from "next";
import { HeaderColorController } from "./components/HeaderColorController";
import { HeroProjectTransition } from "./components/HeroProjectTransition";
import { Services } from "./components/Services";
import { Faq } from "./components/Faq";
import { Footer } from "./components/Footer";
import { FAQ_ITEMS } from "./data/faq";
import { pageOpenGraph } from "./lib/site";

/** The home page keeps the root title as written rather than running it through
 * the `%s | Behsse` template: it is the one page whose title should read as the
 * whole positioning, and templating it would put the brand in twice. */
export const metadata: Metadata = {
  title: {
    absolute: "Behsse | Designer et développeur web freelance en France",
  },
  description:
    "Designer et développeur web freelance en France. Je conçois des sites sur-mesure qui convertissent : identité de marque, design d'interface et développement Next.js. Comptez 1 à 2 semaines pour un projet standard.",
  alternates: { canonical: "/" },
  openGraph: pageOpenGraph({
    url: "/",
    title: "Behsse | Designer et développeur web freelance en France",
    description:
      "Sites sur-mesure, identité de marque et développement Next.js. Comptez 1 à 2 semaines pour un projet standard.",
  }),
};

/** The same questions the page displays, published in the form Google reads.
 * Rendered from `FAQ_ITEMS` rather than retyped, because structured data that
 * disagrees with the visible page is a guideline violation, not just a stale
 * copy. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function Home() {
  return (
    <div data-scroll-root className="relative isolate flex flex-1 flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HeaderColorController />
      <HeroProjectTransition />
      <Services />
      <Faq />
      <Footer />
    </div>
  );
}
