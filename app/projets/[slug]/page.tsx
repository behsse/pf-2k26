import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "../../components/Footer";
import { HeaderColorController } from "../../components/HeaderColorController";
import { ProjectCase } from "../../components/ProjectCase";
import { PROJECTS, findNeighbours, findProject } from "../../data/projects";
import { resolveMedia, resolveMediaList } from "../../lib/projectMedia";
import { SITE_NAME, SITE_URL, absoluteUrl, truncateAtWord } from "../../lib/site";

/** Every case study is known at build time, so every page is prerendered and
 * nothing is rendered on demand. A slug with no entry falls through to
 * `notFound()` rather than being generated on the fly: an unwritten project
 * should 404, not produce an empty page for a crawler to index. */
export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(
  props: PageProps<"/projets/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = findProject(slug);

  if (!project) return { title: "Projet introuvable", robots: { index: false } };

  const url = `/projets/${project.slug}`;
  const image = `/projects/${project.slug}/${project.hero.file}`;
  const kind = project.specs.find((spec) => spec.label === "Type")?.value;

  // The tagline alone is one short line, well under what a result can show, so
  // the opening of the summary follows it to fill the snippet with the words
  // the page actually ranks on. Cut on a space, never mid-word: a snippet that
  // ends on half a word reads as broken rather than as continued.
  const description = truncateAtWord(`${project.tagline} ${project.summary}`, 158);

  return {
    title: kind ? `${project.title}, ${kind.toLowerCase()}` : project.title,
    description,
    // Built from what the project itself declares, so a new case study carries
    // its own terms without anyone maintaining a keyword list. Only the specs
    // worth searching are pulled in: the year and the client say nothing a
    // visitor would ever type, and the stack is split so each technology
    // stands as its own term rather than as one long string.
    keywords: [
      project.title,
      ...project.services,
      ...(kind ? [kind] : []),
      ...(project.specs
        .find((spec) => spec.label === "Stack")
        ?.value.split("·")
        .map((entry) => entry.trim()) ?? []),
    ],
    alternates: { canonical: url },
    openGraph: {
      // Not built through `pageOpenGraph`: a case study is an article, not the
      // site's front door, and the helper pins the type to "website".
      type: "article",
      locale: "fr_FR",
      siteName: SITE_NAME,
      url,
      title: `${project.title} | Behsse`,
      description,
      images: [{ url: image, alt: project.hero.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | Behsse`,
      description,
      images: [image],
    },
  };
}

export default async function ProjectPage(props: PageProps<"/projets/[slug]">) {
  const { slug } = await props.params;
  const project = findProject(slug);

  if (!project) notFound();

  // Dimensions are read off disk here rather than carried by a static import,
  // so the data file never has to name a file twice. See app/lib/projectMedia.ts.
  const [hero, media] = await Promise.all([
    resolveMedia(slug, project.hero),
    resolveMediaList(slug, project.media),
  ]);

  const { previous, next } = findNeighbours(slug);

  // Two nodes, one script. The CreativeWork is what can surface as a rich
  // result for the project itself; the BreadcrumbList is what turns the grey
  // URL line under a result into "Behsse › Projets › <titre>".
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": absoluteUrl(`/projets/${project.slug}#project`),
        name: project.title,
        headline: project.title,
        description: project.summary,
        url: absoluteUrl(`/projets/${project.slug}`),
        image: absoluteUrl(hero.src),
        inLanguage: "fr-FR",
        author: { "@id": `${SITE_URL}/#person` },
        creator: { "@id": `${SITE_URL}/#person` },
        keywords: project.services.join(", "),
        dateCreated: project.specs.find((spec) => spec.label === "Année")?.value,
        ...(project.externalUrl ? { sameAs: project.externalUrl } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Projets", item: absoluteUrl("/projets") },
          { "@type": "ListItem", position: 3, name: project.title },
        ],
      },
    ],
  };

  return (
    <div data-scroll-root className="relative isolate flex flex-1 flex-col bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeaderColorController />
      <ProjectCase
        project={project}
        hero={hero}
        media={media}
        previous={previous}
        next={next}
      />
      <Footer />
    </div>
  );
}
