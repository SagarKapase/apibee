import type { Metadata } from "next";
import { DocsSidebar } from "@/components/docs-sidebar";
import { EndpointAccordion } from "@/components/endpoint-accordion";
import { CopyButton } from "@/components/copy-button";
import { Highlighted } from "@/lib/syntax";
import { resources, BASE_URL } from "@/lib/api-data";

export const metadata: Metadata = {
  title: "Docs — APIBee API Reference",
  description:
    "Full API reference for APIBee. JSON and XML endpoints with request and response examples.",
};

const quickStart = `fetch('${BASE_URL}/api/user/getAllUsers')
  .then(res => res.json())
  .then(data => console.log(data))`;

export default function DocsPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <DocsSidebar />

      <div className="flex-1 lg:ml-56">
        <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
          {/* ── Introduction ── */}
          <section id="introduction" className="mb-16">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-6">
              <span>APIBee</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
              <span className="text-[var(--text)]">API Reference</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-[var(--text)]">
              API Reference
            </h1>
            <p className="text-[var(--text-muted)] mb-8 max-w-lg leading-relaxed">
              Fake users, fake jobs, real JSON shapes. No key needed. Just
              hit the URL.
            </p>

            {/* Base URL + Quick start */}
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                <div className="px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)]">
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Base URL
                  </span>
                </div>
                <div className="bg-[var(--code-bg)] px-4 py-3 flex items-center justify-between">
                  <code className="text-sm font-mono text-[var(--accent)] select-all">
                    {BASE_URL}
                  </code>
                  <CopyButton
                    text={BASE_URL}
                    className="text-[#525252] hover:text-[var(--accent)]"
                  />
                </div>
              </div>
              <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                <div className="px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Quick Start
                  </span>
                  <CopyButton
                    text={quickStart}
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] text-xs"
                  />
                </div>
                <div className="bg-[var(--code-bg)] px-4 py-3 overflow-x-auto">
                  <pre className="text-[11px] leading-[1.6] bg-transparent">
                    <code className="font-mono">
                      <Highlighted code={quickStart} lang="javascript" />
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Info cards */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border)] p-4 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-600 dark:text-emerald-400">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text)] mb-0.5">No auth on most routes</h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Everything is open. One exception: <code className="text-[var(--accent)] text-[10px]">/api/admin/authorize</code> wants a Bearer token.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-4 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-amber-600 dark:text-amber-400">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text)] mb-0.5">Data resets</h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    POST, PUT, DELETE go through fine but nothing sticks. The database resets.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Resource sections with accordion endpoints ── */}
          {resources.map((resource) => (
            <section key={resource.id} id={resource.id} className="mb-16">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--border)]">
                <span className="text-xl" aria-hidden="true">
                  {resource.icon}
                </span>
                <div className="flex-1">
                  <h2 className="text-xl font-bold tracking-tight text-[var(--text)]">
                    {resource.title}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    {resource.description}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded">
                  {resource.endpoints.length} endpoints
                </span>
              </div>

              {/* Accordion endpoint list */}
              <div className="space-y-2">
                {resource.endpoints.map((ep) => (
                  <EndpointAccordion
                    key={`${ep.method}-${ep.path}`}
                    endpoint={ep}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* Bottom */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
            <p className="text-sm text-[var(--text-muted)] mb-2">
              Something missing? Something broken?
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Open an issue on GitHub
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
