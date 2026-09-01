import type { Metadata } from "next";
import { LegalPage, LegalSection } from "../components/LegalPage";
import { EMAIL } from "../data/contact";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description:
    "Règles d'accès et d'usage du site Behsse : propriété intellectuelle, responsabilité, liens externes et droit applicable.",
  alternates: { canonical: "/conditions-utilisation" },
};

/** Conditions générales d'UTILISATION, not de vente.
 *
 * The distinction matters: this site presents work and opens a conversation, it
 * sells nothing online. CGV would be required the day a service is ordered and
 * paid through the site, and they would have to carry the right of withdrawal,
 * the payment terms and the delivery terms. Until then, publishing CGV would
 * describe a transaction that does not exist.
 *
 * Commercial terms live in the quote and the contract signed with each client,
 * which is what the last section says. */
export default function ConditionsUtilisationPage() {
  return (
    <LegalPage title="Conditions d'utilisation" updatedAt="30 août 2026">
      <LegalSection title="Objet">
        <p>
          Les présentes conditions régissent l&apos;accès et l&apos;utilisation du site
          Behsse. Elles ne portent que sur la consultation du site : elles ne
          constituent ni une offre de vente, ni les conditions d&apos;une prestation,
          lesquelles font l&apos;objet d&apos;un devis et d&apos;un contrat distincts.
        </p>
      </LegalSection>

      <LegalSection title="Acceptation">
        <p>
          Naviguer sur ce site vaut acceptation pleine et entière des présentes
          conditions. Si vous n&apos;y consentez pas, il vous appartient de ne pas
          l&apos;utiliser. Les mentions légales et la politique de confidentialité en
          font partie intégrante.
        </p>
      </LegalSection>

      <LegalSection title="Accès au site">
        <p>
          Le site est accessible gratuitement, sans création de compte. Il peut
          être interrompu à tout moment, notamment pour maintenance, mise à jour
          ou raison technique, sans préavis ni indemnité. L&apos;éditeur ne garantit
          pas une disponibilité ininterrompue et ne saurait être tenu responsable
          d&apos;une indisponibilité, quelle qu&apos;en soit la durée.
        </p>
        <p>
          Les frais d&apos;accès (matériel, connexion) restent à votre charge.
        </p>
      </LegalSection>

      <LegalSection title="Usage autorisé">
        <p>
          Le site est destiné à un usage personnel et informatif. Sont notamment
          interdits : toute tentative d&apos;accès non autorisé, l&apos;extraction
          automatisée massive du contenu, l&apos;utilisation du formulaire de contact
          à des fins de prospection ou d&apos;envoi en masse, et tout comportement
          susceptible de perturber le fonctionnement du service.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des contenus (textes, visuels, photographies,
          illustrations, code source et identité graphique) est protégé par le
          droit d&apos;auteur. Toute reproduction, représentation ou réutilisation,
          totale ou partielle, sans autorisation écrite préalable, est interdite
          et constitue une contrefaçon au sens des articles L335-2 et suivants du
          code de la propriété intellectuelle.
        </p>
        <p>
          Les projets présentés le sont à titre de portfolio. Les marques, logos
          et visuels appartenant à des tiers restent la propriété de leurs
          titulaires respectifs.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          Les informations publiées sont fournies à titre indicatif et peuvent
          évoluer. L&apos;éditeur s&apos;efforce d&apos;en assurer l&apos;exactitude sans pouvoir la
          garantir, et ne saurait être tenu responsable d&apos;un dommage résultant de
          leur utilisation, ni d&apos;une erreur ou d&apos;une omission.
        </p>
        <p>
          Il vous appartient de protéger votre équipement contre toute forme de
          contamination ou d&apos;intrusion.
        </p>
      </LegalSection>

      <LegalSection title="Liens externes">
        <p>
          Ce site renvoie vers des sites tiers, notamment vers les projets
          présentés et vers des réseaux sociaux. Ces sites échappent au contrôle
          de l&apos;éditeur, qui ne peut être tenu responsable de leur contenu, de
          leur disponibilité ni de leurs pratiques en matière de données.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le traitement des données transmises via ce site est détaillé dans la{" "}
          <a href="/confidentialite" className="text-black underline underline-offset-4">
            politique de confidentialité
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Modification des conditions">
        <p>
          Ces conditions peuvent être modifiées à tout moment. La version
          applicable est celle en ligne au moment de votre visite, datée en haut
          de cette page.
        </p>
      </LegalSection>

      <LegalSection title="Droit applicable et litiges">
        {/* Deliberately no named court.
          *
          * Article 48 of the code de procédure civile treats a clause that
          * departs from the ordinary rules of territorial jurisdiction as
          * unwritten, unless BOTH parties contracted as merchants, and article
          * R212-2 of the code de la consommation lists such a clause among the
          * unfair terms when facing a consumer. Naming the publisher's own
          * court would therefore be unenforceable in nearly every case this
          * site is likely to produce, while exposing the terms to being
          * qualified as abusive. Deferring to the ordinary rules is valid in
          * all of them and needs no placeholder. */}
        <p>
          Les présentes conditions sont soumises au droit français. En cas de
          litige, une solution amiable sera recherchée en priorité, en écrivant à{" "}
          {EMAIL}. À défaut d&apos;accord, le litige relèvera des juridictions
          françaises compétentes selon les règles de droit commun.
        </p>
        <p>
          Si vous êtes un consommateur, vous conservez le droit de saisir la
          juridiction du lieu de votre domicile et de recourir au médiateur
          désigné dans les mentions légales.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
