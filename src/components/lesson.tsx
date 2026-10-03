// Building blocks for tutorial lessons. Lessons are plain TSX made from these,
// so every lesson shares the same type scale and spacing.

import Link from "next/link";
import { CodeBlock } from "./code-block";
import { Icon } from "./icon";
import type { Lang } from "@/lib/syntax";

export { RunRequest as Run } from "./run-request";

export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-12 mb-4 text-xl font-semibold tracking-tight text-[var(--text)]"
    >
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 mb-3 text-base font-semibold text-[var(--text)]">
      {children}
    </h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="my-4">{children}</p>;
}

/** Inline code. */
export function C({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[0.85em] px-1 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--text)] break-words">
      {children}
    </code>
  );
}

const labels: Partial<Record<Lang, string>> = {
  curl: "Terminal",
  javascript: "JavaScript",
  python: "Python",
  json: "JSON",
  xml: "XML",
  graphql: "GraphQL",
  text: "Text",
};

export function Code({
  code,
  lang = "text",
  label,
}: {
  code: string;
  lang?: Lang;
  label?: string;
}) {
  return (
    <div className="my-5">
      <CodeBlock code={code.trim()} lang={lang} label={label ?? labels[lang] ?? lang} />
    </div>
  );
}

export function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="my-4 pl-5 list-disc space-y-2 marker:text-[var(--text-muted)]">{children}</ul>;
}

export function Ol({ children }: { children: React.ReactNode }) {
  return <ol className="my-4 pl-5 list-decimal space-y-2 marker:text-[var(--text-muted)]">{children}</ol>;
}

/** A side remark. Use sparingly, for things a reader would otherwise trip on. */
export function Note({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <aside className="my-6 rounded-r-md border-l-2 border-[var(--accent)] bg-amber-500/[0.06] py-3 px-4 text-[var(--text-muted)]">
      {title && <p className="mb-1 font-medium text-[var(--text)]">{title}</p>}
      {children}
    </aside>
  );
}

export function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full text-[13px] leading-relaxed">
        <thead>
          <tr className="bg-[var(--surface)] border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
            {head.map((h) => (
              <th key={h} className="py-2 px-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--border)] last:border-b-0 align-top">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`py-2 px-3 ${j === 0 ? "text-[var(--text)]" : "text-[var(--text-muted)]"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Internal links use next/link; anything starting with http opens normally. */
export function A({ href, children }: { href: string; children: React.ReactNode }) {
  const className = "link-underline text-[var(--text)]";
  if (href.startsWith("http")) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/** The closing task of a lesson. Every lesson ends with one. */
export function Exercise({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-12 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
      <h2 id="exercise" className="flex items-center gap-2 text-base font-semibold text-[var(--text)]">
        <Icon name="circleCheck" size={17} className="text-[var(--accent)]" />
        Exercise
      </h2>
      <div className="[&>*:first-child]:mt-2 [&>*:last-child]:mb-0">{children}</div>
    </section>
  );
}
