import type { MetadataRoute } from "next";

const BASE = "https://apibee.io";

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
  const now = new Date();

  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/docs`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...tools.map((slug) => ({
      url: `${BASE}/tools/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
