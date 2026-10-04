import type { NextConfig } from "next";

// A separate dist dir for production builds keeps `next build` from
// clobbering a running `next dev` server, which share .next by default.
const distDir = process.env.BUILD_DIR ?? ".next";

const nextConfig: NextConfig = {
  distDir,
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "@react-three/drei"],
  },
};

export default nextConfig;
