import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Behsse",
  description:
    "Comment les données transmises via le site Behsse sont collectées, utilisées et conservées.",
  robots: { index: false },
};

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <p>
        Les seules données collectées sont celles que vous transmettez
        volontairement via le formulaire de contact ou par email : nom, adresse
        email et contenu de votre message.
      </p>
      <p>
        Elles servent uniquement à répondre à votre demande et ne sont ni
        revendues ni transmises à des tiers.
      </p>
      <p>
        Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de
        rectification et de suppression de vos données. Pour l&apos;exercer :
        behsse.pro@gmail.com.
      </p>
      <h2 className="mt-6 text-2xl tracking-[-0.02em] text-black md:text-3xl">
        Cookies et mesure d&apos;audience
      </h2>
      <p>
        Aucun outil de mesure d&apos;audience n&apos;est actif sur ce site à ce
        jour, et aucun cookie publicitaire ou de suivi n&apos;y est déposé. Le
        bandeau de consentement est en place pour le jour où un outil de mesure
        sera ajouté : tant que vous n&apos;avez pas cliqué sur « Accepter »,
        aucun traceur ne se déclenche.
      </p>
      <p>
        Votre choix est enregistré dans le stockage local de votre navigateur,
        et non dans un cookie. Cet enregistrement est strictement nécessaire
        pour respecter votre décision : il ne sert à rien d&apos;autre et ne
        permet pas de vous identifier. Il est conservé six mois, durée
        recommandée par la CNIL, après quoi la question vous est reposée.
      </p>
      <p>
        Vous pouvez revenir sur votre choix à tout moment via le lien
        « Cookies » présent en bas de chaque page, aussi facilement que vous
        l&apos;avez donné.
      </p>
      <p>
        Durée de conservation des messages reçus et nom de l&apos;hébergeur
        restent à préciser une fois ces choix arrêtés.
      </p>
    </LegalPage>
  );
}
