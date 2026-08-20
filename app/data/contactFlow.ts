/** The contact experience, described as data rather than markup.
 *
 * Both sides read this file: the client walks the steps to build the screens,
 * and the API route walks the same steps to decide which answers are required
 * and how to label them in the email. Keeping one definition is what stops the
 * form and its validation from drifting apart.
 *
 * Nothing here is a React component and nothing imports the DOM, so the module
 * is safe on the server. */

export type ChipOption = {
  /** Stored in the answers and sent to the API. Kept stable — the labels can be
   * rewritten freely, these cannot without invalidating old submissions. */
  value: string
  label: string
}

/** One single-select row inside a `choice-group` step. Its `id` — not the
 * step's — is the key the chosen value lands under in the answers. */
export type ChoiceGroup = {
  id: string
  label: string
  options: ChipOption[]
}

type StepBase = {
  /** Answer key, except for `choice-group` steps where the groups own the keys. */
  id: string
  question: string
  /** Short name for this answer in the recap and in the email. The question
   * itself is written to be read out loud one screen at a time and makes a poor
   * column header — "Commençons par toi. Tu t'appelles comment ?" versus "Nom". */
  recapLabel: string
  /** Second line under the question: context, or what makes a good answer. */
  hint?: string
  /** Skippable. `Suivant` stays enabled with the field left empty. */
  optional?: boolean
}

export type ContactStep = StepBase &
  (
    | { kind: "text" | "email" | "tel"; placeholder: string }
    | { kind: "textarea"; placeholder: string }
    | { kind: "choice"; options: ChipOption[]; multiple?: boolean }
    | { kind: "choice-group"; groups: ChoiceGroup[] }
  )

export type ContactBranch = {
  id: string
  /** Hub button label. */
  label: string
  /** Used in the recap heading and as the email subject prefix. */
  title: string
  steps: ContactStep[]
}

/** Offered on every "how much / when" question. A forced budget bracket is the
 * fastest way to lose someone who genuinely has not decided yet. */
const UNDECIDED: ChipOption = { value: "indecis", label: "Je ne sais pas encore" }

export const CONTACT_BRANCHES: ContactBranch[] = [
  {
    id: "projet",
    label: "Démarrer un projet",
    title: "Nouveau projet",
    steps: [
      {
        id: "nom",
        recapLabel: "Nom",
        kind: "text",
        question: "Commençons par toi. Tu t'appelles comment ?",
        placeholder: "Ton prénom",
      },
      {
        id: "structure",
        recapLabel: "Structure",
        kind: "text",
        optional: true,
        question: "Tu représentes qui ?",
        hint: "Le nom de ta structure ou rien du tout si le projet est perso.",
        placeholder: "Nom de l'entreprise",
      },
      {
        id: "perimetre",
        recapLabel: "Périmètre",
        kind: "choice",
        multiple: true,
        question: "J'interviens sur quoi ?",
        hint: "Plusieurs réponses possibles.",
        options: [
          { value: "site-vitrine", label: "Site vitrine" },
          { value: "e-commerce", label: "E-commerce" },
          { value: "application-web", label: "Application web" },
          { value: "application-mobile", label: "Application mobile" },
          { value: "identite", label: "Identité de marque" },
          { value: "refonte", label: "Refonte" },
          { value: "autre", label: "Autre chose" },
        ],
      },
      {
        id: "cadre",
        recapLabel: "Cadre",
        kind: "choice-group",
        question: "On travaille dans quel cadre ?",
        hint: "Une fourchette suffit elle sert à cadrer, pas à t'engager.",
        groups: [
          {
            id: "budget",
            label: "Budget",
            options: [
              { value: "moins-2k", label: "Moins de 2 000 €" },
              { value: "2k-5k", label: "2 000 – 5 000 €" },
              { value: "5k-10k", label: "5 000 – 10 000 €" },
              { value: "10k-25k", label: "10 000 – 25 000 €" },
              { value: "plus-25k", label: "Plus de 25 000 €" },
              UNDECIDED,
            ],
          },
          {
            id: "echeance",
            label: "Échéance",
            options: [
              { value: "asap", label: "Le plus tôt possible" },
              { value: "1-3-mois", label: "Dans 1 à 3 mois" },
              { value: "3-6-mois", label: "Dans 3 à 6 mois" },
              { value: "pas-de-date", label: "Pas de date arrêtée" },
              UNDECIDED,
            ],
          },
        ],
      },
      {
        id: "brief",
        recapLabel: "Le projet",
        kind: "textarea",
        question: "Raconte-moi le projet.",
        hint: "Contexte, objectifs, contraintes, références. Tout ce qui m'évite de deviner.",
        placeholder: "Ce que tu as en tête…",
      },
      {
        id: "email",
        recapLabel: "Email",
        kind: "email",
        question: "Où est-ce que je te réponds ?",
        placeholder: "prenom@exemple.com",
      },
    ],
  },
  {
    id: "appel",
    label: "Réserver un créneau",
    title: "Demande de créneau téléphonique",
    steps: [
      {
        id: "nom",
        recapLabel: "Nom",
        kind: "text",
        question: "Commençons par toi. Tu t'appelles comment ?",
        placeholder: "Ton prénom",
      },
      {
        id: "creneau",
        recapLabel: "Disponibilités",
        kind: "choice-group",
        question: "Tu es dispo quand ?",
        hint: "Je te propose un horaire précis dans ma réponse.",
        groups: [
          {
            id: "jours",
            label: "Jours",
            options: [
              { value: "lun-mar", label: "Lundi – Mardi" },
              { value: "mer-jeu", label: "Mercredi – Jeudi" },
              { value: "ven", label: "Vendredi" },
              { value: "peu-importe", label: "Peu importe" },
            ],
          },
          {
            id: "moment",
            label: "Moment de la journée",
            options: [
              { value: "matin", label: "Matin · 9 h – 12 h" },
              { value: "apres-midi", label: "Après-midi · 14 h – 17 h" },
              { value: "fin-journee", label: "Fin de journée · 17 h – 19 h" },
              { value: "peu-importe", label: "Peu importe" },
            ],
          },
        ],
      },
      {
        id: "sujet",
        recapLabel: "Sujet",
        kind: "textarea",
        optional: true,
        question: "De quoi on parle ?",
        hint: "Deux lignes suffisent. Ça me permet d'arriver préparé.",
        placeholder: "Le sujet de l'appel…",
      },
      {
        id: "telephone",
        recapLabel: "Téléphone",
        kind: "tel",
        question: "Sur quel numéro je t'appelle ?",
        placeholder: "06 12 34 56 78",
      },
      {
        id: "email",
        recapLabel: "Email",
        kind: "email",
        question: "Et ton email, pour la confirmation ?",
        placeholder: "prenom@exemple.com",
      },
    ],
  },
]

export function findBranch(branchId: string): ContactBranch | undefined {
  return CONTACT_BRANCHES.find((branch) => branch.id === branchId)
}

/** Every answer key a step owns. A `choice-group` owns one key per group; every
 * other kind owns exactly its own id. */
export function stepAnswerKeys(step: ContactStep): string[] {
  return step.kind === "choice-group" ? step.groups.map((group) => group.id) : [step.id]
}
