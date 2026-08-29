import { readdir } from "node:fs/promises"
import path from "node:path"
import type { MetadataRoute } from "next"
import { PROJECTS } from "./data/projects"
import { absoluteUrl } from "./lib/site"

/** Pages that exist but have no business being crawled. They already carry
 * `robots: { index: false }`; listing them here keeps them out of the sitemap
 * too, because submitting a URL you then ask not to index is a contradiction
 * Search Console reports as an error.
 *
 * This is the ONLY list to touch when a page should stay out. Everything else
 * is discovered. */
const EXCLUDED_ROUTES = new Set([
  "/mentions-legales",
  "/confidentialite",
  "/conditions-utilisation",
])

const PAGE_FILES = new Set(["page.tsx", "page.ts", "page.jsx", "page.js", "page.mdx"])

/** Walks the app directory and returns the URL path of every static page.
 *
 * Derived from the filesystem rather than from a hand-kept array: a new page is
 * a new folder, and a list that has to be updated by hand is a list that gets
 * forgotten. The routing rules are Next's own, so they are honoured here too:
 *
 *  - `(group)` folders shape the code, not the URL, so the segment is skipped
 *    while its children are still walked.
 *  - `[slug]` folders have no single URL to emit. Their pages are added from
 *    their own data instead, which is what the projects block below does.
 *  - `_private`, `@parallel` and `api` hold no crawlable page.
 */
async function findStaticRoutes(directory: string, base = ""): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const routes: string[] = []

  if (entries.some((entry) => entry.isFile() && PAGE_FILES.has(entry.name))) {
    routes.push(base || "/")
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const { name } = entry
    if (name.startsWith("_") || name.startsWith("@") || name.startsWith("[")) continue
    if (name === "api" || name === "components" || name === "data" || name === "lib") continue

    const nested = path.join(directory, name)
    const isGroup = name.startsWith("(")
    routes.push(...(await findStaticRoutes(nested, isGroup ? base : `${base}/${name}`)))
  }

  return routes
}

/** `lastModified` is deliberately absent.
 *
 * The tempting `new Date()` declares every URL modified on every deploy, even
 * the ones untouched for months. Google's guidance is explicit that it ignores
 * the field entirely once it proves unreliable, so an honest omission is worth
 * more than a value that is wrong by construction. `changeFrequency` is
 * ignored outright and is left out for the same reason. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appDirectory = path.join(process.cwd(), "app")
  const discovered = await findStaticRoutes(appDirectory)

  const staticRoutes = discovered
    .filter((route) => !EXCLUDED_ROUTES.has(route))
    .sort((a, b) => a.localeCompare(b))
    .map((route) => ({
      url: absoluteUrl(route),
      // Ignored by Google, still read by Bing and by a few crawlers. The home
      // page and the portfolio are what the site is for; the rest supports them.
      priority: route === "/" ? 1 : route === "/projets" ? 0.9 : 0.8,
    }))

  const projectRoutes = PROJECTS.map((project) => ({
    url: absoluteUrl(`/projets/${project.slug}`),
    priority: 0.7,
  }))

  return [...staticRoutes, ...projectRoutes]
}
