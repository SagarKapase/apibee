import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy policy",
  description:
    "What testingapis.com collects, how the free test API and browser tools handle your data, and how advertising cookies from Google work.",
});

const UPDATED = "October 3, 2026";
const EMAIL = "support@testingapis.com";

const external = "link-underline text-[var(--text)]";

const sections: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "summary",
    title: "Summary",
    body: (
      <>
        <p>
          testingapis.com has no accounts and no sign-up. We do not ask for your
          name, and we do not sell personal information. The developer tools run
          in your browser, so what you paste into them is not sent to us. The site
          may show ads from Google, which uses cookies as described below.
        </p>
      </>
    ),
  },
  {
    id: "tools",
    title: "Developer tools",
    body: (
      <p>
        The tools under <Link href="/tools" className={external}>/tools</Link>, such as
        the JSON formatter, JWT decoder and hash generator, process your input
        with JavaScript on your device. The text, tokens and files you give them
        are not uploaded to our servers.
      </p>
    ),
  },
  {
    id: "api",
    title: "The test API",
    body: (
      <>
        <p>
          When you call <code>api.testingapis.com</code>, from your own code or from
          the &quot;Try it&quot; panels in the docs, the server receives the request you
          send: its URL, headers, body and your IP address. Data you create
          through the API is kept in memory and is lost when the server
          restarts. It is shared test data, so other people may see it while it
          exists.
        </p>
        <p>
          Do not send real personal data, real passwords or production secrets to
          the API. Use the fake data it provides.
        </p>
      </>
    ),
  },
  {
    id: "logs",
    title: "Server logs",
    body: (
      <p>
        Like most websites, our hosting providers, including Cloudflare, may
        record standard request logs: IP address, time, requested URL, browser
        user agent and response status. These logs are used to keep the service
        running, to find bugs and to block abuse. They are not used to identify
        you personally.
      </p>
    ),
  },
  {
    id: "storage",
    title: "Storage in your browser",
    body: (
      <>
        <p>The site itself saves two things in your browser&apos;s local storage:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your light or dark theme choice.</li>
          <li>
            Test credentials you enter in the docs &quot;Try it&quot; panels, so you
            do not have to type them again. They stay on your device.
          </li>
        </ul>
        <p>You can clear both at any time by clearing site data in your browser.</p>
      </>
    ),
  },
  {
    id: "advertising",
    title: "Advertising and cookies",
    body: (
      <>
        <p>
          We use Google AdSense to show ads, which keeps the site free.
          Third-party vendors, including Google, use cookies to serve ads based on
          your prior visits to this website or other websites.
        </p>
        <p>
          Google&apos;s use of advertising cookies enables it and its partners to
          serve ads to you based on your visits to this site and/or other sites on
          the Internet. Google may also use cookies, device identifiers and your
          approximate location to measure ads and prevent fraud.
        </p>
        <p>
          You can opt out of personalized advertising in{" "}
          <a href="https://adssettings.google.com" className={external} rel="noopener noreferrer">
            Google Ads Settings
          </a>
          . You can also opt out of some third-party vendors&apos; use of cookies
          for personalized advertising at{" "}
          <a href="https://www.aboutads.info/choices/" className={external} rel="noopener noreferrer">
            aboutads.info
          </a>{" "}
          or, in Europe,{" "}
          <a href="https://www.youronlinechoices.eu/" className={external} rel="noopener noreferrer">
            youronlinechoices.eu
          </a>
          . If you opt out, you will still see ads, but they will not be based on
          your interests.
        </p>
        <p>
          To learn more, read{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            className={external}
            rel="noopener noreferrer"
          >
            how Google uses information from sites that use its services
          </a>{" "}
          and{" "}
          <a href="https://policies.google.com/technologies/ads" className={external} rel="noopener noreferrer">
            how Google uses cookies in advertising
          </a>
          .
        </p>
        <p>
          Visitors in the European Economic Area, the United Kingdom and
          Switzerland are asked for consent before personalized ads are shown, and
          can change their choice at any time from the privacy settings link that
          appears with the consent message.
        </p>
      </>
    ),
  },
  {
    id: "email",
    title: "Email",
    body: (
      <p>
        If you email us, we use your address and message only to reply and to
        fix the problem you reported. We do not add you to a mailing list.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        The site is meant for developers and is not directed at children under
        13. We do not knowingly collect personal information from children.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <p>
        Depending on where you live, you may have the right to ask what personal
        information we hold about you, or to have it corrected or deleted. Because
        we have no accounts, we usually hold none beyond short-lived server logs
        and any email you send us. Email{" "}
        <a href={`mailto:${EMAIL}`} className={external}>
          {EMAIL}
        </a>{" "}
        with any request.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        If we change this policy, we will update it on this page and change the
        date at the top.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-14 sm:py-20">
      <PageHeader eyebrow="Legal" title="Privacy policy">
        <p>Last updated: {UPDATED}</p>
      </PageHeader>

      <div className="mt-12 space-y-12">
        {sections.map((s) => (
          <section key={s.id} aria-labelledby={s.id}>
            <SectionTitle id={s.id} title={s.title} />
            <div className="max-w-3xl space-y-4 text-[15px] leading-7 text-[var(--text-muted)] [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-[var(--text)]">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-14 text-sm text-[var(--text-muted)]">
        Questions about this policy? Email{" "}
        <a href={`mailto:${EMAIL}`} className={external}>
          {EMAIL}
        </a>{" "}
        or see the <Link href="/support" className={external}>support page</Link>.
      </p>
    </div>
  );
}
