"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MethodTag } from "./method-tag";
import { openDetails } from "./hash-opener";
import type { Method } from "@/lib/api-config";

export interface NavSection {
  title: string;
  items: { href: string; label: string; count?: number }[];
}

export interface SearchEntry {
  href: string;
  method: Method;
  path: string;
  summary: string;
  group: string;
}

const MAX_RESULTS = 60;

export function DocsSidebar({
  nav,
  search,
}: {
  nav: NavSection[];
  search: SearchEntry[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Keep the current page's link visible in a long sidebar.
  useEffect(() => {
    const link = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    link?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

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

  function openResult(href: string) {
    close();
    // Same-page hash links do not remount anything, so open the entry here.
    const [path, id] = href.split("#");
    if (path === pathname && id) setTimeout(() => openDetails(id), 0);
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-[var(--btn-bg)] text-[var(--btn-fg)] rounded-full w-11 h-11 flex items-center justify-center shadow-md cursor-pointer"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>

      <aside
        className={`fixed top-14 left-0 w-64 h-[calc(100vh-3.5rem)] border-r border-[var(--border)] bg-[var(--surface)] z-40 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-3 border-b border-[var(--border)]">
          <div className="relative">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            >
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
                    <Link
                      href={r.href}
                      onClick={() => openResult(r.href)}
                      className="block px-2 py-1.5 rounded-md hover:bg-[var(--accent-soft)]"
                    >
                      <span className="flex items-center gap-2">
                        <MethodTag method={r.method} />
                        <code className="font-mono text-xs text-[var(--text)] truncate">
                          {r.path}
                        </code>
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
            nav.map((section, i) => (
              <div key={section.title} className={i > 0 ? "mt-5" : ""}>
                <h3 className="text-xs font-medium text-[var(--text)] mb-1.5 px-2">
                  {section.title}
                </h3>
                <ul className="space-y-px">
                  {section.items.map((item) => {
                    const active = item.href === pathname;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={close}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center justify-between gap-2 px-2 py-1 text-[13px] rounded-md border-l-2 transition-colors ${
                            active
                              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)] font-medium"
                              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)]"
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {item.count !== undefined && (
                            <span className="text-[11px] font-mono text-[var(--text-muted)]">
                              {item.count}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
