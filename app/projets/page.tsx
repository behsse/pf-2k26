import type { Metadata } from "next";
import { Footer } from "../components/Footer";
import { HeaderColorController } from "../components/HeaderColorController";
import { ProjectLab } from "../components/ProjectLab";
import { pageOpenGraph } from "../lib/site";

export const metadata: Metadata = {
  title: "Projets | Portfolio design et développement web",
  description:
    "Sites sur-mesure, identités de marque, outils web et éditions imprimées. Le portfolio complet de Behsse, designer et développeur web freelance en France.",
  keywords: [
    "portfolio designer web",
    "portfolio développeur web",
    "réalisations site internet",
    "projets Next.js",
    "identité visuelle",
  ],
  alternates: { canonical: "/projets" },
  openGraph: pageOpenGraph({
    url: "/projets",
    title: "Projets | Portfolio design et développement web",
    description:
      "Sites sur-mesure, identités de marque, outils web et éditions imprimées. Le portfolio complet de Behsse.",
  }),
};

export default function ProjetsPage() {
  return (
    <div data-scroll-root className="relative isolate flex flex-1 flex-col bg-black">
      <HeaderColorController />
      <ProjectLab />
      <Footer />
    </div>
  );
}
