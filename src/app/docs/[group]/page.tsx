import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EndpointEntry } from "@/components/endpoint-entry";
import { findGroup, groups } from "@/lib/api-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return groups.map((g) => ({ group: g.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>;
}): Promise<Metadata> {
  const { group: id } = await params;
  const found = findGroup(id);
  if (!found) return {};
  return {
    title: `${found.group.title} API`,
    description: found.group.description,
  };
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group: id } = await params;
  const found = findGroup(id);
  if (!found) notFound();
  const { group, previous, next } = found;

  return (
    <article>
      <p className="text-xs text-[var(--text-muted)] mb-3">
        <Link href="/docs" className="hover:text-[var(--text)]">
          Docs
        </Link>
        <span className="mx-1.5">/</span>
        {group.category.title}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">
        {group.title}
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--text-muted)] leading-relaxed">
        {group.description}
      </p>
      <p className="mt-2 text-xs font-mono text-[var(--text-muted)]">
        {group.endpoints.length}{" "}
        {group.endpoints.length === 1 ? "endpoint" : "endpoints"}
      </p>

      <div className="mt-8 border-t border-[var(--border)]">
        {group.endpoints.map((endpoint) => (
          <EndpointEntry key={endpoint.anchor} endpoint={endpoint} />
        ))}
      </div>

      <nav
        aria-label="Other groups"
        className="mt-12 grid grid-cols-2 gap-3 text-sm"
      >
        {previous ? (
          <Link
            href={`/docs/${previous.id}`}
            className="rounded-lg border border-[var(--border)] px-4 py-3 hover:bg-[var(--accent-soft)] transition-colors"
          >
            <span className="block text-xs text-[var(--text-muted)]">Previous</span>
            <span className="text-[var(--text)]">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/docs/${next.id}`}
            className="rounded-lg border border-[var(--border)] px-4 py-3 text-right hover:bg-[var(--accent-soft)] transition-colors"
          >
            <span className="block text-xs text-[var(--text-muted)]">Next</span>
            <span className="text-[var(--text)]">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
