import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "../../components/Footer";
import { HeaderColorController } from "../../components/HeaderColorController";
import { ProjectCase } from "../../components/ProjectCase";
import { PROJECTS, findNeighbours, findProject } from "../../data/projects";
import { resolveMedia, resolveMediaList } from "../../lib/projectMedia";

/** Every case study is known at build time, so every page is prerendered and
 * nothing is rendered on demand. A slug with no entry falls through to
 * `notFound()` rather than being generated on the fly — an unwritten project
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

  if (!project) return { title: "Projet introuvable — Behsse" };

  return {
    title: `${project.title} — Behsse`,
    description: project.tagline,
    openGraph: {
      title: `${project.title} — Behsse`,
      description: project.tagline,
      images: [`/projects/${project.slug}/${project.hero.file}`],
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

  return (
    <div data-scroll-root className="relative isolate flex flex-1 flex-col bg-black">
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
