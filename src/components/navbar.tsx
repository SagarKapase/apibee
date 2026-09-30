"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";

const navLinks = [
  { href: "/docs", label: "Docs" },
  { href: "/tools", label: "Tools" },
];

function Logo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <polygon points="16,6 24,11 24,21 16,26 8,21 8,11" fill="#F59E0B" />
      <polyline
        points="6,11 1,16 6,21"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="26,11 31,16 26,21"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Navbar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-[var(--border)] bg-[var(--bg)]">
      <nav className="max-w-5xl h-full mx-auto flex items-center justify-between px-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--text)]"
        >
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight">
            APIBee
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isActive
                    ? "text-[var(--text)] font-medium"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm rounded-md text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            GitHub
          </a>

          <div className="w-px h-4 bg-[var(--border)] mx-2" />

          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)] transition-colors cursor-pointer"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
