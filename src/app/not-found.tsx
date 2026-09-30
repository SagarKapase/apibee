import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center px-5 py-24">
      <div className="max-w-5xl w-full mx-auto">
        <p className="text-sm font-mono text-[var(--text-muted)] mb-3">404</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)] mb-3">
          Page not found
        </h1>
        <p className="max-w-md text-[var(--text-muted)] mb-8">
          The page you requested does not exist. Check the URL, or go to one
          of the pages below.
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="btn-press inline-flex items-center justify-center h-10 px-4 rounded-md bg-[var(--btn-bg)] text-[var(--btn-fg)] text-sm font-medium hover:bg-[var(--btn-hover)]"
          >
            Home
          </Link>
          <Link
            href="/docs"
            className="btn-press inline-flex items-center justify-center h-10 px-4 rounded-md border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-[var(--accent-soft)]"
          >
            API reference
          </Link>
        </div>
      </div>
    </div>
  );
}
