import type { StaticImageData } from "next/image"

import contactImage from "@/public/contact.webp"
import homeImage from "@/public/home.webp"
import meProImage from "@/public/me-pro.webp"
import serviceImage from "@/public/service.webp"
import worksImage from "@/public/works.webp"

/** Images are imported rather than referenced by path so their real dimensions
 * travel with them. The story mixes formats — the portrait is 941×1672 where
 * the rest are 287×384 — and every place one is drawn derives its shape from
 * these numbers instead of imposing one and cropping the difference away. */
export type StorySegment =
  | { type: "text"; value: string }
  | { type: "image"; src: StaticImageData; alt: string }

/** The About copy, cut into segments so thumbnails can sit INSIDE the running
 * text rather than beside it. Written around the positioning chosen for the
 * page: designer *and* developer, self-taught, working for startups and
 * established companies across France — the phrases people actually search for
 * ("designer et développeur web freelance", "création de site sur-mesure") are
 * worked into the opening sentences, where they carry the most SEO weight,
 * without turning the text into a keyword list. */
export const ABOUT_STORY: StorySegment[][] = [
  [
    { type: "text", value: "Je m'appelle Sébastien (Behsse)." },
    { type: "image", src: meProImage, alt: "Portrait de Behsse" },
    {
      type: "text",
      value:
        "Designer et développeur web freelance en France, je conçois des sites que l'on n'oublie pas.",
    },
  ],
  [
    {
      type: "text",
      value:
        "J'ai appris seul. Pas d'école de design, pas de cursus tout tracé — de la pratique, des projets ratés,",
    },
    { type: "image", src: worksImage, alt: "Projet en cours de conception" },
    {
      type: "text",
      value:
        "et l'obsession de comprendre pourquoi certaines interfaces marquent et d'autres non. Ce parcours a laissé une trace : je ne fais jamais rien parce que « ça se fait comme ça ».",
    },
  ],
  [
    {
      type: "text",
      value:
        "Les idées tièdes ne m'intéressent pas. Un template rempli à la va-vite, un site qui ressemble à mille autres,",
    },
    { type: "image", src: homeImage, alt: "Page d'accueil sur-mesure" },
    {
      type: "text",
      value:
        "ce n'est pas un gain de temps, c'est une occasion manquée. Je crée des identités et des expériences digitales qui prennent position.",
    },
  ],
  [
    { type: "text", value: "Je dessine" },
    { type: "image", src: serviceImage, alt: "Maquette d'interface" },
    {
      type: "text",
      value:
        "et je code. Pas de traduction approximative entre une maquette et son intégration, pas trois interlocuteurs qui se renvoient la balle : un seul responsable, du premier croquis à la mise en ligne. Ce que vous validez en maquette est ce que vous obtenez en production.",
    },
  ],
  [
    {
      type: "text",
      value:
        "Je travaille avec des startups qui lancent leur marque et des entreprises établies qui veulent enfin un site à la hauteur de ce qu'elles sont devenues.",
    },
    { type: "image", src: contactImage, alt: "Collaboration client" },
  ],
  [
    {
      type: "text",
      value: "Le but n'est pas de faire joli. Le but, c'est d'être impossible à oublier.",
    },
  ],
]
