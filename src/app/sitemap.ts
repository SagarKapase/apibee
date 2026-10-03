import type { MetadataRoute } from "next";
import { endpointHref, endpoints, groups } from "@/lib/api-data";
import { lessons } from "@/lib/learn";
import { absoluteUrl } from "@/lib/seo";

// Generated once at build time: the site is a static export (next.config.ts output: "export").
export const dynamic = "force-static";

const tools = [
  "json-formatter",
  "json-xml",
  "jwt-decoder",
  "base64",
  "url-encoder",
  "uuid-generator",
  "hash-generator",
  "timestamp",
  "http-status",
  "regex-tester",
  "curl-parser",
  "mock-data",
  "password-generator",
  "qr-code",
  "text-diff",
  "json-yaml-csv",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/docs"), changeFrequency: "weekly", priority: 0.9 },
    ...["graphql", "models", ...groups.map((g) => g.id)].map((slug) => ({
      url: absoluteUrl(`/docs/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/learn"), changeFrequency: "weekly", priority: 0.8 },
    ...lessons.map((l) => ({
      url: absoluteUrl(`/learn/${l.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...endpoints.map((e) => ({
      url: absoluteUrl(endpointHref(e.group.id, e.endpoint.slug)),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    { url: absoluteUrl("/tools"), changeFrequency: "weekly", priority: 0.8 },
    ...tools.map((slug) => ({
      url: absoluteUrl(`/tools/${slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/support"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.3 },
  ];
}
