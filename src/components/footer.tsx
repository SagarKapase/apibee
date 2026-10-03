import Link from "next/link";
import { LogoMark } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-auto">
      <div className="max-w-5xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
        <p className="flex items-center gap-2">
          <LogoMark className="h-4 w-auto text-[var(--text)]" />
          &copy; {new Date().getFullYear()} testingapis.com
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/docs"
            className="hover:text-[var(--text)] transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/tools"
            className="hover:text-[var(--text)] transition-colors"
          >
            Tools
          </Link>
          <Link
            href="/learn"
            className="hover:text-[var(--text)] transition-colors"
          >
            Learn
          </Link>
          <Link
            href="/about"
            className="hover:text-[var(--text)] transition-colors"
          >
            About
          </Link>
          <Link
            href="/support"
            className="hover:text-[var(--text)] transition-colors"
          >
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
