import { readFile } from "node:fs/promises"
import path from "node:path"
import { imageSize } from "image-size"
import type { ProjectMedia } from "../data/projects"

/** A media entry with its real dimensions attached, ready for `next/image`. */
export type ResolvedMedia = {
  /** Public URL, derived from the project's slug and the file name. */
  src: string
  width: number
  height: number
  alt: string
}

/** In-flight and settled measurements, keyed by public path.
 *
 * The promise is cached rather than the result, so two callers asking for the
 * same file at the same moment share one read instead of racing each other. */
const measured = new Map<string, Promise<{ width: number; height: number }>>()

/** Reads the file into memory and measures the buffer, rather than using
 * image-size's own `fromFile` helper.
 *
 * `fromFile` keeps a pool of file handles and reads a chunk from each. Under
 * concurrent reads on Windows that pool hands back nothing and the library
 * reports `Empty file` on a file that is demonstrably not empty — which is what
 * took the project pages down. Reading the whole file is a few hundred
 * kilobytes, once per image per build, and it never lies. */
async function measure(filePath: string, src: string) {
  let buffer: Buffer
  try {
    buffer = await readFile(filePath)
  } catch (cause) {
    // Deliberately fatal. The alternative is a page that builds green and ships
    // a hole where an image should be.
    throw new Error(`[projects] Image introuvable : public${src}`, { cause })
  }

  if (buffer.length === 0) {
    throw new Error(`[projects] Fichier vide : public${src}`)
  }

  let width: number | undefined
  let height: number | undefined
  try {
    ;({ width, height } = imageSize(buffer))
  } catch (cause) {
    throw new Error(`[projects] Format d'image illisible : public${src}`, { cause })
  }

  if (!width || !height) {
    throw new Error(`[projects] Dimensions illisibles : public${src}`)
  }

  return { width, height }
}

/** Turns `{ file, alt }` into something `next/image` can draw.
 *
 * This is why the data file no longer imports a single image. Static imports
 * carried each file's dimensions for free, but they cost one named import per
 * image at the top of the module — unworkable at twenty screenshots a project.
 * Measuring the file gives the same two numbers without naming anything, and
 * keeps the guarantee that matters: a file that is missing or misspelled stops
 * the build rather than turning into a broken image in production.
 *
 * Server-side only. It touches the filesystem, so it must never be pulled into
 * a client component. */
export async function resolveMedia(slug: string, media: ProjectMedia): Promise<ResolvedMedia> {
  const src = `/projects/${slug}/${media.file}`

  let pending = measured.get(src)
  if (!pending) {
    pending = measure(path.join(process.cwd(), "public", "projects", slug, media.file), src)
    measured.set(src, pending)
    // A failed read must not be remembered as the answer: in dev the file is
    // often just not written yet, and caching the rejection would keep the page
    // broken until the server restarts.
    pending.catch(() => measured.delete(src))
  }

  const { width, height } = await pending
  return { src, alt: media.alt, width, height }
}

export function resolveMediaList(slug: string, list: ProjectMedia[]): Promise<ResolvedMedia[]> {
  return Promise.all(list.map((media) => resolveMedia(slug, media)))
}
