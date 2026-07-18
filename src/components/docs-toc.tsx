"use client";

import { useState, useEffect, useRef } from "react";
import { resources } from "@/lib/api-data";

const tocItems = [
  { id: "introduction", label: "Introduction" },
  { id: "quick-start", label: "Quick Start" },
  { id: "authentication", label: "Authentication" },
  { id: "error-handling", label: "Error Handling" },
  ...resources.map((r) => ({ id: r.id, label: r.title })),
];

export function DocsToc() {
  const [active, setActive] = useState("introduction");
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
    const link = nav.querySelector(
      `a[href="#${active}"]`
    ) as HTMLElement | null;
    if (link) {
      const navRect = nav.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      if (linkRect.top < navRect.top || linkRect.bottom > navRect.bottom) {
        link.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [active]);

  return (
    <aside className="hidden xl:block fixed top-14 right-0 w-52 h-[calc(100vh-3.5rem)] overflow-y-auto">
      <nav ref={navRef} className="py-8 px-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
          On this page
        </h3>
        <ul className="space-y-0.5">
          {tocItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`
                  block py-1 text-[12px] border-l-2 pl-3 transition-all duration-150
                  ${
                    active === item.id
                      ? "border-[var(--accent)] text-[var(--accent)] font-medium"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)]"
                  }
                `}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
