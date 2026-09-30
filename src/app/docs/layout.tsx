import { DocsSidebar, type NavSection, type SearchEntry } from "@/components/docs-sidebar";
import { HashOpener } from "@/components/hash-opener";
import { categories, graphql, groups } from "@/lib/api-data";

const nav: NavSection[] = [
  { title: "Overview", items: [{ href: "/docs", label: "Introduction" }] },
  ...categories.map((c) => ({
    title: c.title,
    items: c.groups.map((g) => ({
      href: `/docs/${g.id}`,
      label: g.title,
      count: g.endpoints.length,
    })),
  })),
  {
    title: "Reference",
    items: [
      { href: "/docs/graphql", label: "GraphQL", count: graphql.operations.length },
      { href: "/docs/models", label: "Data models" },
    ],
  },
];

const search: SearchEntry[] = groups.flatMap((g) =>
  g.endpoints.map((e) => ({
    href: `/docs/${g.id}#${e.anchor}`,
    method: e.methods[0],
    path: e.path,
    summary: e.summary,
    group: g.title,
  }))
);

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <DocsSidebar nav={nav} search={search} />
      <HashOpener />
      <div className="flex-1 min-w-0 lg:ml-64">
        <div className="max-w-4xl mx-auto px-5 py-12 sm:py-14">{children}</div>
      </div>
    </div>
  );
}
