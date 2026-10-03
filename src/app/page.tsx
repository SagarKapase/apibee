import type { Metadata } from "next";
import Link from "next/link";
import {
  APIPlayground,
  type PlaygroundGroup,
} from "@/components/api-playground";
import { CodeTabs } from "@/components/code-tabs";
import { CopyButton } from "@/components/copy-button";
import { LiveConsole } from "@/components/live-console";
import { Icon } from "@/components/icon";
import { JsonLd } from "@/components/json-ld";
import { BASE_URL, withHost } from "@/lib/api-config";
import {
  categories,
  codeExamples,
  endpointCount,
  endpointHref,
  findGroup,
  groups,
  sampleResponse,
} from "@/lib/api-data";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

// Title, description and Open Graph tags come from the root layout.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Lets Google show "testingapis.com" as the site name in search results.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "Testing APIs",
  url: `${SITE_URL}/`,
};

// Groups shown in the homepage explorer. Only these are sent to the browser.
const PLAYGROUND_GROUPS = ["products", "books", "countries", "echo", "status", "utils"];
const MAX_RESPONSE_LINES = 40;

const playground: PlaygroundGroup[] = PLAYGROUND_GROUPS.flatMap((id) => {
  const found = findGroup(id);
  if (!found) return [];
  return [
    {
      id,
      title: found.group.title,
      endpoints: found.group.endpoints.map((e) => {
        const lines = withHost(e.exampleResponse.body).split("\n");
        return {
          key: e.anchor,
          href: endpointHref(id, e.slug),
          method: e.exampleRequest.method,
          path: e.exampleRequest.path,
          summary: e.summary,
          curl: withHost(e.exampleRequest.curl),
          requestBody: e.requestBody?.example,
          status: e.exampleResponse.status,
          response:
            lines.length > MAX_RESPONSE_LINES
              ? [...lines.slice(0, MAX_RESPONSE_LINES), "…"].join("\n")
              : lines.join("\n"),
        };
      }),
    },
  ];
});

const facts = [
  {
    term: "Authentication",
    detail:
      "Most endpoints are public. The authentication endpoints accept fixed test credentials for Basic, Bearer, JWT, API key, OAuth 2.0, Digest and HMAC.",
  },
  {
    term: "Writes",
    detail:
      "Creates, updates and deletes work. Data is kept in memory and returns to the seed data when the server restarts.",
  },
  {
    term: "Delays and errors",
    detail: (
      <>
        Add <code>?delay=2</code> to wait before the response, or{" "}
        <code>?error=503</code> to get a simulated error, on any endpoint.
      </>
    ),
  },
  {
    term: "Formats",
    detail:
      "JSON by default, with XML, CSV, YAML, HTML, images, PDF, streams, WebSockets, SOAP and GraphQL where relevant.",
  },
];

function SectionHeader({
  title,
  description,
  aside,
}: {
  title: string;
  description?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-[var(--text-muted)] max-w-xl">
            {description}
          </p>
        )}
      </div>
      {aside}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <JsonLd data={websiteJsonLd} />
      {/* Hero */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 pt-16 sm:pt-24 pb-12">
          <h1 className="max-w-2xl text-3xl sm:text-[2.75rem] sm:leading-[1.1] font-semibold tracking-tight text-[var(--text)]">
            A free API for testing HTTP clients.
          </h1>
          <p className="mt-4 max-w-xl text-[var(--text-muted)] leading-relaxed">
            {endpointCount} endpoints with realistic data: products, books and
            countries, plus status codes, redirects, auth schemes, file formats,
            streaming and failure injection. No account required.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="btn-press inline-flex items-center gap-2 h-10 px-4 rounded-md bg-[var(--btn-bg)] text-[var(--btn-fg)] text-sm font-medium hover:bg-[var(--btn-hover)]"
            >
              Read the docs
              <Icon name="arrowRight" size={14} />
            </Link>
            <div className="inline-flex items-center gap-3 h-10 pl-4 pr-3 rounded-md border border-[var(--border)] bg-[var(--surface)]">
              <code className="text-[13px] font-mono text-[var(--text)] select-all">
                {BASE_URL}
              </code>
              <CopyButton text={BASE_URL} label="base URL" hideLabel />
            </div>
          </div>

          <div className="mt-12">
            <APIPlayground groups={playground} />
          </div>
        </div>
      </section>

      {/* Usage */}
      <section className="bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <SectionHeader
            title="Call it from any language"
            description="It is plain HTTPS. Use fetch, requests, curl or any other HTTP client."
          />
          <CodeTabs examples={codeExamples} sampleResponse={sampleResponse} />
        </div>
      </section>

      {/* Live console */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <SectionHeader
            title="Send a live request"
            description="Choose a preset or edit the request. It goes to the running API. If the server has been idle, the first response can take a few seconds."
          />
          <LiveConsole />
        </div>
      </section>

      {/* What's included */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <SectionHeader
            title="What's included"
            description={`${groups.length} groups of endpoints in ${categories.length} categories. Each links to its reference.`}
            aside={
              <span className="hidden sm:block text-xs font-mono text-[var(--text-muted)] whitespace-nowrap">
                {endpointCount} endpoints
              </span>
            }
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
            {categories.map((c) => (
              <div key={c.id}>
                <h3 className="text-sm font-medium text-[var(--text)] mb-2">
                  {c.title}
                </h3>
                <ul className="border-t border-[var(--border)] text-sm">
                  {c.groups.map((g) => (
                    <li key={g.id} className="border-b border-[var(--border)]">
                      <Link
                        href={`/docs/${g.id}`}
                        className="group flex items-baseline justify-between gap-3 py-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                      >
                        <span className="text-[var(--text)] group-hover:underline underline-offset-4">
                          {g.title}
                        </span>
                        <span className="text-xs font-mono">
                          {g.endpoints.length}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Behaviour */}
      <section className="bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <SectionHeader title="How it behaves" />
          <dl className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
            {facts.map((f) => (
              <div
                key={f.term}
                className="border-t border-[var(--border)] pt-4"
              >
                <dt className="text-sm font-medium text-[var(--text)]">
                  {f.term}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-[var(--text-muted)] [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-[var(--text)]">
                  {f.detail}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 text-sm text-[var(--text-muted)]">
            Credentials, pagination and error formats are covered in the{" "}
            <Link href="/docs" className="link-underline text-[var(--text)]">
              API reference
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
