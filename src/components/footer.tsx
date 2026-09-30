import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-auto">
      <div className="max-w-5xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
        <p>
          &copy; {new Date().getFullYear()} snap-test.in
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
          <a
            href="mailto:contact@snap-test.in"
            className="hover:text-[var(--text)] transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
