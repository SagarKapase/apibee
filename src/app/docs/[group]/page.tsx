import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnchorRedirect } from "@/components/anchor-redirect";
import { InlineText } from "@/components/inline-text";
import { MethodTag } from "@/components/method-tag";
import { fullUrl } from "@/lib/api-config";
import { endpointHref, findGroup, groups } from "@/lib/api-data";
import { pageMetadata } from "@/lib/seo";

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
  return pageMetadata({
    path: `/docs/${found.group.id}`,
    title: `${found.group.title} API`,
    description: found.group.description,
  });
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
  const anchors = Object.fromEntries(
    group.endpoints.map((e) => [e.anchor, endpointHref(group.id, e.slug)])
  );

  return (
    <article className="max-w-4xl">
      <AnchorRedirect targets={anchors} />
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

      <ul className="mt-8 border-t border-[var(--border)]">
        {group.endpoints.map((e) => {
          const url = fullUrl(e.path);
          const origin = url.slice(0, url.length - e.path.length);
          return (
            <li key={e.slug} className="border-b border-[var(--border)]">
              <Link
                href={endpointHref(group.id, e.slug)}
                className="group block py-3.5 hover:bg-[var(--accent-soft)] -mx-3 px-3 rounded-md transition-colors"
              >
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="flex gap-1 shrink-0">
                    {e.methods.map((m) => (
                      <MethodTag key={m} method={m} />
                    ))}
                  </span>
                  <code className="font-mono text-[13px] break-all">
                    <span className="text-[var(--text-muted)]">{origin}</span>
                    <span className="text-[var(--text)]">{e.path}</span>
                  </code>
                </span>
                <span className="mt-1 block text-[13px] text-[var(--text-muted)] group-hover:text-[var(--text)]">
                  <InlineText text={e.summary} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <nav aria-label="Other groups" className="mt-12 grid grid-cols-2 gap-3 text-sm">
        {previous ? (
          <Link
            href={`/docs/${previous.id}`}
            className="rounded-lg border border-[var(--border)] px-4 py-3 hover:bg-[var(--accent-soft)] transition-colors"
          >
            <span className="block text-xs text-[var(--text-muted)]">Previous group</span>
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
            <span className="block text-xs text-[var(--text-muted)]">Next group</span>
            <span className="text-[var(--text)]">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
