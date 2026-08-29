import type { Metadata } from "next";
import { Footer } from "../components/Footer";
import { HeaderColorController } from "../components/HeaderColorController";
import { ProcessSteps } from "../components/ProcessSteps";
import { RevealText } from "../components/RevealText";
import { ScrollCue } from "../components/ScrollCue";
import { ServiceShowcase } from "../components/ServiceShowcase";
import { TransitionLink } from "../components/TransitionLink";
import { pageOpenGraph } from "../lib/site";

export const metadata: Metadata = {
  // Kept under 50 characters so the template's " | Behsse" still fits inside
  // the ~60 a result shows before it truncates.
  title: "Services | Création de site web sur-mesure",
  description:
    "Branding, design d'interface et développement Next.js. Prestations, méthode de travail en trois étapes et livrables détaillés : ce que je fais et comment on avance ensemble.",
  keywords: [
    "création de site internet",
    "site vitrine sur-mesure",
    "refonte de site web",
    "identité visuelle et logo",
    "design d'interface UX UI",
    "développement Next.js freelance",
  ],
  alternates: { canonical: "/service" },
  openGraph: pageOpenGraph({
    url: "/service",
    title: "Services | Création de site web sur-mesure",
    description:
      "Branding, design d'interface et développement Next.js. Les prestations et la méthode de travail de Behsse.",
  }),
};

export default function ServicePage() {
  return (
    <div data-scroll-root className="relative isolate flex flex-1 flex-col bg-white">
      <HeaderColorController />

      <section className="relative z-10 flex min-h-dvh flex-col items-center bg-white px-4 pt-28 pb-8 text-black md:px-8 md:pt-36">
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-12 md:flex-row md:gap-16">
          <p className="text-xs uppercase tracking-[0.18em] text-black/40 md:w-40 md:shrink-0">
            <RevealText trigger="load">Ce que je fais</RevealText>
          </p>

          <div className="flex flex-1 flex-col justify-center gap-10 pb-10 md:gap-14">
            <h1 className="max-w-[20ch] text-[clamp(2rem,5.2vw,4.5rem)] leading-[0.98] tracking-[-0.04em]">
              <RevealText trigger="load" delay={0.06}>
                La stratégie donne la direction,
              </RevealText>{" "}
              <RevealText trigger="load" delay={0.12}>
                le design lui donne une forme,
              </RevealText>{" "}
              <RevealText trigger="load" delay={0.18}>
                le développement la rend réelle.
              </RevealText>
            </h1>

            <div className="flex flex-col gap-8">
              <p className="max-w-[58ch] text-sm leading-relaxed text-black/55 md:text-base">
                <RevealText trigger="load" delay={0.24}>
                  Ce qu&apos;on construit en premier, ce qu&apos;on repousse,
                  comment on tranche. Quand un projet avance vite, les décisions
                  de design doivent suivre le même rythme. J&apos;apporte le
                  regard UX qui garantit que ce qui est construit est bien la
                  bonne chose. Je travaille avec peu de clients à la fois : tu as
                  toute mon attention.
                </RevealText>
              </p>

              {/* Side by side down to the narrowest phone, which is why the
                * label shrinks below md: at the desktop size the pair is 389px
                * wide and a 375px screen has 343px of room, so they would wrap
                * one under the other. */}
              {/* The mask wraps each button whole, pill included. Masking only
                * the label left the two backgrounds sitting there from the
                * first frame while their text slid up inside them. */}
              <div className="flex w-full items-center gap-3 sm:w-auto sm:justify-start">
                <RevealText trigger="load" delay={0.3}>
                  <TransitionLink
                    href="/projets"
                    label="Projets"
                    className="inline-flex items-center justify-center rounded-full border border-black/20 px-4 py-3 text-[0.8rem] font-medium whitespace-nowrap text-black transition-colors hover:border-black md:px-6 md:text-md"
                  >
                    Voir tous les projets
                  </TransitionLink>
                </RevealText>
                <RevealText trigger="load" delay={0.34}>
                  <TransitionLink
                    href="/contact"
                    label="Contact"
                    // A transparent border of the same width as the outlined
                    // button's, so the two pills end up exactly the same height
                    // instead of differing by the 2px of border.
                    className="inline-flex items-center justify-center rounded-full border border-transparent bg-black px-4 py-3 text-[0.8rem] font-medium whitespace-nowrap text-white transition-opacity hover:opacity-80 md:px-6 md:text-md"
                  >
                    Réserve un appel
                  </TransitionLink>
                </RevealText>
              </div>
            </div>
          </div>
        </div>

        <ScrollCue tone="dark" className="shrink-0" />
      </section>

      <ProcessSteps />

      <ServiceShowcase />

      <Footer />
    </div>
  );
}
