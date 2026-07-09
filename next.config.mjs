import { imageHosts } from './image-hosts.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Source maps OFF in production — with them on, every visitor could
  // download your entire readable source code, and Vercel served the extra
  // .map files on every page load (wasted bandwidth).
  productionBrowserSourceMaps: false,
  distDir: process.env.DIST_DIR || '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
  },
  // ✅ Removed the @dhiwise/component-tagger webpack loader (Rocket.new
  // builder artifact) — it ran on every build and tagged every component
  // for a builder tool that's no longer used. Faster builds, cleaner output.
};

export default nextConfig;
