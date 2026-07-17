"use client";

import { useState, useEffect } from "react";
import { resources } from "@/lib/api-data";

export function DocsSidebar() {
  const [active, setActive] = useState("introduction");
  const [open, setOpen] = useState(false);

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

  const introLink = { id: "introduction", label: "Introduction" };
  const resourceLinks = resources.map((r) => ({ id: r.id, label: r.title }));

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-[var(--accent)] text-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all cursor-pointer active:scale-95"
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

      {/* Sidebar */}
      <aside
        className={`
          fixed top-14 left-0 w-56 h-[calc(100vh-3.5rem)] border-r border-[var(--border)]
          bg-[var(--surface)] overflow-y-auto z-40
          transition-transform duration-200 ease-out
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <nav className="py-6 px-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3 px-2.5">
            On this page
          </h3>

          {/* Introduction link */}
          <ul className="space-y-0.5">
            <li>
              <a
                href={`#${introLink.id}`}
                onClick={() => setOpen(false)}
                className={`
                  block px-2.5 py-1.5 text-[13px] rounded-md transition-all duration-150
                  ${
                    active === introLink.id
                      ? "border-l-2 border-[var(--accent)] text-[var(--accent)] font-semibold bg-[var(--accent-soft)] ml-px"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)] border-l-2 border-transparent ml-px"
                  }
                `}
              >
                {introLink.label}
              </a>
            </li>
          </ul>

          {/* Separator */}
          <div className="my-3 mx-2.5 border-t border-[var(--border)]" />

          {/* Resource links */}
          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] mb-2 px-2.5">
            Resources
          </h3>
          <ul className="space-y-0.5">
            {resourceLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={() => setOpen(false)}
                  className={`
                    block px-2.5 py-1.5 text-[13px] rounded-md transition-all duration-150
                    ${
                      active === link.id
                        ? "border-l-2 border-[var(--accent)] text-[var(--accent)] font-semibold bg-[var(--accent-soft)] ml-px"
                        : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)] border-l-2 border-transparent ml-px"
                    }
                  `}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
