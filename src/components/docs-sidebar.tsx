"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MethodTag } from "./method-tag";
import type { Method } from "@/lib/api-config";

export interface NavLink {
  href: string;
  label: string;
  count?: number;
}

export interface NavGroup {
  id: string;
  title: string;
  href: string;
  endpoints: { href: string; title: string; method: Method }[];
}

export interface NavCategory {
  title: string;
  groups: NavGroup[];
}

export interface SearchEntry {
  href: string;
  method: Method;
  path: string;
  summary: string;
  group: string;
}

const MAX_RESULTS = 60;

const METHOD_TEXT: Record<Method, string> = {
  GET: "text-emerald-700 dark:text-emerald-400",
  POST: "text-blue-700 dark:text-blue-400",
  PUT: "text-amber-700 dark:text-amber-400",
  PATCH: "text-teal-700 dark:text-teal-400",
  DELETE: "text-red-700 dark:text-red-400",
  HEAD: "text-[var(--text-muted)]",
  OPTIONS: "text-[var(--text-muted)]",
};

function linkClass(active: boolean) {
  return `flex items-center gap-2 px-2 py-1 text-[13px] rounded-md border-l-2 transition-colors ${
    active
      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)] font-medium"
      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)]"
  }`;
}

function SimpleSection({ title, links, pathname, onNavigate }: {
  title: string;
  links: NavLink[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div>
      <h3 className="text-xs font-medium text-[var(--text)] mb-1.5 px-2">{title}</h3>
      <ul className="space-y-px">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              onClick={onNavigate}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`${linkClass(pathname === l.href)} justify-between`}
            >
              <span className="truncate">{l.label}</span>
              {l.count !== undefined && (
                <span className="text-[11px] font-mono text-[var(--text-muted)]">{l.count}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DocsSidebar({
  overview,
  categories,
  reference,
  search,
}: {
  overview: NavLink[];
  categories: NavCategory[];
  reference: NavLink[];
  search: SearchEntry[];
}) {
  // Pages are served with a trailing slash; nav hrefs are written without one.
  const pathname = usePathname().replace(/(.)\/$/, "$1");
  const currentGroup = pathname.split("/")[2] ?? "";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([currentGroup]));
  const inputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Open the group of the page being viewed.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpanded((s) => (s.has(currentGroup) ? s : new Set(s).add(currentGroup)));
  }, [currentGroup]);

  // Keep the current page's link visible in a long sidebar.
  useEffect(() => {
    const link = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    link?.scrollIntoView({ block: "nearest" });
  }, [pathname, expanded]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
        setQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return search.filter(
      (e) =>
        e.path.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.group.toLowerCase().includes(q)
    );
  }, [query, search]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function toggle(id: string) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-[var(--btn-bg)] text-[var(--btn-fg)] rounded-full w-11 h-11 flex items-center justify-center shadow-md cursor-pointer"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
        </svg>
      </button>

      <aside
        className={`fixed top-14 left-0 w-72 h-[calc(100vh-3.5rem)] lg:sticky lg:self-start lg:shrink-0 border-r border-[var(--border)] bg-[var(--surface)] z-40 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-3 border-b border-[var(--border)]">
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              aria-label="Search endpoints"
              placeholder="Search endpoints"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 pr-14 py-1.5 text-xs rounded-md bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-muted)]"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex px-1.5 py-0.5 text-[11px] font-mono text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] rounded">
              Ctrl K
            </kbd>
          </div>
        </div>

        <nav ref={navRef} className="flex-1 overflow-y-auto py-4 px-3">
          {results ? (
            <>
              <p className="px-2 mb-2 text-xs text-[var(--text-muted)]">
                {results.length === 0
                  ? `No endpoints match “${query}”.`
                  : `${results.length} ${results.length === 1 ? "endpoint" : "endpoints"}`}
              </p>
              <ul className="space-y-0.5">
                {results.slice(0, MAX_RESULTS).map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} onClick={close} className="block px-2 py-1.5 rounded-md hover:bg-[var(--accent-soft)]">
                      <span className="flex items-center gap-2">
                        <MethodTag method={r.method} />
                        <code className="font-mono text-xs text-[var(--text)] truncate">{r.path}</code>
                      </span>
                      <span className="block mt-0.5 text-[11px] text-[var(--text-muted)] truncate">
                        {r.group} · {r.summary}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {results.length > MAX_RESULTS && (
                <p className="px-2 mt-2 text-xs text-[var(--text-muted)]">
                  Showing the first {MAX_RESULTS}. Refine the search to see more.
                </p>
              )}
            </>
          ) : (
            <div className="space-y-5">
              <SimpleSection title="Overview" links={overview} pathname={pathname} onNavigate={close} />

              {categories.map((c) => (
                <div key={c.title}>
                  <h3 className="text-xs font-medium text-[var(--text)] mb-1.5 px-2">{c.title}</h3>
                  <ul className="space-y-px">
                    {c.groups.map((g) => {
                      const isOpen = expanded.has(g.id);
                      return (
                        <li key={g.id}>
                          <div className="flex items-center">
                            <Link
                              href={g.href}
                              onClick={close}
                              aria-current={pathname === g.href ? "page" : undefined}
                              className={`${linkClass(pathname === g.href)} flex-1 min-w-0`}
                            >
                              <span className="truncate">{g.title}</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => toggle(g.id)}
                              aria-expanded={isOpen}
                              aria-label={`${isOpen ? "Hide" : "Show"} ${g.title} endpoints`}
                              className="flex items-center gap-1 px-1.5 py-1 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                            >
                              {g.endpoints.length}
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className={`transition-transform ${isOpen ? "rotate-90" : ""}`}>
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </button>
                          </div>
                          {isOpen && (
                            <ul className="ml-2 mt-px mb-1 pl-2 border-l border-[var(--border)] space-y-px">
                              {g.endpoints.map((e) => (
                                <li key={e.href}>
                                  <Link
                                    href={e.href}
                                    onClick={close}
                                    title={e.title}
                                    aria-current={pathname === e.href ? "page" : undefined}
                                    className={linkClass(pathname === e.href)}
                                  >
                                    <span className={`w-12 shrink-0 text-[10px] font-mono font-semibold ${METHOD_TEXT[e.method]}`}>
                                      {e.method}
                                    </span>
                                    <span className="truncate">{e.title}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              <SimpleSection title="Reference" links={reference} pathname={pathname} onNavigate={close} />
            </div>
          )}
        </nav>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
