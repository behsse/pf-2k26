import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* `experimental.inlineCss` was tried here to kill the last render-blocking
   * request (11 KiB of CSS, 150 ms) and MEASURED WORSE, so it stays off:
   * inlining took the home page's HTML from 16 KiB to 48 KiB compressed,
   * because Next writes the stylesheet twice, once in a <style> tag and once
   * in the RSC payload. That is +32 KiB on every page, every visit, in place
   * of one file the browser caches immutably and reuses across the whole site.
   * Do not re-enable it without re-measuring both numbers. */
  images: {
    /* Next 16 ships an allowlist of exactly one quality, 75, and snaps any
     * other value to the closest entry, so a `quality={90}` on an <Image>
     * silently kept serving 75. The project covers are large photographic
     * renders with wide gradients, which is exactly what 75 blocks up. */
    qualities: [75, 90],
    /* How long an optimised image may be reused before it is regenerated.
     * Files under /public are served with `max-age=0, must-revalidate`, and the
     * optimiser inherits that, so every image was revalidated on every visit.
     * A year is safe here because the URL carries the width and the quality:
     * a replaced file means a different request. */
    minimumCacheTTL: 31_536_000,
  },
};

export default nextConfig;
