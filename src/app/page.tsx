import type { Metadata } from "next";
import Link from "next/link";
import {
  APIPlayground,
  type PlaygroundGroup,
} from "@/components/api-playground";
import { ApiCollection } from "@/components/api-collection";
import { CodeTabs } from "@/components/code-tabs";
import { CopyButton } from "@/components/copy-button";
import { LiveConsole, type ConsoleResource } from "@/components/live-console";
import { Icon, type IconName } from "@/components/icon";
import { JsonLd } from "@/components/json-ld";
import { BASE_URL, withHost } from "@/lib/api-config";
import {
  categories,
  codeExamples,
  endpointCount,
  endpointHref,
  findGroup,
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

// The explorer's sidebar lists the Resources category; the tabs are the most used groups.
// Only these groups are sent to the browser.
const EXPLORER_TABS = ["products", "posts", "countries", "echo", "status", "utils"];
const EXPLORER_RESOURCES =
  categories.find((c) => c.id === "resources")?.groups.map((g) => g.id) ?? [];
const MAX_RESPONSE_LINES = 40;

const playground: PlaygroundGroup[] = [...new Set([...EXPLORER_TABS, ...EXPLORER_RESOURCES])].flatMap((id) => {
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
          headers: e.exampleResponse.headers,
          response:
            lines.length > MAX_RESPONSE_LINES
              ? [...lines.slice(0, MAX_RESPONSE_LINES), "…"].join("\n")
              : lines.join("\n"),
        };
      }),
    },
  ];
});

const summary: { icon: IconName; title: string; detail: string }[] = [
  { icon: "box", title: String(endpointCount), detail: "endpoints" },
  { icon: "layers", title: String(categories.length), detail: "categories" },
  { icon: "fileText", title: "Realistic data", detail: "products, books, countries + more" },
  { icon: "zap", title: "No account", detail: "no API key or sign-up" },
];

// Statements here must stay true of the API.
const usageNotes: { icon: IconName; title: string; detail: string }[] = [
  { icon: "zap", title: "Simple HTTP", detail: "Standard methods, JSON responses by default" },
  { icon: "code", title: "No SDK required", detail: "Works with any language or HTTP tool" },
  { icon: "globe", title: "Public and free", detail: "Most endpoints need no credentials" },
];

// Resources in the live console sidebar. Titles, counts and the request each one loads come from the catalog.
const CONSOLE_GROUPS = ["products", "posts", "countries", "echo", "status", "utils", "books", "movies"];

