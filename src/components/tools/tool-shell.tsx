import Link from "next/link";

export function ToolShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-5xl mx-auto px-5 py-10 sm:py-14">
      {/* Back link */}
      <Link
        href="/tools"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-6"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        All Tools
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)] mb-2">
        {title}
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-8 max-w-lg">
        {description}
      </p>

      {children}
    </div>
  );
}

export function ToolPanel({
  label,
  actions,
  children,
  dark = false,
}: {
  label: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--border)] overflow-hidden ${
        dark ? "terminal-glow" : ""
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] ${
          dark ? "bg-[#1a1a22] border-white/[0.06]" : "bg-[var(--surface)]"
        }`}
      >
        <span
          className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
            dark ? "text-[#a8a29e]" : "text-[var(--text-muted)]"
          }`}
        >
          {label}
        </span>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      {children}
    </div>
  );
}
