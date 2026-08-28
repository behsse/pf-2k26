import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* Next 16 ships an allowlist of exactly one quality, 75, and snaps any
     * other value to the closest entry — so a `quality={90}` on an <Image>
     * silently kept serving 75. The project covers are large photographic
     * renders with wide gradients, which is exactly what 75 blocks up. */
    qualities: [75, 90],
  },
};

export default nextConfig;
