import type { Metadata } from "next";
import { DocsSidebar } from "@/components/docs-sidebar";
import { EndpointAccordion } from "@/components/endpoint-accordion";
import { CopyButton } from "@/components/copy-button";
import { Highlighted } from "@/lib/syntax";
import { Icon } from "@/components/icon";
import { resources, BASE_URL } from "@/lib/api-data";

export const metadata: Metadata = {
  title: "API reference",
  description:
    "Full API reference for snap-test.in. JSON and XML endpoints with request and response examples.",
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
              <span>snap-test.in</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
              <span className="text-[var(--text)]">API Reference</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3 text-[var(--text)]">
              API Reference
            </h1>
            <p className="text-[var(--text-muted)] mb-8 max-w-lg leading-relaxed">
              Every endpoint, its parameters and an example response. No
              API key is required.
            </p>

            {/* Base URL + Quick start */}
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <div className="rounded-lg border border-[var(--border)] overflow-hidden">
                <div className="px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)]">
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    Base URL
                  </span>
                </div>
                <div className="bg-[var(--code-bg)] px-4 py-3 flex items-center justify-between">
                  <code className="text-sm font-mono text-[var(--code-fg)] select-all">
                    {BASE_URL}
                  </code>
                  <CopyButton
                    text={BASE_URL}
                    className="text-[#78716c] hover:text-[#e7e5e4]"
                  />
                </div>
              </div>
              <div className="rounded-lg border border-[var(--border)] overflow-hidden">
                <div className="px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    Quick start
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
              <div className="rounded-lg border border-[var(--border)] p-4 flex items-start gap-3">
                <Icon name="lock" size={16} className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
                <div>
                  <h4 className="text-sm font-medium text-[var(--text)] mb-0.5">Authentication</h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Not required, except on <code className="font-mono text-[var(--text)] text-[11px]">/api/admin/authorize</code>, which takes a Bearer token.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-4 flex items-start gap-3">
                <Icon name="receipt" size={16} className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
                <div>
                  <h4 className="text-sm font-medium text-[var(--text)] mb-0.5">Writes are not saved</h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    POST, PUT and DELETE return normal responses, but the data resets.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Resource sections with accordion endpoints ── */}
          {resources.map((resource) => (
            <section key={resource.id} id={resource.id} className="mb-16">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--border)]">
                <Icon
                  name={resource.icon}
                  size={20}
                  className="shrink-0 text-[var(--text-muted)]"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
                    {resource.title}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    {resource.description}
                  </p>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)] whitespace-nowrap">
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
        </div>
      </div>
    </div>
  );
}
