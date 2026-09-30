import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EndpointDoc } from "@/components/endpoint-doc";
import { MethodTag } from "@/components/method-tag";
import { TryIt } from "@/components/try-it/try-it";
import { endpointHref, endpoints, findEndpoint } from "@/lib/api-data";

export const dynamicParams = false;

type Params = Promise<{ group: string; endpoint: string }>;

export function generateStaticParams() {
  return endpoints.map((e) => ({ group: e.group.id, endpoint: e.endpoint.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { group, endpoint } = await params;
  const found = findEndpoint(group, endpoint);
  if (!found) return {};
  const e = found.endpoint;
  return {
    title: `${e.title} (${e.methods[0]} ${e.path})`,
    description: e.summary,
  };
}

function Neighbour({
  entry,
  label,
  align,
}: {
  entry: NonNullable<ReturnType<typeof findEndpoint>>["previous"];
  label: string;
  align: "left" | "right";
}) {
  if (!entry) return <span />;
  return (
    <Link
      href={endpointHref(entry.group.id, entry.endpoint.slug)}
      className={`rounded-lg border border-[var(--border)] px-4 py-3 hover:bg-[var(--accent-soft)] transition-colors ${
        align === "right" ? "text-right" : ""
      }`}
    >
      <span className="block text-xs text-[var(--text-muted)]">
        {label} · {entry.group.title}
      </span>
      <span
        className={`mt-1 flex items-center gap-2 text-[var(--text)] ${align === "right" ? "justify-end" : ""}`}
      >
        <MethodTag method={entry.endpoint.methods[0]} />
        <span className="truncate">{entry.endpoint.title}</span>
      </span>
    </Link>
  );
}

export default async function EndpointPage({ params }: { params: Params }) {
  const { group: groupId, endpoint: slug } = await params;
  const found = findEndpoint(groupId, slug);
  if (!found) notFound();
  const { group, endpoint, previous, next } = found;

  return (
    <div>
      <p className="text-xs text-[var(--text-muted)] mb-4">
        <Link href="/docs" className="hover:text-[var(--text)]">
          Docs
        </Link>
        <span className="mx-1.5">/</span>
        {group.category.title}
        <span className="mx-1.5">/</span>
        <Link href={`/docs/${group.id}`} className="hover:text-[var(--text)]">
          {group.title}
        </Link>
      </p>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(380px,440px)] items-start">
        <article className="min-w-0">
          <EndpointDoc endpoint={endpoint} />
        </article>
        <aside
          aria-label="Try it"
          className="xl:sticky xl:top-[4.5rem] xl:max-h-[calc(100vh-5.5rem)] xl:overflow-y-auto rounded-lg"
        >
          <TryIt key={endpoint.anchor} endpoint={endpoint} groupId={group.id} />
        </aside>
      </div>

      <nav aria-label="Other endpoints" className="mt-14 grid grid-cols-2 gap-3 text-sm">
        <Neighbour entry={previous} label="Previous" align="left" />
        <Neighbour entry={next} label="Next" align="right" />
      </nav>
    </div>
  );
}
