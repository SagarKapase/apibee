import {
  DocsSidebar,
  type NavCategory,
  type NavLink,
  type SearchEntry,
} from "@/components/docs-sidebar";
import { categories, endpointHref, graphql, groups } from "@/lib/api-data";

const overview: NavLink[] = [{ href: "/docs", label: "Introduction" }];

const reference: NavLink[] = [
  { href: "/docs/graphql", label: "GraphQL", count: graphql.operations.length },
  { href: "/docs/models", label: "Data models" },
];

const navCategories: NavCategory[] = categories.map((c) => ({
  title: c.title,
  groups: c.groups.map((g) => ({
    id: g.id,
    title: g.title,
    href: `/docs/${g.id}`,
    endpoints: g.endpoints.map((e) => ({
      href: endpointHref(g.id, e.slug),
      title: e.title,
      method: e.methods[0],
    })),
  })),
}));

const search: SearchEntry[] = groups.flatMap((g) =>
  g.endpoints.map((e) => ({
    href: endpointHref(g.id, e.slug),
    method: e.methods[0],
    path: e.path,
    summary: e.summary,
    group: g.title,
  }))
);

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <DocsSidebar
        overview={overview}
        categories={navCategories}
        reference={reference}
        search={search}
      />
      <div className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 sm:py-12">{children}</div>
      </div>
    </div>
  );
}
