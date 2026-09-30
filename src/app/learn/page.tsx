import type { Metadata } from "next";
import Link from "next/link";
import { lessons, levels } from "@/lib/learn";
import { BASE_URL } from "@/lib/api-config";

export const metadata: Metadata = {
  title: "Learn API testing",
  description:
    "A free API testing tutorial in 19 lessons, from your first HTTP request to security, load and CI. Every example runs against a real API.",
};

export default function LearnPage() {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)]">
        Learn API testing
      </h1>
      <div className="mt-4 space-y-4 text-[15px] leading-7 text-[var(--text-muted)]">
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
      </div>

      <div className="mt-12 space-y-12">
        {levels.map(({ level, description }) => (
          <section key={level}>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">{level}</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
            <ol className="mt-4 border-t border-[var(--border)]">
              {lessons.map((l, i) =>
                l.level !== level ? null : (
                  <li key={l.slug} className="border-b border-[var(--border)]">
                    <Link href={`/learn/${l.slug}`} className="group flex gap-4 py-4">
                      <span className="w-5 shrink-0 text-right text-sm tabular-nums text-[var(--text-muted)]">
                        {i + 1}
                      </span>
                      <span>
                        <span className="text-sm font-medium text-[var(--text)] group-hover:underline underline-offset-4">
                          {l.title}
                        </span>
                        <span className="block mt-1 text-[13px] leading-snug text-[var(--text-muted)]">
                          {l.summary}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              )}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
