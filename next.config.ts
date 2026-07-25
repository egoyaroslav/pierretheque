import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    // Turbopack's dev filesystem cache is enabled by default since Next 16.1,
    // but its on-disk cache maintenance is extremely slow on this machine's
    // G: drive (multi-minute "filesystem cache database compaction" pauses
    // that starve unrelated disk I/O). Disabled for usable local dev.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
