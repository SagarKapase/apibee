import type { Metadata } from "next";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { Icon } from "@/components/icon";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { BASE_URL } from "@/lib/api-config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/support",
  title: "Support",
  description:
    "Get help with testingapis.com: email support, what to include in a bug report and answers to common problems.",
});

const EMAIL = "support@testingapis.com";

const report = [
  "The method and full URL, including query parameters",
  "The request headers and body, with any real secrets removed",
  "The status code, headers and body you got back",
  "What you expected instead",
  "The time of the request, with your time zone",
];

const answers = [
  {
    question: "My data disappeared",
    answer: (
      <>
        Data is kept in memory and returns to the seed data when the server
        restarts. Create what you need at the start of each test run.
      </>
    ),
  },
  {
    question: "The first request is slow",
    answer: (
      <>
        If the server has been idle, the first response can take a few
        seconds. Later requests are fast. Check
        whether it is up with{" "}
        <code>GET {BASE_URL}/api/health</code>.
      </>
    ),
  },
  {
    question: "I get a 429 Too Many Requests",
    answer: (
      <>
        Only the{" "}
        <Link href="/docs/rate-limit" className="link-underline text-[var(--text)]">
          Rate limit
        </Link>{" "}
        endpoints enforce a limit: 5 requests per 60 seconds per client. Wait for
        the number of seconds in <code>Retry-After</code>, or send a new{" "}
        <code>X-Client-Id</code> header to start a fresh window.
      </>
    ),
  },
  {
    question: "I get errors I didn't ask for",
    answer: (
      <>
        Check the URL for <code>?error=</code> or <code>?delay=</code>.
        Simulated errors carry the header <code>X-Simulated: true</code>. A
        response without it is a real error, and worth reporting.
      </>
    ),
  },
  {
    question: "Authentication fails",
    answer: (
      <>
        The authentication endpoints accept only the fixed test credentials
        listed in the{" "}
        <Link href="/docs#authentication" className="link-underline text-[var(--text)]">
          API reference
        </Link>
        . A 401 means the credentials are missing or wrong; a 403 means they
        are valid but not allowed on that endpoint.
      </>
    ),
  },
];

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-14 sm:py-20">
      <PageHeader eyebrow="Help" title="Support">
        <p className="max-w-3xl">
          Email us about bugs, wrong or missing documentation, endpoints you
          would like added, or anything else about the site.
        </p>
      </PageHeader>

      <div className="mt-8 flex flex-col gap-4 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid place-items-center size-10 shrink-0 rounded-lg bg-amber-500/10 text-[var(--accent)]">
            <Icon name="mail" size={18} />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Email</p>
            <a
              href={`mailto:${EMAIL}`}
              className="mt-0.5 block font-mono text-[15px] text-[var(--text)] break-all hover:underline underline-offset-4"
            >
              {EMAIL}
            </a>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CopyButton
            text={EMAIL}
            label="email address"
            display="Copy"
            className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--bg)] text-xs hover:bg-[var(--accent-soft)]"
          />
          <a
            href={`mailto:${EMAIL}`}
            className="btn-press inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-[#f59e0b] text-[#1c1917] text-sm font-semibold hover:bg-[#fbbf24]"
          >
            Send an email
            <Icon name="arrowUpRight" size={13} />
          </a>
        </div>
      </div>

      <section className="mt-14" aria-labelledby="reporting">
        <SectionTitle
          id="reporting"
          title="Reporting a problem with the API"
          description="Include enough to repeat the request. A cURL command covers most of it."
        />
        <ul className="divide-y divide-[var(--border)] rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
          {report.map((item) => (
            <li key={item} className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text)]">
              <Icon name="circleCheck" size={16} className="shrink-0 text-[var(--accent)]" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="common-problems">
        <SectionTitle id="common-problems" title="Common problems" meta={`${answers.length} answers`} />
        <div className="divide-y divide-[var(--border)] rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
          {answers.map((a) => (
            <details key={a.question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--accent-soft)] [&::-webkit-details-marker]:hidden">
                {a.question}
                <Icon
                  name="chevronRight"
                  size={15}
                  className="shrink-0 text-[var(--text-muted)] transition-transform duration-150 group-open:rotate-90"
                />
              </summary>
              <div className="px-4 pb-4 text-sm leading-relaxed text-[var(--text-muted)] [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-[var(--text)] [&_code]:break-all">
                {a.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
