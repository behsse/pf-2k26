/** Case-study content for the project pages at `/projets/[slug]`.
 *
 * Separate from `portfolio.ts`, which owns the cards in the galleries. A card
 * exists for every project on show; an entry HERE exists only for the ones that
 * have a page written. That split is what lets the grid stay full while only
 * the finished case studies are reachable — a card whose project has no entry
 * simply is not a link.
 *
 * Images are named, not imported. Files live in `public/projects/<slug>/`, one
 * flat folder per project named after the slug, so a page's URL tells you where
 * its assets are: `cover` opens the case study, everything else is numbered in
 * the order it appears. `resolveMedia` in `app/lib/projectMedia.ts` reads each
 * file's real dimensions off disk at build time.
 *
 * Static imports used to do that job, and they were dropped on purpose: they
 * cost one named import per image at the top of this module, which does not
 * scale past a handful. Naming the file keeps the folder as the single source
 * of truth and keeps this file readable at twenty screenshots a project.
 *
 * The folders are deliberately NOT split by role. Which image is the cover and
 * which follow is decided here, in `hero` and `media` — encoding it in the
 * filesystem too means two places to keep in step, and the cover is already
 * both: it heads the banner AND opens the column. */

/** A file inside the project's own folder. Just the name — the folder comes
 * from the slug. */
export type ProjectMedia = {
  file: string
  alt: string
}

/** One row of the technical sheet. Free-form rather than fixed fields, because
 * what is worth stating differs per project — a client name means nothing on a
 * personal library, and a stack means nothing on a print job. */
export type ProjectSpec = {
  label: string
  value: string
}

export type Project = {
  /** URL segment, and the name of the asset folder. Never change one that has
   * been published — it is the page's address, and every link and search result
   * pointing at it breaks. */
  slug: string
  title: string
  /** One line under the title: what the project is, in a breath. */
  tagline: string
  /** Three to five lines. The only real prose on the page, so it carries both
   * the explanation and most of the page's SEO weight. */
  summary: string
  /** What was actually done, as short labels. */
  services: string[]
  specs: ProjectSpec[]
  /** The live site, the shop, the repository. What turns the page from a demo
   * into proof. Omitted when there is nothing to point at. */
  externalUrl?: string
  externalLabel?: string
  /** The opening image: cropped into the banner band, then shown whole at the
   * head of the column. The only image a project is required to have. */
  hero: ProjectMedia
  /** Short labels for the strip under the hero — year, kind of work, whatever
   * is worth stating in three words. Written out rather than derived from
   * `specs`, so the strip never depends on a label being spelled a certain way. */
  bannerMeta: string[]
  /** Everything after the hero, stacked in the right column, in order. */
  media: ProjectMedia[]
}

