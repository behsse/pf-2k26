/** The service catalogue, shared by the home page's marquee list and the
 * showcase on /service so the two can never disagree on what is being sold.
 *
 * Only `title` and each item's `label` reach the home page. The rest — the
 * blurb, the visual, and each item's `panels` — belongs to the showcase's
 * accordion.
 *
 * The images are PLACEHOLDERS reused from the portfolio — swap them for real
 * case-study covers, and point `caseStudyHref` at the case study once one
 * exists.
 *
 * The development panels list the stack actually used on this project. The
 * design-side tools are an assumption and are the first thing to correct if
 * they are wrong. */

export type ServiceItem = {
  label: string
  panels: Array<{ title: string; entries: string[] }>
}

export type ServiceGroup = {
  id: string
  title: string
  blurb: string
  image: string
  alt: string
  caseStudyHref: string
  items: ServiceItem[]
}

export const SERVICE_OFFER: ServiceGroup[] = [
  {
    id: "branding",
    title: "Branding",
    blurb:
      "La partie que tout le monde voit. Identité, interfaces et mise en page, travaillées jusqu'à ce que la marque soit reconnaissable partout où elle apparaît.",
    image: "/works.webp",
    alt: "Visuel temporaire d'un projet de branding",
    caseStudyHref: "/projets",
    items: [
      {
        label: "Logo",
        panels: [
          { title: "Outils", entries: ["Figma", "Adobe Illustrator", "Adobe Photoshop"] },
          {
            title: "Livrables",
            entries: ["Fichiers vectoriels", "Déclinaisons et tailles", "Règles d'usage"],
          },
        ],
      },
      {
        label: "Identité visuelle",
        panels: [
          { title: "Outils", entries: ["Figma", "Adobe Illustrator"] },
          {
            title: "Livrables",
            entries: ["Palette de couleurs", "Typographies", "Charte d'application"],
          },
        ],
      },
      {
        label: "Design UI/UX",
        panels: [
          { title: "Outils", entries: ["Figma", "Prototypes interactifs"] },
          {
            title: "Méthode",
            entries: ["Wireframes", "Parcours utilisateur", "Design system"],
          },
        ],
      },
      {
        label: "Identité de marque",
        panels: [
          { title: "Méthode", entries: ["Atelier de cadrage", "Benchmark", "Positionnement"] },
          {
            title: "Livrables",
            entries: ["Plateforme de marque", "Ton de voix", "Territoire visuel"],
          },
        ],
      },
      {
        label: "Web design",
        panels: [
          { title: "Outils", entries: ["Figma", "Tailwind CSS"] },
          {
            title: "Livrables",
            entries: ["Maquettes responsive", "Bibliothèque de composants", "Spécifications"],
          },
        ],
      },
      {
        label: "Illustration",
        panels: [
          { title: "Outils", entries: ["Adobe Illustrator", "Adobe Photoshop", "Figma"] },
          { title: "Usages", entries: ["Pictogrammes", "Illustrations éditoriales", "Motifs"] },
        ],
      },
    ],
  },
  {
    id: "developpement",
    title: "Développement",
    blurb:
      "La partie qui doit fonctionner. Sites, applications et plateformes, écrits à la main pour charger vite, tenir la charge et survivre à leur lancement.",
    image: "/home.webp",
    alt: "Visuel temporaire d'un projet de développement",
    caseStudyHref: "/projets",
    items: [
      {
        label: "Développement web",
        panels: [
          {
            title: "Stack",
            entries: ["Next.js (App Router)", "React", "TypeScript", "Tailwind CSS"],
          },
          {
            title: "Inclus",
            entries: ["Rendu serveur", "Accessibilité", "Déploiement Vercel"],
          },
        ],
      },
      {
        label: "Développement frontend",
        panels: [
          { title: "Stack", entries: ["React", "Tailwind CSS", "Shadcn/ui", "GSAP"] },
          {
            title: "Inclus",
            entries: ["Intégration responsive", "Animations", "Compatibilité navigateurs"],
          },
        ],
      },
      {
        label: "Développement backend",
        panels: [
          {
            title: "Stack",
            entries: ["API Routes Next.js", "Express", "TypeScript", "Better Auth"],
          },
          {
            title: "Inclus",
            entries: ["Validation des entrées", "Rate limiting", "Sessions côté serveur"],
          },
        ],
      },
      {
        label: "Application mobile",
        panels: [
          { title: "Stack", entries: ["React Native", "Expo", "TypeScript"] },
          {
            title: "Inclus",
            entries: ["iOS et Android", "Notifications push", "Publication sur les stores"],
          },
        ],
      },
      {
        label: "Gestion de base de données",
        panels: [
          { title: "Stack", entries: ["PostgreSQL", "Prisma", "Neon / Supabase"] },
          {
            title: "Inclus",
            entries: ["Migrations versionnées", "Row Level Security", "Sauvegardes"],
          },
        ],
      },
      {
        label: "Créatif développement",
        panels: [
          { title: "Stack", entries: ["GSAP", "ScrollTrigger", "Lenis", "Three.js / WebGL"] },
          {
            title: "Inclus",
            entries: ["Transitions de page", "Animations au scroll", "Effets sur-mesure"],
          },
        ],
      },
      {
        label: "Shopify & Wordpress",
        panels: [
          { title: "Plateformes", entries: ["Shopify", "WordPress"] },
          {
            title: "Inclus",
            entries: ["Thème sur-mesure", "Intégrations tierces", "Reprise de l'existant"],
          },
        ],
      },
      {
        label: "Optimisation SEO",
        panels: [
          { title: "Outils", entries: ["Lighthouse", "Core Web Vitals", "Umami"] },
          {
            title: "Inclus",
            entries: ["SEO technique", "Données structurées", "Temps de chargement"],
          },
        ],
      },
    ],
  },
]
