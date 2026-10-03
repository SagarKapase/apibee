// The heading block shared by the content pages: monospace eyebrow, title, intro.
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: React.ReactNode;
  title: string;
  /** Intro paragraphs under the title. */
  children?: React.ReactNode;
}) {
  return (
    <header>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[var(--text)]">
        {title}
      </h1>
      {children && (
        <div className="mt-4 space-y-4 text-[15px] leading-7 text-[var(--text-muted)]">{children}</div>
      )}
    </header>
  );
}

/** A section heading followed by a hairline that runs to an optional count on the right. */
export function SectionTitle({
  id,
  title,
  meta,
  description,
}: {
  id?: string;
  title: string;
  meta?: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-4">
        <h2 id={id} className="shrink-0 text-lg font-semibold tracking-tight text-[var(--text)]">
          {title}
        </h2>
        <span aria-hidden="true" className="h-px flex-1 bg-[var(--border)]" />
        {meta && <span className="shrink-0 font-mono text-xs text-[var(--text-muted)]">{meta}</span>}
      </div>
      {description && <p className="mt-1 text-[13px] text-[var(--text-muted)]">{description}</p>}
    </div>
  );
}
