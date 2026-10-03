import type { Metadata } from "next";

export const SITE_URL = "https://testingapis.com";
export const SITE_NAME = "testingapis.com";

// Pages are served with a trailing slash (next.config.ts trailingSlash: true), so canonical URLs use it too.
export const pagePath = (path: string) => (path.endsWith("/") ? path : `${path}/`);
export const absoluteUrl = (path: string) => `${SITE_URL}${pagePath(path)}`;

// Next.js serves src/app/opengraph-image.png at /opengraph-image.png.
const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "testingapis.com: a free fake REST API for testing HTTP clients",
};

// Metadata for one page. A page's openGraph replaces the root layout's instead of merging with it,
// so each page sets its own; without this every page shares the homepage's og:title and og:url.
// It also drops the inherited opengraph-image, so the shared image is listed again here.
// The canonical URL tells search engines to index https://testingapis.com rather than www or http.
export function pageMetadata({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: pagePath(path) },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: pagePath(path),
      siteName: SITE_NAME,
      type: "website",
      images: [OG_IMAGE],
    },
  };
}

// schema.org data for a browser-based tool page.
export function toolJsonLd({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description,
    url: absoluteUrl(path),
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}
