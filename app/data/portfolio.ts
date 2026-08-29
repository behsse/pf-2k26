export type PlaceholderProject = {
  id: string
  title: string
  status: string
  image: string
  alt: string
  /** Set only once a case study exists for this project in `projects.ts`.
   * Without it the card renders as plain markup rather than a link — no hover
   * affordance, no dead page for a visitor or a crawler to land on. */
  slug?: string
}

export const placeholderProjects: PlaceholderProject[] = [
  {
    id: "behsse-ui",
    title: "Behsse UI",
    status: "2026",
    image: "/projects/behsse-ui/cover.webp",
    alt: "Visuel du site ui.behsse.com rendu sur un MacBook",
    slug: "behsse-ui",
  },
  {
    id: "print-canicule",
    title: "Print Canicule",
    status: "2026",
    image: "/projects/print-canicule/cover.webp",
    alt: "Visuel principal du projet Print Canicule",
    slug: "print-canicule",
  },
  {
    id: "redbull",
    title: "Red Bull",
    status: "2026",
    image: "/projects/redbull/cover.webp",
    alt: "La canette Red Bull Original en 3D sur fond bleu",
    slug: "redbull",
  },
  {
    id: "schemify",
    title: "Schemify",
    status: "2025",
    image: "/projects/schemify/cover.webp",
    alt: "Le site schemify.behsse.com affiché dans un navigateur",
    slug: "schemify",
  },
  {
    id: "print-japan-breakfeast",
    title: "Print Japan Breakfeast",
    status: "2023",
    image: "/projects/print-japan-breakfeast/cover.webp",
    alt: "L'affiche Japan Breakfeast encadrée au mur d'un salon",
    slug: "print-japan-breakfeast",
  },
]
