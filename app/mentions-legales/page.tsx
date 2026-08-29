import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Behsse, designer et développeur web freelance.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales">
      <p>
        Éditeur du site : Sébastien (Behsse), designer et développeur web
        freelance. Contact : behsse.pro@gmail.com.
      </p>
      <p>
        Statut juridique, numéro SIREN, adresse du siège et nom de l&apos;hébergeur
        restent à compléter, ce sont des mentions obligatoires.
      </p>
    </LegalPage>
  );
}
