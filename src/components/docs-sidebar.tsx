"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { resources } from "@/lib/api-data";

interface SidebarItem {
  id: string;
  label: string;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const groups: SidebarGroup[] = [
  {
    title: "Overview",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "quick-start", label: "Quick start" },
    ],
  },
  {
    title: "Guides",
    items: [
      { id: "authentication", label: "Authentication" },
      { id: "error-handling", label: "Error handling" },
    ],
  },
  {
    title: "API Reference",
    items: resources.map((r) => ({ id: r.id, label: r.title })),
  },
];

export function DocsSidebar() {
  const [active, setActive] = useState("introduction");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const link = nav.querySelector(`a[href="#${active}"]`) as HTMLElement | null;
    if (link) {
      const navRect = nav.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      if (linkRect.top < navRect.top || linkRect.bottom > navRect.bottom) {
        link.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [active]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        setQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => i.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-[var(--btn-bg)] text-[var(--btn-fg)] rounded-full w-11 h-11 flex items-center justify-center shadow-md transition-colors cursor-pointer"
        aria-label="Toggle navigation"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {open ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>

      <aside
        className={`
          fixed top-14 left-0 w-60 h-[calc(100vh-3.5rem)] border-r border-[var(--border)]
          bg-[var(--surface)] z-40 flex flex-col
          transition-transform duration-200 ease-out
          lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}
        `}
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
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 pr-14 py-1.5 text-xs rounded-lg
                bg-[var(--bg)] border border-[var(--border)]
                text-[var(--text)] placeholder:text-[var(--text-muted)]
                focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
                transition-colors duration-150"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] font-mono text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] rounded">
              Ctrl K
            </kbd>
          </div>
        </div>

        <nav ref={navRef} className="flex-1 overflow-y-auto py-4 px-3">
          {filtered.map((group, gi) => (
            <div key={group.title} className={gi > 0 ? "mt-5" : ""}>
              <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2 px-2.5">
                {group.title}
              </h3>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={() => setOpen(false)}
                      className={`
                        block px-2.5 py-1.5 text-[13px] rounded-md transition-all duration-150
                        border-l-2 ml-px
                        ${
                          active === item.id
                            ? "border-[var(--accent)] text-[var(--text)] font-medium bg-[var(--accent-soft)]"
                            : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)]"
                        }
                      `}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="px-2.5 py-4 text-xs text-[var(--text-muted)] text-center">
              No results for &ldquo;{query}&rdquo;
            </p>
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
