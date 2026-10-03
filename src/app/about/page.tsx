import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icon";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { BASE_URL } from "@/lib/api-config";
import { endpointCount, groups } from "@/lib/api-data";
import { lessons } from "@/lib/learn";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/about",
  title: "About",
  description:
    "What testingapis.com is, who it is for and how the free test API, developer tools and API testing lessons work.",
});

const parts: { href: string; title: string; action: string; icon: IconName; detail: string }[] = [
  {
    href: "/docs",
    title: "The API",
    action: "Read the docs",
    icon: "layers",
    detail: `${endpointCount} endpoints in ${groups.length} groups at ${BASE_URL}. Realistic records to read and write, plus endpoints for status codes, redirects, authentication, file formats, streaming and failures.`,
  },
  {
    href: "/tools",
    title: "Tools",
    action: "Open the tools",
    icon: "wrench",
    detail:
      "Formatters, converters, encoders, decoders and generators for the everyday work around an API. They run in your browser, so what you paste is not sent to a server.",
  },
  {
    href: "/learn",
    title: "Learn",
    action: "Start learning",
    icon: "book",
    detail: `${lessons.length} lessons on API testing, from a first HTTP request to security, load and CI. Every example calls the API above.`,
  },
];

const principles: { term: string; icon: IconName; detail: string }[] = [
  {
    term: "No account",
    icon: "circleCheck",
    detail:
      "There is nothing to sign up for and no API key. Test credentials for the authentication endpoints are published in the docs.",
  },
  {
    term: "Failures on purpose",
    icon: "activity",
    detail:
      "Timeouts, error codes, rate limits and malformed responses are hard to trigger on a real service. Here each one has an endpoint or a query parameter.",
  },
  {
    term: "Throwaway data",
    icon: "database",
    detail:
      "Creates, updates and deletes work, but data lives in memory and returns to the seed data when the server restarts. Don't store anything you need.",
  },
  {
    term: "Free",
    icon: "globe",
    detail:
      "The API, tools and lessons are free to use for learning, demos, prototypes and automated tests.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-14 sm:py-20">
      <PageHeader eyebrow="About" title="About testingapis.com">
        <p className="max-w-3xl">
          testingapis.com is a free, public API built for testing HTTP clients.
          It is for testers learning API testing, developers building a front
          end before the real back end exists, and anyone writing automated
          tests that need a server to talk to.
        </p>
        <p className="max-w-3xl">
          A real API is a poor place to practise: it needs an account, it
          limits what you can change, and it rarely fails when you want it to.
          This one accepts writes, publishes its credentials and fails on
          request.
        </p>
      </PageHeader>

      <section className="mt-14" aria-labelledby="whats-here">
        <SectionTitle id="whats-here" title="What's here" meta={`${parts.length} parts`} />
        <ul className="grid gap-3 md:grid-cols-3">
          {parts.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className="group flex h-full flex-col rounded-[9px] border border-[var(--border)] bg-[var(--surface)] p-4 transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-[var(--text-muted)]/40"
              >
                <span className="grid place-items-center size-9 rounded-lg border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--text)]">
                  <Icon name={p.icon} size={17} />
                </span>
                <span className="mt-3 text-sm font-semibold text-[var(--text)]">{p.title}</span>
                <span className="mt-1 flex-1 text-[13px] leading-snug text-[var(--text-muted)]">{p.detail}</span>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
                  {p.action}
                  <Icon name="arrowRight" size={12} className="transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="how-it-works">
        <SectionTitle id="how-it-works" title="How it works" />
        {/* One panel with hairline dividers: the gap shows the border color behind the cells. */}
        <dl className="grid gap-px overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
          {principles.map((p) => (
            <div key={p.term} className="flex gap-3 bg-[var(--surface)] p-4 sm:p-5">
              <span className="grid place-items-center size-9 shrink-0 rounded-full bg-amber-500/10 text-[var(--accent)]">
                <Icon name={p.icon} size={17} />
              </span>
              <div>
                <dt className="text-sm font-semibold text-[var(--text)]">{p.term}</dt>
                <dd className="mt-1 text-[13px] leading-relaxed text-[var(--text-muted)]">{p.detail}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14" aria-labelledby="contact">
        <SectionTitle id="contact" title="Contact" />
        <div className="flex flex-col gap-4 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Found a bug, need an endpoint that isn&apos;t here, or have a
            question? Email{" "}
            <a href="mailto:support@testingapis.com" className="link-underline text-[var(--text)]">
              support@testingapis.com
            </a>
            .
          </p>
          <Link
            href="/support"
            className="btn-press inline-flex shrink-0 items-center justify-center gap-2 h-9 px-3.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] hover:bg-[var(--accent-soft)]"
          >
            Get support
            <Icon name="arrowRight" size={13} />
          </Link>
        </div>
      </section>
    </div>
  );
}
