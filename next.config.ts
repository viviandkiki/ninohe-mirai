import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "www.nbsk.or.jp" },
      { protocol: "https", hostname: "www.ninohe-kanko.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "d3-force"],
  },
};

export default nextConfig;
