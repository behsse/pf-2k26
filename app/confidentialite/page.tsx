import type { Metadata } from "next";
import { LegalFacts, LegalPage, LegalSection } from "../components/LegalPage";
import { EMAIL } from "../data/contact";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Quelles données sont collectées sur le site Behsse, pourquoi, combien de temps, et comment exercer vos droits RGPD.",
  alternates: { canonical: "/confidentialite" },
};

/** Written against articles 12 to 14 of the GDPR, which fix WHAT has to be
 * stated and in what terms: identity of the controller, purpose and legal basis
 * of each processing operation, recipients, transfers outside the EU, retention
 * period, the visitor's rights, and the right to complain to a supervisory
 * authority.
 *
 * The content below describes what this codebase ACTUALLY does, which is the
 * only version worth publishing:
 *  - the contact form emails its answers through Resend and stores nothing;
 *  - the API keeps the caller's IP in memory to rate-limit abuse;
 *  - the consent choice lives in localStorage, not in a cookie;
 *  - no analytics tool is installed today.
 * If any of that changes, this page changes with it. */
export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updatedAt="30 août 2026">
      <LegalSection title="Responsable du traitement">
        <LegalFacts
          rows={[
            ["Responsable", "Sébastien Zielinski, exerçant sous le nom Behsse"],
            ["Adresse", "335 rue Nationale, 62290 Noeux-les-Mines"],
            ["Email", EMAIL],
          ]}
        />
        <p>
          Aucun délégué à la protection des données n&apos;a été désigné : l&apos;activité
          ne relève d&apos;aucun des cas où la désignation est obligatoire au titre de
          l&apos;article 37 du RGPD.
        </p>
      </LegalSection>

      <LegalSection title="Ce qui est collecté, et pourquoi">
        <p>
          Aucune donnée n&apos;est collectée en naviguant sur ce site. Les seules
          informations traitées sont celles que vous transmettez vous-même, plus
          les données techniques strictement nécessaires au fonctionnement et à
          la sécurité du service.
        </p>

        <LegalFacts
          rows={[
            [
              "Formulaire de contact",
              "Les réponses que vous saisissez : nature du projet, budget et délais indiqués, description, prénom ou nom, et adresse email. Finalité : répondre à votre demande et préparer une éventuelle collaboration. Base légale : l'exécution de mesures précontractuelles prises à votre demande (article 6.1.b du RGPD).",
            ],
            [
              "Adresse IP",
              "Conservée en mémoire vive quelques minutes par le serveur qui reçoit le formulaire, uniquement pour limiter le nombre d'envois successifs. Finalité : empêcher les envois automatisés. Base légale : l'intérêt légitime à protéger le service contre les abus (article 6.1.f).",
            ],
            [
              "Journaux d'hébergement",
              "L'hébergeur enregistre automatiquement les requêtes reçues (adresse IP, date, page demandée, navigateur) pour assurer la disponibilité et la sécurité du site. Base légale : intérêt légitime (article 6.1.f).",
            ],
            [
              "Choix de consentement",
              "Votre réponse au bandeau est enregistrée dans le stockage local de votre navigateur. Base légale : obligation légale de conserver la preuve de votre choix (article 6.1.c).",
            ],
          ]}
        />

        <p>
          Fournir ces informations n&apos;est jamais obligatoire, mais sans adresse
          email il est matériellement impossible de vous répondre. Aucune décision
          automatisée ni aucun profilage n&apos;est effectué, et vos données ne sont
          ni vendues, ni louées, ni transmises à des fins publicitaires.
        </p>
      </LegalSection>

      <LegalSection title="Qui y a accès">
        <p>
          Les messages arrivent dans une boîte email personnelle, à laquelle
          l&apos;éditeur du site est seul à accéder. Trois prestataires techniques
          interviennent en qualité de sous-traitants, chacun sur un périmètre
          limité :
        </p>
        <LegalFacts
          rows={[
            [
              "Vercel Inc.",
              "Hébergement du site et exécution du formulaire. États-Unis, avec des serveurs en région parisienne.",
            ],
            [
              "Resend",
              "Acheminement de l'email contenant vos réponses. États-Unis.",
            ],
            [
              "Google",
              "Hébergement de la boîte de réception où arrive le message (compte Gmail). États-Unis.",
            ],
          ]}
        />
        <p>
          Vercel et Resend interviennent comme sous-traitants au sens de
          l&apos;article 28 du RGPD. Ces prestataires étant établis hors de l&apos;Union
          européenne, les transferts sont encadrés par les clauses
          contractuelles types de la Commission européenne et, le cas échéant,
          par la certification au Data Privacy Framework.
        </p>
        <p>
          La boîte de réception est actuellement un compte Gmail grand public.
          Les messages qui y parviennent sont donc soumis aux conditions
          d&apos;utilisation et à la politique de confidentialité de Google, et non à
          un accord de sous-traitance négocié. Cette précision figure ici parce
          qu&apos;elle change la nature de la garantie qui vous est due, et elle sera
          mise à jour lors du passage à une adresse professionnelle.
        </p>
      </LegalSection>

      <LegalSection title="Combien de temps">
        <LegalFacts
          rows={[
            [
              "Messages reçus",
              "Trois ans à compter du dernier échange pour les demandes sans suite, conformément à la recommandation de la CNIL en matière de prospection.",
            ],
            [
              "Documents contractuels",
              "Dix ans à compter de la clôture de l'exercice, au titre des obligations comptables (article L123-22 du code de commerce).",
            ],
            ["Adresse IP du formulaire", "Quelques minutes, en mémoire, jamais écrite sur disque."],
            ["Journaux d'hébergement", "Conservés par l'hébergeur selon sa propre politique."],
            ["Choix de consentement", "Six mois, durée recommandée par la CNIL, puis la question vous est reposée."],
          ]}
        />
      </LegalSection>

      <LegalSection title="Cookies et mesure d'audience">
        <p>
          Aucun outil de mesure d&apos;audience n&apos;est actif sur ce site à ce jour, et
          aucun cookie publicitaire ou de suivi n&apos;y est déposé. Le bandeau de
          consentement est en place pour le jour où un outil de mesure sera
          ajouté : tant que vous n&apos;avez pas cliqué sur « Accepter », aucun
          traceur ne se déclenche.
        </p>
        <p>
          Votre choix est enregistré dans le stockage local de votre navigateur,
          et non dans un cookie. Cet enregistrement est strictement nécessaire
          pour respecter votre décision : il ne sert à rien d&apos;autre et ne permet
          pas de vous identifier. Refuser est aussi simple qu&apos;accepter, en un
          clic sur le même écran, et vous pouvez revenir sur votre choix à tout
          moment via le lien « Cookies » présent en bas de chaque page.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et de
          limitation du traitement, d&apos;un droit d&apos;opposition pour les traitements
          fondés sur l&apos;intérêt légitime, d&apos;un droit à la portabilité de vos
          données, et du droit de définir des directives sur leur sort après votre
          décès (article 85 de la loi Informatique et Libertés).
        </p>
        <p>
          Pour exercer l&apos;un de ces droits, écrivez à {EMAIL}. Une réponse vous
          sera apportée dans un délai d&apos;un mois, prolongeable de deux mois si la
          demande est complexe. Une preuve d&apos;identité pourra être demandée en cas
          de doute raisonnable sur l&apos;identité du demandeur.
        </p>
        <p>
          Si la réponse ne vous satisfait pas, vous pouvez introduire une
          réclamation auprès de la CNIL, 3 place de Fontenoy, TSA 80715, 75334
          Paris Cedex 07, ou en ligne sur{" "}
          <a
            href="https://www.cnil.fr/fr/plaintes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black underline underline-offset-4"
          >
            cnil.fr
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Sécurité">
        <p>
          Le site est servi exclusivement en HTTPS. Le formulaire est protégé
          contre les envois automatisés, et les réponses transitent chiffrées
          jusqu&apos;à la boîte de réception. Aucune base de données n&apos;est associée à
          ce site : rien de ce que vous saisissez n&apos;y est stocké.
        </p>
      </LegalSection>

      <LegalSection title="Modifications">
        <p>
          Cette politique peut évoluer, notamment si un outil de mesure d&apos;audience
          est ajouté. La date de dernière mise à jour figure en haut de cette
          page.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
