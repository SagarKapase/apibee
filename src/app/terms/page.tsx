import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/terms",
  title: "Terms of use",
  description:
    "The terms for using the testingapis.com free test API, developer tools and API testing lessons.",
});

const UPDATED = "October 3, 2026";
const EMAIL = "support@testingapis.com";

const link = "link-underline text-[var(--text)]";

const sections: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "service",
    title: "The service",
    body: (
      <p>
        testingapis.com provides a free fake API, browser-based developer tools
        and API testing lessons. By using the site or the API you agree to these
        terms. If you do not agree, do not use them.
      </p>
    ),
  },
  {
    id: "test-data",
    title: "Test data only",
    body: (
      <p>
        The API returns made-up data for prototyping, learning and testing. It is
        not accurate, complete or suitable for real decisions. Data you create is
        temporary, may be visible to other users and is deleted when the server
        restarts. Do not send real personal data, real credentials or anything
        confidential.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Send traffic meant to overload the service, such as load tests at a
            volume that affects other users, or denial-of-service attacks.
          </li>
          <li>Try to get around rate limits or break into the servers.</li>
          <li>Use the service to store or spread illegal, harmful or abusive content.</li>
          <li>Use the service as the backend of a production application.</li>
        </ul>
        <p>
          We may block clients that break these rules, without notice.
        </p>
      </>
    ),
  },
  {
    id: "availability",
    title: "Availability",
    body: (
      <p>
        The service is free and provided without uptime guarantees. Endpoints,
        tools and lessons may change, be rate limited or be removed at any time.
      </p>
    ),
  },
  {
    id: "content",
    title: "Content",
    body: (
      <p>
        You may use the code examples on this site in your own projects. The
        site&apos;s design, text and lessons remain ours; do not republish them as
        your own.
      </p>
    ),
  },
  {
    id: "ads",
    title: "Advertising and third-party links",
    body: (
      <p>
        The site may show ads and link to other websites. We are not responsible
        for the content of ads or third-party sites. See the{" "}
        <Link href="/privacy" className={link}>
          privacy policy
        </Link>{" "}
        for how advertising cookies work.
      </p>
    ),
  },
  {
    id: "warranty",
    title: "No warranty",
    body: (
      <p>
        The site, the API and the tools are provided &quot;as is&quot;, without
        warranties of any kind. To the extent the law allows, we are not liable
        for any loss or damage that comes from using them, including lost data,
        failed tests or downtime.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these terms. The date at the top shows the latest version.
        Using the site after a change means you accept the new terms.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-14 sm:py-20">
      <PageHeader eyebrow="Legal" title="Terms of use">
        <p>Last updated: {UPDATED}</p>
      </PageHeader>

      <div className="mt-12 space-y-12">
        {sections.map((s) => (
          <section key={s.id} aria-labelledby={s.id}>
            <SectionTitle id={s.id} title={s.title} />
            <div className="max-w-3xl space-y-4 text-[15px] leading-7 text-[var(--text-muted)]">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-14 text-sm text-[var(--text-muted)]">
        Questions about these terms? Email{" "}
        <a href={`mailto:${EMAIL}`} className={link}>
          {EMAIL}
        </a>
        .
      </p>
    </div>
  );
}
