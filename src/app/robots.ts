import type { MetadataRoute } from "next";

// Generated once at build time: the site is a static export (next.config.ts output: "export").
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://testingapis.com/sitemap.xml",
  };
}
