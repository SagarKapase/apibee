import Link from "next/link";
import { Icon } from "@/components/icon";
import { InlineText } from "@/components/inline-text";
import { SectionTitle } from "@/components/page-header";
import type { ToolGuide as Guide } from "@/lib/tool-guides/types";

// Rendered on the server under each tool so the explanation is part of the page's HTML.
export function ToolGuide({ guide }: { guide: Guide }) {
  return (
    <div className="max-w-5xl mx-auto px-5 pb-16 sm:pb-20">
      <div className="max-w-3xl space-y-14 border-t border-[var(--border)] pt-12">
        <section aria-labelledby="about">
          <SectionTitle id="about" title={guide.aboutTitle} />
          <div className="space-y-4 text-[15px] leading-7 text-[var(--text-muted)]">
            {guide.about.map((p) => (
              <p key={p}>
                <InlineText text={p} />
              </p>
            ))}
          </div>
        </section>

        <section aria-labelledby="how-to-use">
          <SectionTitle id="how-to-use" title="How to use this tool" />
          <ol className="space-y-3 text-[15px] leading-7 text-[var(--text-muted)]">
            {guide.steps.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="grid place-items-center size-6 mt-0.5 shrink-0 rounded-full bg-amber-500/10 font-mono text-xs text-[var(--accent)]">
                  {i + 1}
                </span>
                <span>
                  <InlineText text={step} />
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="faq">
          <SectionTitle id="faq" title="Frequently asked questions" />
          <div className="divide-y divide-[var(--border)] rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
            {guide.faq.map((item) => (
              <div key={item.q} className="px-4 py-4">
                <h3 className="text-sm font-medium text-[var(--text)]">{item.q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
                  <InlineText text={item.a} />
                </p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="related">
          <SectionTitle id="related" title="Related" />
          <ul className="grid gap-2 sm:grid-cols-2">
            {guide.related.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-4 py-3 text-sm text-[var(--text)] hover:bg-[var(--accent-soft)]"
                >
                  {r.label}
                  <Icon name="chevronRight" size={15} className="shrink-0 text-[var(--text-muted)]" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
