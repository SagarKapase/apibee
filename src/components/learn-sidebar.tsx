"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { lessons, levels } from "@/lib/learn";

function linkClass(active: boolean) {
  return `flex gap-2 px-2 py-1 text-[13px] rounded-md border-l-2 transition-colors ${
    active
      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)] font-medium"
      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)]"
  }`;
}

export function LearnSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-[var(--btn-bg)] text-[var(--btn-fg)] rounded-full w-11 h-11 flex items-center justify-center shadow-md cursor-pointer"
        aria-label={open ? "Close lessons" : "Open lessons"}
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
        </svg>
      </button>

      <aside
        className={`fixed top-14 left-0 w-72 h-[calc(100vh-3.5rem)] border-r border-[var(--border)] bg-[var(--surface)] z-40 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="h-full overflow-y-auto py-4 px-3 space-y-5">
          <Link
            href="/learn"
            onClick={() => setOpen(false)}
            aria-current={pathname === "/learn" ? "page" : undefined}
            className={linkClass(pathname === "/learn")}
          >
            Overview
          </Link>
          {levels.map(({ level }) => (
            <div key={level}>
              <h3 className="text-xs font-medium text-[var(--text)] mb-1.5 px-2">{level}</h3>
              <ul className="space-y-px">
                {lessons.map((l, i) =>
                  l.level !== level ? null : (
                    <li key={l.slug}>
                      <Link
                        href={`/learn/${l.slug}`}
                        onClick={() => setOpen(false)}
                        aria-current={pathname === `/learn/${l.slug}` ? "page" : undefined}
                        className={linkClass(pathname === `/learn/${l.slug}`)}
                      >
                        <span className="w-5 shrink-0 text-right tabular-nums text-[var(--text-muted)]">
                          {i + 1}
                        </span>
                        <span>{l.title}</span>
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
