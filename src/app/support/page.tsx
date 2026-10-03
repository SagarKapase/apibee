import type { Metadata } from "next";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { BASE_URL } from "@/lib/api-config";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with testingapis.com: email support, what to include in a bug report and answers to common problems.",
};

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
    <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)]">
        Support
      </h1>
      <p className="mt-4 text-[15px] leading-7 text-[var(--text-muted)]">
        Email us about bugs, wrong or missing documentation, endpoints you
        would like added, or anything else about the site.
      </p>

      <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--text-muted)]">Email</p>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-1 block text-base font-medium text-[var(--text)] break-all hover:underline underline-offset-4"
          >
            {EMAIL}
          </a>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <CopyButton text={EMAIL} label="email address" />
          <a
            href={`mailto:${EMAIL}`}
            className="btn-press inline-flex items-center justify-center h-10 px-4 rounded-md bg-[var(--btn-bg)] text-[var(--btn-fg)] text-sm font-medium hover:bg-[var(--btn-hover)]"
          >
            Send an email
          </a>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
          Reporting a problem with the API
        </h2>
        <p className="mt-2 text-[15px] leading-7 text-[var(--text-muted)]">
          Include enough to repeat the request. A cURL command covers most of
          it.
        </p>
        <ul className="mt-3 list-disc pl-5 space-y-1.5 text-[15px] leading-7 text-[var(--text-muted)]">
          {report.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
          Common problems
        </h2>
        <dl className="mt-4 border-t border-[var(--border)]">
          {answers.map((a) => (
            <div key={a.question} className="border-b border-[var(--border)] py-4">
              <dt className="text-sm font-medium text-[var(--text)]">{a.question}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-[var(--text-muted)] [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-[var(--text)] [&_code]:break-all">
                {a.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
