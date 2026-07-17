import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-auto">
      <div className="max-w-5xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
        <p>
          &copy; {new Date().getFullYear()} APIBee.io
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/docs"
            className="hover:text-[var(--text)] transition-colors"
          >
            Docs
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text)] transition-colors"
          >
            GitHub
          </a>
          <a
            href="mailto:contact@apibee.io"
            className="hover:text-[var(--text)] transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
