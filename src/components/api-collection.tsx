import Link from "next/link";
import { Icon, type IconName } from "@/components/icon";
import { categories, endpointCount, groups } from "@/lib/api-data";

type Accent = "green" | "blue" | "purple" | "red" | "amber" | "neutral";

// Accent colors are kept to the icon tile, the count badge and the link.
const accents: Record<Accent, { tile: string; badge: string; link: string }> = {
  green: {
    tile: "border-emerald-600/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:text-emerald-400",
    badge: "border-emerald-600/25 text-emerald-700 dark:border-emerald-400/25 dark:text-emerald-400",
    link: "text-emerald-700 dark:text-emerald-400",
  },
  blue: {
    tile: "border-sky-600/25 bg-sky-500/10 text-sky-700 dark:border-sky-400/30 dark:text-sky-400",
    badge: "border-sky-600/25 text-sky-700 dark:border-sky-400/25 dark:text-sky-400",
    link: "text-sky-700 dark:text-sky-400",
  },
  purple: {
    tile: "border-violet-600/25 bg-violet-500/10 text-violet-700 dark:border-violet-400/30 dark:text-violet-400",
    badge: "border-violet-600/25 text-violet-700 dark:border-violet-400/25 dark:text-violet-400",
    link: "text-violet-700 dark:text-violet-400",
  },
  red: {
    tile: "border-rose-600/25 bg-rose-500/10 text-rose-700 dark:border-rose-400/30 dark:text-rose-400",
    badge: "border-rose-600/25 text-rose-700 dark:border-rose-400/25 dark:text-rose-400",
    link: "text-rose-700 dark:text-rose-400",
  },
  amber: {
    tile: "border-amber-600/25 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:text-amber-400",
    badge: "border-amber-600/25 text-amber-700 dark:border-amber-400/25 dark:text-amber-400",
    link: "text-amber-700 dark:text-amber-400",
  },
  neutral: {
    tile: "border-[var(--border)] bg-[var(--accent-soft)] text-[var(--text-muted)]",
    badge: "border-[var(--border)] text-[var(--text-muted)]",
    link: "text-[var(--text)]",
  },
};

// Presentation for each category in api-catalog.json. The groups and counts come from the catalog.
const presentation: Record<string, { icon: IconName; accent: Accent; description: string }> = {
  "start-here": {
    icon: "compass",
    accent: "green",
    description: "A live catalog of every endpoint, plus health checks.",
  },
  "http-basics": {
    icon: "code",
    accent: "blue",
    description: "Methods, status codes, redirects, cookies, caching and request bodies.",
  },
  "formats-and-data": {
    icon: "database",
    accent: "purple",
    description: "Common content types, file downloads, JSON edge cases and utilities.",
  },
  "auth-and-security": {
    icon: "lock",
    accent: "red",
    description: "Auth schemes, OAuth 2.0, JWT, rate limiting and payments.",
  },
  "api-patterns": {
    icon: "workflow",
    accent: "amber",
    description: "Streaming, WebSockets, async jobs, pagination, failure injection and more.",
  },
  resources: {
    icon: "box",
    accent: "purple",
    description: "Realistic data sets such as products, posts, books and countries.",
  },
  original: {
    icon: "archive",
    accent: "neutral",
    description: "The first version of the API: users in JSON and XML, uploads and auth tests.",
  },
};

const fallback = { icon: "box" as IconName, accent: "neutral" as Accent, description: "" };

// Long lists are split into two columns so one card does not tower over the rest.
const TWO_COLUMN_MIN = 11;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function ApiCollection() {
  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            API collection
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold leading-none tracking-[-0.03em] text-[var(--text)]">
            What&apos;s <span className="text-[var(--accent)]">included</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
            {groups.length} groups of endpoints in {categories.length} categories. Each group links to
            its reference, with example requests and responses.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 self-start sm:self-auto rounded-[10px] border border-amber-600/30 dark:border-amber-400/30 bg-[var(--surface)] px-4 py-3">
          <Icon name="layers" size={20} className="text-[var(--accent)]" />
          <p>
            <span className="block text-lg font-semibold leading-none tabular-nums text-[var(--text)]">
              {endpointCount}
            </span>
            <span className="block mt-1 text-[11px] text-[var(--text-muted)]">endpoints</span>
          </p>
        </div>
      </div>

      {/* Columns rather than a grid, so short cards stack under each other instead of leaving gaps. */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-3.5">
        {categories.map((c) => {
          const { icon, accent, description } = presentation[c.id] ?? fallback;
          const tone = accents[accent];
          const total = c.groups.reduce((n, g) => n + g.endpoints.length, 0);
          const twoColumns = c.groups.length >= TWO_COLUMN_MIN;
          return (
            <article
              key={c.id}
              aria-labelledby={`collection-${c.id}`}
              className="break-inside-avoid mb-3.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-stone-300 dark:hover:border-stone-700"
            >
              <header className="flex items-start gap-3 px-4 pt-4 pb-3">
                <span
                  aria-hidden="true"
                  className={`grid place-items-center size-9 shrink-0 rounded-lg border ${tone.tile}`}
                >
                  <Icon name={icon} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 id={`collection-${c.id}`} className="text-sm font-semibold text-[var(--text)]">
                      {c.title}
                    </h3>
                    <span className={`shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[10px] ${tone.badge}`}>
                      {plural(total, "endpoint")}
                    </span>
                  </div>
                  {description && (
                    <p className="mt-1 text-xs leading-snug text-[var(--text-muted)]">{description}</p>
                  )}
                </div>
              </header>

              <ul className={`px-4 ${twoColumns ? "columns-2 gap-x-5" : ""} ${c.groups.length > 1 ? "" : "pb-2"}`}>
                {c.groups.map((g) => (
                  <li key={g.id} className="break-inside-avoid border-t border-[var(--border)]">
                    <Link
                      href={`/docs/${g.id}`}
                      className="group flex min-h-8 items-center justify-between gap-3 text-[13px] text-[var(--text)]"
                    >
                      <span className="truncate underline-offset-[3px] decoration-[var(--text-muted)] group-hover:underline">
                        {g.title}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-[var(--text-muted)]">
                        {g.endpoints.length}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {c.groups.length > 1 && (
                <footer className="border-t border-[var(--border)] px-4 py-2.5">
                  <Link
                    href={`/docs#${c.id}`}
                    aria-label={`View all ${c.title} groups`}
                    className={`inline-flex items-center gap-1 text-xs font-medium underline-offset-[3px] hover:underline ${tone.link}`}
                  >
                    View all
                    <Icon name="arrowRight" size={12} />
                  </Link>
                </footer>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
