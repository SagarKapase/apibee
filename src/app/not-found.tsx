import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-5 py-20">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold font-mono text-[var(--accent)] mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
          Nothing here
        </h1>
        <p className="text-[var(--text-muted)] mb-8">
          The page you&apos;re looking for doesn&apos;t exist. Maybe the URL is
          wrong, or it was moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="btn-press inline-flex items-center justify-center h-10 px-5 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[var(--ring)]"
          >
            Go home
          </Link>
          <Link
            href="/tools"
            className="btn-press inline-flex items-center justify-center h-10 px-5 border border-[var(--border)] text-sm font-medium rounded-lg text-[var(--text)] hover:bg-[var(--accent-soft)]"
          >
            Browse tools
          </Link>
        </div>
      </div>
    </div>
  );
}
