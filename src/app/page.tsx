import { Fragment } from "react";
import Link from "next/link";
import { APIPlayground } from "@/components/api-playground";
import { CodeTabs } from "@/components/code-tabs";
import { CopyButton } from "@/components/copy-button";
import { MethodTag } from "@/components/method-tag";
import { Testimonials } from "@/components/testimonials";
import { FadeIn } from "@/components/fade-in";
import { LiveConsole } from "@/components/live-console";
import {
  resources,
  codeExamples,
  sampleResponse,
  BASE_URL,
} from "@/lib/api-data";

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 pt-14 sm:pt-20 pb-10">
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text)] mb-2">
                  API<span className="text-[var(--accent)]">Bee</span>
                </h1>
                <p className="text-[var(--text-muted)] max-w-md">
                  Fake REST API you can actually call. Returns JSON and XML. No
                  key, no signup, no nonsense.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="inline-flex items-center gap-2 bg-[var(--code-bg)] rounded-lg px-3.5 py-2 hover:shadow-md hover:shadow-[var(--ring)] transition-shadow duration-300">
                  <code className="text-xs font-mono text-[var(--code-fg)] select-all">
                    {BASE_URL}
                  </code>
                  <CopyButton
                    text={BASE_URL}
                    className="text-[#525252] hover:text-[var(--accent)]"
                  />
                </div>
                <Link
                  href="/docs"
                  className="btn-press hidden sm:inline-flex items-center justify-center h-9 px-4 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[var(--ring)]"
                >
                  Docs
                </Link>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <APIPlayground />
          </FadeIn>
        </div>
      </section>

      {/* ── How to use it ── */}
      <section className="bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-14">
          <FadeIn>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-6">
              Three lines. That&apos;s it.
            </h2>
          </FadeIn>
          <FadeIn delay={0.08}>
            <CodeTabs examples={codeExamples} sampleResponse={sampleResponse} />
          </FadeIn>
        </div>
      </section>

      {/* ── Live Console ── */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-14">
          <FadeIn>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text)] mb-1">
                  Try it live
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Pick a preset or type your own. Real requests, real responses.
                </p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <LiveConsole />
          </FadeIn>
        </div>
      </section>

      {/* ── What you get ── */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-14">
          <FadeIn>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--text)]">
                What you get
              </h2>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {resources.reduce((n, r) => n + r.endpoints.length, 0)}{" "}
                endpoints
              </span>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {resources.map((r, i) => (
              <FadeIn key={r.id} delay={0.05 + i * 0.08}>
                <Link
                  href={`/docs#${r.id}`}
                  className="group flex gap-4 border border-[var(--border)] rounded-xl p-5 hover-lift hover:border-[var(--accent)]/40 hover:shadow-lg hover:shadow-[var(--ring)] block h-full"
                >
                  <span className="text-2xl mt-0.5 shrink-0 transition-transform duration-300 group-hover:scale-110">
                    {r.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--text)] text-sm group-hover:text-[var(--accent)] transition-colors duration-200">
                      {r.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 mb-3">
                      {r.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {r.endpoints.map((ep) => (
                        <MethodTag key={`${ep.method}-${ep.path}`} method={ep.method} />
                      ))}
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <Testimonials />

      {/* ── All endpoints ── */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-14">
          <FadeIn>
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--surface)] border-b border-[var(--border)]">
                      <th className="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] w-20">
                        Method
                      </th>
                      <th className="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                        Endpoint
                      </th>
                      <th className="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] hidden md:table-cell">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((resource) => (
                      <Fragment key={resource.id}>
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--accent)]"
                          >
                            {resource.icon} {resource.title}
                          </td>
                        </tr>
                        {resource.endpoints.map((ep) => (
                          <tr
                            key={`${resource.id}-${ep.method}-${ep.path}`}
                            className="row-hover border-b border-[var(--border)]/50 hover:bg-[var(--accent-soft)] transition-colors duration-150"
                          >
                            <td className="py-2.5 px-4">
                              <MethodTag method={ep.method} />
                            </td>
                            <td className="py-2.5 px-4 font-mono text-[12px] text-[var(--text)]">
                              {ep.path}
                            </td>
                            <td className="py-2.5 px-4 text-[var(--text-muted)] text-xs hidden md:table-cell">
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

            <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
              <Link
                href="/docs"
                className="link-underline text-[var(--accent)] font-medium"
              >
                Full docs
              </Link>{" "}
              — every endpoint, every response shape, copy-paste cURL.
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
