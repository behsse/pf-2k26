/** One source of truth for everything a crawler reads about the site as a
 * whole: the canonical origin, the identity behind it, and the structured data
 * built from both.
 *
 * The origin lives here rather than in an env var on purpose. It is baked into
 * canonical URLs and Open Graph tags, so a missing variable at build time would
 * not fail loudly, it would silently ship canonicals pointing at localhost. */
import { EMAIL, SOCIAL_LINKS } from "../data/contact"

export const SITE_URL = "https://studio.behsse.com"

export const SITE_NAME = "Behsse"

/** The person behind the studio. Search results attach reviews, images and the
 * knowledge panel to an entity, not to a page, so the same identity is
 * declared once and reused by every schema below. */
export const PERSON_NAME = "Sébastien Zielinski"

export const CONTACT_EMAIL = EMAIL

/** Read from the contact data rather than restated, so a changed profile never
 * has to be remembered in two places. `sameAs` is how a search engine ties this
 * site to those accounts, and a dead URL there weakens the link. */
export const SOCIAL_PROFILES = SOCIAL_LINKS.map((link) => link.href)

/** Absolute URL for a path, since Open Graph and JSON-LD both refuse relative
 * ones. */
export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString()
}

/** Shortens text to `limit` characters without splitting a word, and without
 * leaving a dangling comma or space before the ellipsis.
 *
 * Written for meta descriptions, where a search engine cuts the text itself
 * anyway: the point is to control WHERE the cut lands so the snippet reads as a
 * finished thought rather than a truncated one. */
export function truncateAtWord(text: string, limit: number) {
  const clean = text.replace(/\s+/g, " ").trim()
  if (clean.length <= limit) return clean

  const cut = clean.slice(0, limit)
  const lastSpace = cut.lastIndexOf(" ")
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : limit).replace(/[\s,;:.]+$/, "")}…`
}

/** One page's Open Graph block, with the fields that never change filled in.
 *
 * Next merges metadata key by key, not field by field: a page that declares its
 * own `openGraph` REPLACES the layout's whole block, silently dropping
 * `type`, `locale` and `siteName` from the shared card. Building every page's
 * block through here is what keeps those three on the page. */
export function pageOpenGraph(options: {
  url: string
  title: string
  description: string
}) {
  return {
    type: "website" as const,
    locale: "fr_FR",
    siteName: SITE_NAME,
    ...options,
  }
}

/** Schema.org graph describing who runs the site and what is sold.
 *
 * `Person` and `ProfessionalService` are declared as two linked nodes rather
 * than one merged node: a freelance is both, and collapsing them makes the
 * business look like a person offering nothing, or a company with no author
 * behind its work. `@id` is what lets a page reference either one later
 * (a case study's `author`, a breadcrumb's site) without repeating it. */
export const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: PERSON_NAME,
      alternateName: "Behsse",
      url: SITE_URL,
      email: `mailto:${CONTACT_EMAIL}`,
      jobTitle: "Designer et développeur web freelance",
      knowsAbout: [
        "Design d'interface",
        "Identité visuelle",
        "Développement web",
        "Next.js",
        "React",
        "Accessibilité web",
      ],
      sameAs: SOCIAL_PROFILES,
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#business`,
      name: SITE_NAME,
      url: SITE_URL,
      email: `mailto:${CONTACT_EMAIL}`,
      description:
        "Studio freelance de design et de développement web : identité de marque, design d'interface et sites sur-mesure développés avec Next.js.",
      founder: { "@id": `${SITE_URL}/#person` },
      areaServed: { "@type": "Country", name: "France" },
      availableLanguage: ["fr", "en"],
      priceRange: "€€",
      sameAs: SOCIAL_PROFILES,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Prestations",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Identité visuelle et branding",
              description:
                "Logo, palette, typographies et règles d'usage : une marque reconnaissable partout où elle apparaît.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Design d'interface",
              description:
                "Maquettes, design system et parcours utilisateur, pensés pour la conversion autant que pour l'esthétique.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Développement web sur-mesure",
              description:
                "Sites et applications développés avec Next.js et React, optimisés pour la performance et le référencement.",
            },
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "fr-FR",
      publisher: { "@id": `${SITE_URL}/#person` },
    },
  ],
}
