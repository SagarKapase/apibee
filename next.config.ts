import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build to plain HTML/CSS/JS in `out/` (hosted on Azure Static Web Apps). Every route is prerendered:
  // dynamic routes use generateStaticParams with dynamicParams = false, and nothing needs a server.
  output: "export",
  // Emit /docs/index.html instead of /docs.html so static hosts serve clean URLs without rewrite rules.
  trailingSlash: true,
};

export default nextConfig;
