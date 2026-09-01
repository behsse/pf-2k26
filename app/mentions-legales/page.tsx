import type { Metadata } from "next";
import { LegalFacts, LegalPage, LegalSection } from "../components/LegalPage";
import { EMAIL } from "../data/contact";
import { SITE_URL } from "../lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Éditeur, hébergeur et propriété intellectuelle : les informations légales du site Behsse.",
  alternates: { canonical: "/mentions-legales" },
};

/** Required by article 6-III of the LCEN (loi n° 2004-575), which lists what a
 * site published in a professional capacity must state, and by article L111-1
 * of the code de la consommation for anyone selling to consumers. Omitting the
 * publisher or the host is punishable by up to a year's imprisonment and a
 * 75 000 € fine for a natural person under article 6-VI of the same law.
 *
 * Everything on this page is addressed to the READER. Notes about which field
 * applies to which legal status belong in comments like this one, never in the
 * markup: published, they read as the site being unsure of its own status. */
export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" updatedAt="30 août 2026">
      <LegalSection title="Éditeur du site">
        <LegalFacts
          rows={[
            ["Nom", "Sébastien Zielinski, exerçant sous le nom Behsse"],
            ["Statut juridique", "Entrepreneur individuel"],
            ["Adresse", "335 rue Nationale, 62290 Noeux-les-Mines"],
            ["Téléphone", "06 89 03 85 05"],
            ["Email", EMAIL],
            ["SIREN", "904 472 347"],
            [
              "Immatriculation",
              "Immatriculée au Registre national des entreprises (RNE) tenu par l'INPI",
            ],
            [
              "TVA intracommunautaire",
              "TVA non applicable, article 293 B du CGI (franchise en base)",
            ],
            ["Directeur de la publication", "Sébastien Zielinski"],
          ]}
        />
      </LegalSection>

      <LegalSection title="Hébergeur">
        <LegalFacts
          rows={[
            ["Société", "Vercel Inc."],
            ["Adresse", "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis"],
            ["Site", "vercel.com"],
            ["Contact", "privacy@vercel.com"],
          ]}
        />
        <p>
          Les serveurs utilisés pour la diffusion de ce site se trouvent dans la
          région de Paris.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble de ce site (structure, textes, visuels, photographies,
          illustrations, code source et identité graphique) est protégé par le
          droit d&apos;auteur et reste la propriété exclusive de son éditeur, sauf
          mention contraire.
        </p>
        <p>
          Toute reproduction, représentation, adaptation ou exploitation, totale
          ou partielle, sur quelque support que ce soit, est interdite sans
          autorisation écrite préalable. Une telle utilisation constituerait une
          contrefaçon au sens des articles L335-2 et suivants du code de la
          propriété intellectuelle.
        </p>
        <p>
          Les projets présentés le sont à titre de portfolio. Les marques, logos
          et visuels appartenant aux clients ou aux tiers cités restent la
          propriété de leurs titulaires respectifs, et leur présence ici ne vaut
          ni partenariat ni approbation de leur part.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le traitement des données transmises via ce site est décrit dans la{" "}
          <a href="/confidentialite" className="text-black underline underline-offset-4">
            politique de confidentialité
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Crédits">
        <p>
          Conception, design et développement : Behsse. Site accessible à
          l&apos;adresse {SITE_URL.replace("https://", "")}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
