import type { Metadata } from "next";
import Link from "next/link";
import { lessons, levels } from "@/lib/learn";
import { BASE_URL } from "@/lib/api-config";
import { Icon } from "@/components/icon";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/learn",
  title: "Learn API testing",
  description:
    "A free API testing tutorial in 19 lessons, from your first HTTP request to security, load and CI. Every example runs against a real API.",
});

export default function LearnPage() {
  return (
    <div>
      <PageHeader eyebrow="Tutorial" title="Learn API testing">
        <p>
          This tutorial starts with what an API is and ends with load tests and
          CI pipelines. You don&apos;t need to know how to program for the first
          seven lessons. After that, some examples use JavaScript or Python, and
          each one is short enough to copy and run.
        </p>
        <p>
          Every request in the lessons goes to a real API,{" "}
          <code className="font-mono text-[0.85em] text-[var(--text)]">{BASE_URL}</code>.
          It needs no account, it accepts writes, and it has endpoints built to
          fail in specific ways, so you can practise on problems that are hard
          to reproduce elsewhere. Most examples have a Send button that runs the
          request from this page.
        </p>
      </PageHeader>

      <p className="mt-6 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-[var(--text-muted)]">
        <span>{lessons.length} lessons</span>
        <span aria-hidden="true">·</span>
        <span>{levels.length} levels</span>
        <span aria-hidden="true">·</span>
        <span>Free, no account</span>
      </p>

      <div className="mt-12 space-y-12">
        {levels.map(({ level, description }) => {
          const inLevel = lessons.filter((l) => l.level === level);
          return (
            <section key={level} aria-labelledby={`level-${level}`}>
              <SectionTitle
                id={`level-${level}`}
                title={level}
                meta={`${inLevel.length} lessons`}
                description={description}
              />
              <ol className="grid gap-3 sm:grid-cols-2">
                {inLevel.map((l) => {
                  const number = lessons.indexOf(l) + 1;
                  return (
                    <li key={l.slug}>
                      <Link
                        href={`/learn/${l.slug}`}
                        className="group flex h-full items-start gap-3 rounded-[9px] border border-[var(--border)] bg-[var(--surface)] p-3.5 transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-[var(--text-muted)]/40"
                      >
                        <span className="grid place-items-center size-8 shrink-0 rounded-md border border-[var(--border)] bg-[var(--accent-soft)] font-mono text-xs tabular-nums text-[var(--text)]">
                          {String(number).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-[var(--text)]">{l.title}</span>
                          <span className="mt-0.5 block text-[13px] leading-snug text-[var(--text-muted)]">{l.summary}</span>
                        </span>
                        <Icon
                          name="arrowRight"
                          size={14}
                          className="mt-1 shrink-0 text-[var(--text-muted)] transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--text)]"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