export const PROJECTS: Project[] = [
  {
    slug: "behsse-ui",
    title: "Behsse UI",
    tagline: "Ma bibliothèque de composants, d'icônes et de blocs prêts à poser.",
    summary:
      "Behsse UI est l'outil que j'utilise sur mes propres projets. Plutôt que de réécrire les mêmes boutons, champs et transitions d'un site à l'autre, j'ai rassemblé le tout dans une bibliothèque unique : des composants accessibles, une collection d'icônes cohérente, et des blocs de mise en page assemblables. Chaque pièce est pensée pour être copiée dans un projet et modifiée, pas installée en dépendance figée.",
    services: ["Design system", "Développement front-end", "Documentation"],
    specs: [
      { label: "Année", value: "2026" },
      { label: "Rôle", value: "Design et développement" },
      { label: "Stack", value: "Next.js · React · TypeScript · Tailwind CSS" },
      { label: "Client", value: "Projet personnel" },
      { label: "Type", value: "Bibliothèque de composants" },
    ],
    externalUrl: "https://ui.behsse.com",
    externalLabel: "Voir la bibliothèque",
    hero: { file: "cover.webp", alt: "Le site ui.behsse.com affiché sur un MacBook" },
    bannerMeta: ["2026", "Bibliothèque de composants"],
    media: [
      { file: "01-fullpage.webp", alt: "La page d'accueil complète de Behsse UI" },
      { file: "02-mobile.webp", alt: "Behsse UI affiché sur mobile" },
      { file: "03-components.webp", alt: "La page listant les composants de Behsse UI" },
      { file: "04-icon.webp", alt: "La collection d'icônes de Behsse UI" },
    ],
  },
  {
    // DRAFT — écrit à partir du site en ligne et de la cover. Le rôle, la stack
    // détaillée et la durée sont des suppositions : à corriger en premier.
    slug: "redbull",
    title: "Red Bull",
    tagline: "Une landing page concept pour trois éditions d'une canette.",
    summary:
      "Un concept fan-made monté comme démonstration technique : une page produit qui présente trois éditions d'une même canette (Original, Sea Blue, White) et les fait défiler l'une après l'autre. Chaque canette est un modèle 3D texturé, monté dans la page pour pouvoir être tourné et éclairé au lieu d'être photographié. Le travail porte ensuite sur le rythme du scroll, les transitions entre éditions et la mise en scène du produit, avec la contrainte d'une page unique qui doit tenir sans jamais casser la lecture. Le site n'est ni affilié ni sponsorisé par Red Bull GmbH : les marques et les emballages restent la propriété de leurs détenteurs.",
    services: [
      "Direction artistique",
      "Modélisation 3D",
      "Développement front-end",
      "Animation",
    ],
    specs: [
      { label: "Année", value: "2026" },
      { label: "Rôle", value: "Design et développement" },
      { label: "Stack", value: "Next.js · React · TypeScript · GSAP" },
      { label: "Client", value: "Concept personnel" },
      { label: "Type", value: "Landing page produit" },
    ],
    externalUrl: "https://redbull-inky.vercel.app/",
    externalLabel: "Voir le site",
    hero: {
      file: "cover.webp",
      alt: "La canette Red Bull Original en 3D, inclinée sur un fond bleu parsemé de grains de café et de feuilles",
    },
    bannerMeta: ["2026", "Landing page produit"],
    media: [
      {
        file: "01-redbull-page.webp",
        alt: "La page d'accueil du site : le titre « Gives You Wings », la canette au centre et le sélecteur des trois éditions",
      },
      {
        file: "02-redbull.webp",
        alt: "Le modèle 3D de la canette Red Bull Original dans la vue de travail",
      },
      {
        file: "03-redbull-blue.webp",
        alt: "Le modèle 3D de la canette Red Bull Sea Blue Edition, goût juneberry",
      },
      {
        file: "04-redbull-white.webp",
        alt: "Le modèle 3D de la canette Red Bull White Edition, goût coco et myrtille",
      },
    ],
  },
  {
    slug: "schemify",
    title: "Schemify",
    tagline: "Un schéma Prisma collé, deux diagrammes de base de données en retour.",
    summary:
      "Schemify lit un schéma Prisma et en tire les deux vues attendues d'une base de données : le MLD, avec les types, les clés primaires, les clés étrangères et les contraintes d'unicité, et le MCD, ramené aux entités et aux relations. Coller le schéma, générer, exporter le diagramme : il n'y a rien d'autre à apprendre. L'analyse tourne entièrement dans le navigateur : le schéma n'est envoyé nulle part, ne transite par aucun serveur et n'est jamais stocké, ce qui rend l'outil utilisable sur un projet client sans avoir à se poser la question. Le reste du travail a porté sur le placement automatique des tables et le tracé des liens, pour qu'un schéma d'une dizaine de modèles reste lisible sans être réarrangé à la main.",
    services: [
      "Conception produit",
      "Développement front-end",
      "Génération de diagrammes",
    ],
    specs: [
      { label: "Année", value: "2025" },
      { label: "Rôle", value: "Design et développement" },
      { label: "Stack", value: "Next.js · React · TypeScript · Tailwind CSS" },
      { label: "Client", value: "Projet personnel" },
      { label: "Type", value: "Outil web" },
    ],
    externalUrl: "https://schemify.behsse.com",
    externalLabel: "Voir l'outil",
    hero: {
      file: "cover.webp",
      alt: "Le site schemify.behsse.com dans un navigateur : le schéma Prisma collé à gauche, la zone de génération à droite",
    },
    bannerMeta: ["2025", "Outil web"],
    media: [
      {
        file: "01-mld.webp",
        alt: "L'onglet MLD : les tables Post, Category, Profile et User avec leurs types, clés primaires, clés étrangères et cardinalités",
      },
      {
        file: "02-mcd.webp",
        alt: "L'onglet MCD : les mêmes entités réduites à leurs attributs et reliées par leurs cardinalités",
      },
    ],
  },
  {
    // DRAFT — everything below the slug is written from the two images and the
    // project's name alone. I know nothing about this work: the description,
    // the year, the role, the format and the alt texts are all guesses, and the
    // first thing to correct.
    slug: "print-canicule",
    title: "Print Canicule",
    tagline: "Une série imprimée sur la chaleur qui s'installe.",
    summary:
      "Un travail d'édition sur la canicule : la même donnée, la température, traitée comme une matière graphique plutôt que comme un graphique. Le format imprimé impose ses contraintes (pas d'animation, pas de survol, pas de défilement) et c'est ce qui rend l'exercice intéressant : tout doit tenir dans la composition, la typographie et le rapport à la page.",
    services: ["Direction artistique", "Design graphique", "Mise en page"],
    specs: [
      { label: "Année", value: "2026" },
      { label: "Rôle", value: "Direction artistique et design" },
      { label: "Client", value: "Projet personnel" },
      { label: "Type", value: "Édition imprimée" },
      { label: "Format", value: "Affiche" },
    ],
    externalUrl: "https://www.instagram.com/p/Dci5Ln3jMoV/?img_index=1",
    hero: { file: "cover.webp", alt: "Visuel principal du projet Print Canicule" },
    bannerMeta: ["2026", "Édition imprimée"],
    media: [
      { file: "01-print.webp", alt: "Une planche de la série Print Canicule" },
      { file: "02-canicule-chat.webp", alt: "Gros plan sur le chat du Print Canicule" },
      { file: "03-canicule-nourriture.webp", alt: "Gros plan sur la nourriture du Print Canicule" },
      { file: "04-canicule-piscine.webp", alt: "Gros plan sur la piscine du Print Canicule" },
      { file: "05-canicule-drapeau.webp", alt: "Gros plan sur le rideau du Print Canicule" },
      { file: "06-canicule-lanterne.webp", alt: "Gros plan sur les lanternes japonaise du Print Canicule" },
      { file: "07-canicule-plante.webp", alt: "Gros plan sur les plantes du Print Canicule" }
    ],
  },
  {
    // DRAFT — écrit à partir des visuels seuls. L'année, le rôle, le format
    // d'impression et le contexte sont des suppositions : à corriger en premier.
    slug: "print-japan-breakfeast",
    title: "Print Japan Breakfeast",
    tagline: "Une affiche illustrée autour d'une table japonaise.",
    summary:
      "Une affiche qui met un repas japonais entier dans un seul cadre : sushi, brochettes de bœuf et de shiitake, un bol de nouilles à l'œuf mollet, une soupe à la crevette, des onigiri sur leur planche et une paire de baguettes posée en travers. Le titre, おいしい食事を, court verticalement dans une bande à gauche, comme sur une enseigne de devanture. Le trait est épais et fermé, la palette tenue à quelques rouges brique et roses poudrés, et les aplats sont travaillés en trames de points et en grain de papier, un rendu sérigraphie qui donne à l'illustration sa matière une fois imprimée. Tout se joue dans la composition : les plats s'empilent en diagonale du haut vers le bas sans jamais se chevaucher au point de devenir illisibles.",
    services: ["Direction artistique", "Illustration", "Design graphique"],
    specs: [
      { label: "Année", value: "2023" },
      { label: "Rôle", value: "Direction artistique et illustration" },
      { label: "Client", value: "Projet personnel" },
      { label: "Type", value: "Édition imprimée" },
      { label: "Format", value: "Affiche" },
    ],
    hero: {
      file: "cover.webp",
      alt: "L'affiche encadrée au mur d'un salon, au-dessus d'un canapé en cuir",
    },
    bannerMeta: ["2023", "Édition imprimée"],
    media: [
      {
        file: "1-jb.webp",
        alt: "Détail du sushi saumon et de la crevette, posés sur leur planche",
      },
      {
        file: "2-jb.webp",
        alt: "Détail de l'onigiri à la prune et de sa feuille d'érable, en haut à droite de l'affiche",
      },
      {
        file: "3-jb.webp",
        alt: "Détail de l'assiette de brochettes de bœuf et de shiitake, avec son quartier de citron vert",
      },
      {
        file: "4-jb.webp",
        alt: "Détail du bol de nouilles : œuf mollet, viande et pousses vertes dans un bouillon sombre",
      },
      {
        file: "5-jb.webp",
        alt: "Détail du bol de soupe claire à la crevette",
      },
      {
        file: "6-jb.webp",
        alt: "Détail des onigiri à l'algue nori alignés sur leur planche jaune",
      },
      {
        file: "7-jb.webp",
        alt: "Détail du coin inférieur droit : la paire de baguettes rouges sur le fond rose",
      },
      {
        file: "8-jb.webp",
        alt: "L'affiche encadrée posée au sol contre un mur blanc",
      },
    ],
  },
]

export function findProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug)
}

/** The two projects either side of this one, for the pager at the foot of the
 * left column. Deliberately does NOT wrap around: a first project with a
 * "previous" that loops to the last one reads as a bug, not as a feature. */
export function findNeighbours(slug: string): {
  previous: Project | null
  next: Project | null
} {
  const index = PROJECTS.findIndex((project) => project.slug === slug)
  if (index === -1) return { previous: null, next: null }

  return {
    previous: PROJECTS[index - 1] ?? null,
    next: PROJECTS[index + 1] ?? null,
  }
}
