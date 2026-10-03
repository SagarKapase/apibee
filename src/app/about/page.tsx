import type { Metadata } from "next";
import Link from "next/link";
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

const parts = [
  {
    href: "/docs",
    title: "The API",
    detail: `${endpointCount} endpoints in ${groups.length} groups at ${BASE_URL}. Realistic records to read and write, plus endpoints for status codes, redirects, authentication, file formats, streaming and failures.`,
  },
  {
    href: "/tools",
    title: "Tools",
    detail:
      "Formatters, converters, encoders, decoders and generators for the everyday work around an API. They run in your browser, so what you paste is not sent to a server.",
  },
  {
    href: "/learn",
    title: "Learn",
    detail: `${lessons.length} lessons on API testing, from a first HTTP request to security, load and CI. Every example calls the API above.`,
  },
];

const principles = [
  {
    term: "No account",
    detail:
      "There is nothing to sign up for and no API key. Test credentials for the authentication endpoints are published in the docs.",
  },
  {
    term: "Failures on purpose",
    detail:
      "Timeouts, error codes, rate limits and malformed responses are hard to trigger on a real service. Here each one has an endpoint or a query parameter.",
  },
  {
    term: "Throwaway data",
    detail:
      "Creates, updates and deletes work, but data lives in memory and returns to the seed data when the server restarts. Don't store anything you need.",
  },
  {
    term: "Free",
    detail:
      "The API, tools and lessons are free to use for learning, demos, prototypes and automated tests.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)]">
        About testingapis.com
      </h1>
      <div className="mt-4 space-y-4 text-[15px] leading-7 text-[var(--text-muted)]">
        <p>
          testingapis.com is a free, public API built for testing HTTP clients.
          It is for testers learning API testing, developers building a front
          end before the real back end exists, and anyone writing automated
          tests that need a server to talk to.
        </p>
        <p>
          A real API is a poor place to practise: it needs an account, it
          limits what you can change, and it rarely fails when you want it to.
          This one accepts writes, publishes its credentials and fails on
          request.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
          What&apos;s here
        </h2>
        <ul className="mt-4 border-t border-[var(--border)]">
          {parts.map((p) => (
            <li key={p.href} className="border-b border-[var(--border)]">
              <Link href={p.href} className="group block py-4">
                <span className="text-sm font-medium text-[var(--text)] group-hover:underline underline-offset-4">
                  {p.title}
                </span>
                <span className="block mt-1 text-[13px] leading-snug text-[var(--text-muted)]">
                  {p.detail}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
          How it works
        </h2>
        <dl className="mt-4 grid sm:grid-cols-2 gap-x-10 gap-y-6">
          {principles.map((p) => (
            <div key={p.term} className="border-t border-[var(--border)] pt-4">
              <dt className="text-sm font-medium text-[var(--text)]">{p.term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
                {p.detail}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
          Contact
        </h2>
        <p className="mt-2 text-[15px] leading-7 text-[var(--text-muted)]">
          Found a bug, need an endpoint that isn&apos;t here, or have a
          question? See{" "}
          <Link href="/support" className="link-underline text-[var(--text)]">
            Support
          </Link>{" "}
          or email{" "}
          <a
            href="mailto:support@testingapis.com"
            className="link-underline text-[var(--text)]"
          >
            support@testingapis.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
