"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "./icon";

export interface ToolGroup {
  id: string;
  title: string;
  /** Short label for the filter buttons. */
  short: string;
  description: string;
  icon: IconName;
  tools: { slug: string; name: string; description: string; icon: IconName }[];
}

/** The tool list with search and category filters. children is the page intro, shown beside the controls. */
export function ToolsDirectory({ groups, children }: { groups: ToolGroup[]; children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Ctrl+K (⌘K on a Mac) jumps to the search box, as in the docs.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const shown = groups
    .filter((g) => filter === null || g.id === filter)
    .map((g) => ({
      ...g,
      tools: g.tools.filter(
        (t) => !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.slug.includes(q)
      ),
    }))
    .filter((g) => g.tools.length > 0);

  const chip = (active: boolean) =>
    `h-8 px-3 rounded-md border text-xs cursor-pointer transition-colors duration-150 ${
      active
        ? "border-amber-500/50 bg-amber-500/10 text-[var(--text)] font-medium"
        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)]/40"
    }`;

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_27rem] lg:items-center">
        <div>{children}</div>
        <div className="min-w-0">
          <label className="flex items-center gap-2.5 h-11 rounded-[9px] border border-[var(--border)] bg-[var(--surface)] px-3.5 focus-within:border-[var(--text-muted)]">
            <Icon name="search" size={16} className="shrink-0 text-[var(--text-muted)]" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
              }}
              placeholder="Search tools..."
              aria-label="Search tools"
              className="flex-1 min-w-0 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <kbd className="hidden sm:inline-block shrink-0 rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)]">
              Ctrl K
            </kbd>
          </label>
          <div role="group" aria-label="Filter by category" className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setFilter(null)} aria-pressed={filter === null} className={`shrink-0 ${chip(filter === null)}`}>
              All
            </button>
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setFilter(filter === g.id ? null : g.id)}
                aria-pressed={filter === g.id}
                className={`shrink-0 whitespace-nowrap ${chip(filter === g.id)}`}
              >
                {g.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-10" aria-live="polite">
        {shown.length === 0 && (
          <p className="rounded-[9px] border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--text-muted)]">
            No tools match &ldquo;{query}&rdquo;.{" "}
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilter(null);
              }}
              className="link-underline text-[var(--text)] cursor-pointer"
            >
              Clear the search
            </button>
          </p>
        )}

        {shown.map((group) => (
          <section key={group.id} aria-labelledby={`tools-${group.id}`}>
            <div className="flex items-start gap-3 mb-4">
              <Icon name={group.icon} size={20} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-4">
                  <h2 id={`tools-${group.id}`} className="shrink-0 text-lg font-semibold tracking-tight text-[var(--text)]">
                    {group.title}
                  </h2>
                  <span aria-hidden="true" className="h-px flex-1 bg-[var(--border)]" />
                  <span className="shrink-0 font-mono text-xs text-[var(--text-muted)]">
                    {group.tools.length} {group.tools.length === 1 ? "tool" : "tools"}
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">{group.description}</p>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {group.tools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="group flex h-full items-center gap-4 rounded-[9px] border border-[var(--border)] bg-[var(--surface)] p-3.5 transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-[var(--text-muted)]/40"
                  >
                    <span className="grid place-items-center size-10 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--text)]">
                      <Icon name={tool.icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[var(--text)]">{tool.name}</span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-[var(--text-muted)]">{tool.description}</span>
                    </span>
                    <Icon
                      name="arrowRight"
                      size={15}
                      className="shrink-0 text-[var(--text-muted)] transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--text)]"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