const consoleResources: ConsoleResource[] = CONSOLE_GROUPS.flatMap((id) => {
  const found = findGroup(id);
  if (!found) return [];
  const { group } = found;
  const first = group.endpoints[0];
  // The path every endpoint in the group starts with, cut back to a whole segment.
  const paths = group.endpoints.map((e) => e.exampleRequest.path.split("?")[0]);
  let prefix = paths.reduce((acc, p) => {
    let i = 0;
    while (i < acc.length && acc[i] === p[i]) i++;
    return acc.slice(0, i);
  });
  if (!paths.every((p) => p.length === prefix.length || p[prefix.length] === "/")) {
    prefix = prefix.slice(0, prefix.lastIndexOf("/") + 1);
  }
  prefix = prefix.replace(/\/$/, "");
  return [
    {
      id,
      title: group.title,
      count: group.endpoints.length,
      prefix,
      method: first.exampleRequest.method,
      path: first.exampleRequest.path,
      body: first.requestBody?.example,
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

// Monospace eyebrow, then a heading with one amber phrase.
function SectionHeader({
  eyebrow,
  title,
  highlight,
  description,
}: {
  eyebrow: string;
  title: string;
  /** The part of the title shown in amber. */
  highlight?: string;
  description?: string;
}) {
  const at = highlight ? title.indexOf(highlight) : -1;
  return (
    <div className="mb-7">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-[1.75rem] sm:text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-[var(--text)]">
        {at === -1 ? (
          title
        ) : (
          <>
            {title.slice(0, at)}
            <span className="text-[var(--accent)]">{highlight}</span>
            {title.slice(at + highlight!.length)}
          </>
        )}
      </h2>
      {description && (
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <JsonLd data={websiteJsonLd} />
      {/* Hero */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 pt-14 sm:pt-20 pb-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-center">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--text-muted)]">
                API documentation
              </p>
              <h1 className="mt-3 text-[2.25rem] leading-[1.05] sm:text-5xl sm:leading-[1.02] font-semibold tracking-[-0.035em] text-[var(--text)]">
                A free API for <span className="text-[var(--accent)]">testing</span>
                <br />
                HTTP clients.
              </h1>
              <p className="mt-4 max-w-xl text-[15px] text-[var(--text-muted)] leading-relaxed">
                {endpointCount} endpoints with realistic data: products, books and
                countries, plus status codes, redirects, auth schemes, file formats,
                streaming and failure injection. No account required.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-3">
                <Link
                  href="/docs"
                  className="btn-press inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-[#f59e0b] text-[#1c1917] text-sm font-semibold hover:bg-[#fbbf24]"
                >
                  Read the docs
                  <Icon name="arrowRight" size={14} />
                </Link>
                <div className="flex items-center gap-3 h-10 pl-3 pr-2 rounded-md border border-[var(--border)] bg-[var(--bg)] sm:min-w-[19rem]">
                  <code className="flex-1 min-w-0 truncate text-[13px] font-mono text-[var(--text)] select-all">
                    {BASE_URL}
                  </code>
                  <CopyButton text={BASE_URL} label="base URL" hideLabel className="shrink-0 p-1" />
                </div>
              </div>
            </div>

            {/* One panel with hairline dividers: the gap shows the border color behind the cells. */}
            <dl className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--border)]">
              {summary.map((item) => (
                <div key={item.title} className="flex items-center gap-3 bg-[var(--surface)] p-3.5 sm:p-4">
                  <span className="grid place-items-center size-9 shrink-0 rounded-full bg-amber-500/10 text-[var(--accent)]">
                    <Icon name={item.icon} size={17} />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[15px] font-semibold leading-tight text-[var(--text)]">{item.title}</dt>
                    <dd className="mt-0.5 text-xs leading-snug text-[var(--text-muted)]">{item.detail}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-12">
            <APIPlayground groups={playground} resources={EXPLORER_RESOURCES} tabs={EXPLORER_TABS} />
          </div>
        </div>
      </section>

      {/* Usage */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <SectionHeader
            eyebrow="Quick start"
            title="Call it from any language"
            highlight="any language"
            description="It is a plain HTTPS API that returns JSON. Use fetch, requests, curl or any other HTTP client."
          />
          <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12 items-start">
            <CodeTabs examples={codeExamples} sampleResponse={sampleResponse} />
            <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-[var(--border)]">
              {usageNotes.map((n) => (
                <li key={n.title} className="flex gap-3 lg:py-3.5 lg:first:pt-1">
                  <span className="grid place-items-center size-8 shrink-0 rounded-[7px] bg-amber-500/10 text-[var(--accent)]">
                    <Icon name={n.icon} size={16} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--text)]">{n.title}</p>
                    <p className="mt-0.5 text-xs leading-snug text-[var(--text-muted)]">{n.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Live console */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <SectionHeader
            eyebrow="Try it now"
            title="Send a live request"
            highlight="live request"
            description="Choose a resource or a preset, or edit the request. It goes to the running API, not a mock. If the server has been idle, the first response can take a few seconds."
          />
          <LiveConsole resources={consoleResources} />
        </div>
      </section>

      {/* What's included */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <ApiCollection />
        </div>
      </section>

      {/* Behaviour */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <SectionHeader eyebrow="Details" title="How it behaves" highlight="behaves" />
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
