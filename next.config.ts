import type { NextConfig } from "next";

// Static export: the site is plain HTML/CSS/JS in `out/` and runs on any static host.
// Set NEXT_PUBLIC_BASE_PATH (e.g. "/my-portfolio") when serving from a sub-path such as
// a GitHub Pages project site. Leave it unset for Vercel or a root domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
