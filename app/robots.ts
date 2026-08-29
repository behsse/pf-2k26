import type { MetadataRoute } from "next"
import { absoluteUrl } from "./lib/site"

/** Served at /robots.txt, rebuilt on every deploy like any other route.
 *
 * Nothing here needs maintaining as the site grows: the only path blocked is
 * the API, which holds no pages, and the sitemap link points at a file that
 * discovers its own contents. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Not a secret, just noise: the contact endpoint answers POST only and
        // has nothing for a crawler to index. Blocking it also keeps a crawl
        // from firing requests at a route that sends email.
        disallow: ["/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  }
}
