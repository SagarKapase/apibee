import { Fragment } from "react";
import Link from "next/link";
import { APIPlayground } from "@/components/api-playground";
import { CodeTabs } from "@/components/code-tabs";
import { CopyButton } from "@/components/copy-button";
import { MethodTag } from "@/components/method-tag";
import { LiveConsole } from "@/components/live-console";
import { Icon } from "@/components/icon";
import {
  resources,
  codeExamples,
  sampleResponse,
  BASE_URL,
} from "@/lib/api-data";

const endpointCount = resources.reduce((n, r) => n + r.endpoints.length, 0);

const facts = [
  {
    term: "Formats",
    detail: "JSON for every resource. Users are also available as XML.",
  },
  {
    term: "Authentication",
    detail: (
      <>
        None, except <code>/api/admin/authorize</code>, which takes a Bearer
        token from <code>/api/user/Login</code>.
      </>
    ),
  },
  {
    term: "Writes",
    detail:
      "POST, PUT and DELETE return realistic responses, but changes are not saved. Data resets.",
  },
  {
    term: "Cost",
    detail: "Free. No API key, no account.",
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
      {/* Hero */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 pt-16 sm:pt-24 pb-12">
          <h1 className="max-w-2xl text-3xl sm:text-[2.75rem] sm:leading-[1.1] font-semibold tracking-tight text-[var(--text)]">
            A fake REST API for prototypes, tests and teaching.
          </h1>
          <p className="mt-4 max-w-xl text-[var(--text-muted)] leading-relaxed">
            {resources.length} resources and {endpointCount} endpoints with
            realistic data. Responses in JSON or XML. No API key or account
            required.
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
            <APIPlayground />
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

      {/* Resources */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <SectionHeader
            title="Resources"
            description="Each resource links to related ones by ID, so you can build list, detail and relation views."
            aside={
              <span className="hidden sm:block text-xs font-mono text-[var(--text-muted)] whitespace-nowrap">
                {endpointCount} endpoints
              </span>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[var(--border)]">
            {resources.map((r) => (
              <Link
                key={r.id}
                href={`/docs#${r.id}`}
                className="group flex gap-3 p-5 border-r border-b border-[var(--border)] hover:bg-[var(--accent-soft)] transition-colors"
              >
                <Icon
                  name={r.icon}
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-[var(--text)]">
                    {r.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-snug text-[var(--text-muted)]">
                    {r.description}
                  </p>
                  <p className="mt-2 text-xs font-mono text-[var(--text-muted)]">
                    {r.endpoints.length} endpoints
                  </p>
                </div>
              </Link>
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
        </div>
      </section>

      {/* All endpoints */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <SectionHeader title="All endpoints" />
          <div className="rounded-lg border border-[var(--border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--surface)] border-b border-[var(--border)]">
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-[var(--text-muted)] w-24">
                      Method
                    </th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-[var(--text-muted)]">
                      Path
                    </th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-[var(--text-muted)] hidden md:table-cell">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => (
                    <Fragment key={resource.id}>
                      <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                        <th
                          colSpan={3}
                          scope="colgroup"
                          className="px-4 py-2 text-left text-xs font-medium text-[var(--text)]"
                        >
                          {resource.title}
                        </th>
                      </tr>
                      {resource.endpoints.map((ep) => (
                        <tr
                          key={`${resource.id}-${ep.method}-${ep.path}`}
                          className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--accent-soft)] transition-colors"
                        >
                          <td className="py-2.5 px-4">
                            <MethodTag method={ep.method} />
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[12px] text-[var(--text)]">
                            {ep.path}
                          </td>
                          <td className="py-2.5 px-4 text-[var(--text-muted)] text-[13px] hidden md:table-cell">
                            {ep.description}
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Parameters, request bodies and example responses are in the{" "}
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
