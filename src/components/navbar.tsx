"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";

const navLinks = [
  { href: "/docs", label: "Docs" },
  { href: "/tools", label: "Tools" },
  { href: "https://github.com", label: "GitHub", external: true },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleEnter = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const nav = navRef.current;
      if (!nav) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      setPill({
        left: rect.left - navRect.left,
        width: rect.width,
        opacity: 1,
      });
    },
    []
  );

  const handleLeave = useCallback(() => {
    setPill((p) => ({ ...p, opacity: 0 }));
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-[var(--border)] shadow-[0_1px_8px_-3px_var(--ring)]"
          : "border-b border-transparent"
      }`}
      style={{
        background: scrolled
          ? "color-mix(in srgb, var(--surface) 85%, transparent)"
          : "color-mix(in srgb, var(--bg) 60%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: mounted ? "navReveal 0.5s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}
    >
      <nav
        ref={navRef}
        className="max-w-5xl mx-auto flex items-center justify-between px-5 transition-all duration-500 relative"
        style={{ height: scrolled ? 52 : 60 }}
      >
        {/* Sliding hover pill */}
        <div
          className="absolute rounded-lg pointer-events-none transition-all duration-200"
          style={{
            left: pill.left,
            width: pill.width,
            height: 32,
            top: "50%",
            transform: "translateY(-50%)",
            opacity: pill.opacity,
            background: "var(--accent-soft)",
          }}
        />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt=""
            width={28}
            height={28}
            aria-hidden="true"
            className={`transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:drop-shadow-[0_0_10px_var(--ring)] ${
              scrolled ? "w-6 h-6" : "w-7 h-7"
            }`}
          />
          <span
            className={`font-semibold tracking-tight text-[var(--text)] transition-all duration-500 ${
              scrolled ? "text-sm" : "text-base"
            }`}
          >
            API<span className="text-[var(--accent)]">Bee</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-0.5 relative z-10">
          {navLinks.map((link) => {
            const isActive = !link.external && pathname === link.href;
            const Tag = link.external ? "a" : Link;
            const extraProps = link.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {};

            return (
              <Tag
                key={link.href}
                href={link.href}
                {...(extraProps as Record<string, string>)}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {link.label === "GitHub" && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="hidden sm:block"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                )}
                {link.label}
                {/* Active dot */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)]" />
                )}
              </Tag>
            );
          })}

          {/* Divider */}
          <div className="w-px h-4 bg-[var(--border)] mx-1.5" />

          {/* Theme toggle */}
          <button
            onClick={toggle}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200 cursor-pointer relative"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {/* Sun */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`absolute transition-all duration-500 ${
                theme === "dark"
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-90 scale-0"
              }`}
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            {/* Moon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-all duration-500 ${
                theme === "light"
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 rotate-90 scale-0"
              }`}
              aria-hidden="true"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
