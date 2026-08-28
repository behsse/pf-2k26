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
    id: "placeholder-03",
    title: "Projet 03",
    status: "2026",
    image: "/service.webp",
    alt: "Visuel temporaire du projet 03",
  },
  {
    id: "placeholder-04",
    title: "Projet 04",
    status: "2026",
    image: "/faq.webp",
    alt: "Visuel temporaire du projet 04",
  },
  {
    id: "placeholder-05",
    title: "Projet 05",
    status: "2026",
    image: "/about.webp",
    alt: "Visuel temporaire du projet 05",
  },
  {
    id: "placeholder-06",
    title: "Projet 06",
    status: "2026",
    image: "/contact.webp",
    alt: "Visuel temporaire du projet 06",
  },
  {
    id: "placeholder-07",
    title: "Projet 07",
    status: "2026",
    image: "/home.webp",
    alt: "Visuel temporaire du projet 07",
  },
]
