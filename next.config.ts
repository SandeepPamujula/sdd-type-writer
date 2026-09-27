import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  // Lets e2e tests export an alternate basePath build into its own
  // directory instead of overwriting the shared out/ another test serves.
  distDir: process.env.NEXT_EXPORT_DIR ?? ".next",
};

export default nextConfig;
