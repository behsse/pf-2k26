import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions d'utilisation du site Behsse.",
  alternates: { canonical: "/conditions-utilisation" },
  robots: { index: false, follow: true },
};

export default function ConditionsUtilisationPage() {
  return (
    <LegalPage title="Conditions d'utilisation">
      <p>
        L&apos;accès à ce site vaut acceptation des présentes conditions. Il est
        consultable librement, à titre informatif.
      </p>
      <p>
        L&apos;ensemble des contenus (textes, visuels, code et identité) est
        protégé par le droit d&apos;auteur. Toute reproduction ou réutilisation
        sans accord écrit préalable est interdite.
      </p>
      <p>
        Les projets présentés le sont à titre de portfolio ; les marques et
        visuels appartenant à leurs clients respectifs restent leur propriété.
      </p>
    </LegalPage>
  );
}
