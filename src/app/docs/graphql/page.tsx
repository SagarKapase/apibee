import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { MethodTag } from "@/components/method-tag";
import { BASE_URL, withHost } from "@/lib/api-config";
import { graphql, type GraphQLOperation } from "@/lib/api-data";

export const metadata: Metadata = {
  title: "GraphQL",
  description: "GraphQL queries and mutations available at /graphql.",
};

const example = graphql.intro.find((i) => i.code)?.text ?? "";

function Operation({ op }: { op: GraphQLOperation }) {
  return (
    <section id={op.name} className="py-6 border-b border-[var(--border)]">
      <h3 className="font-mono text-[15px] text-[var(--text)]">{op.name}</h3>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Returns <code className="font-mono text-[12px] text-[var(--text)]">{op.returns}</code>
        {op.arguments && op.arguments !== "none" && (
          <>
            . Arguments:{" "}
            <code className="font-mono text-[12px] text-[var(--text)]">{op.arguments}</code>
          </>
        )}
        .
      </p>
      <div className="mt-4 grid gap-3 lg:grid-cols-2 items-start">
        <CodeBlock label={op.kind === "query" ? "Query" : "Mutation"} code={op.example} lang="graphql" />
        <CodeBlock label="Response" code={op.response} lang="json" />
      </div>
    </section>
  );
}

export default function GraphQLPage() {
  const queries = graphql.operations.filter((o) => o.kind === "query");
  const mutations = graphql.operations.filter((o) => o.kind === "mutation");

  return (
    <article>
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">
        GraphQL
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--text-muted)] leading-relaxed">
        Send <code className="font-mono text-[13px] text-[var(--text)]">POST {BASE_URL}/graphql</code>{" "}
        with <code className="font-mono text-[13px] text-[var(--text)]">Content-Type: application/json</code>{" "}
        and a body of <code className="font-mono text-[13px] text-[var(--text)]">{"{ query, variables }"}</code>.
        Opening <code className="font-mono text-[13px] text-[var(--text)]">/graphql</code> in a
        browser shows a GraphQL IDE. Schema introspection is turned off in
        production, so use the operations listed here.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
        <MethodTag method="POST" />
        <code className="flex-1 min-w-0 font-mono text-[13px] text-[var(--text)] break-all select-all">
          {BASE_URL}/graphql
        </code>
        <CopyButton text={`${BASE_URL}/graphql`} label="GraphQL URL" hideLabel className="shrink-0" />
      </div>

      {example && (
        <div className="mt-3">
          <CodeBlock label="Request" code={withHost(example)} lang="curl" />
        </div>
      )}

      <h2 className="mt-12 text-xl font-semibold tracking-tight text-[var(--text)]">
        Queries
      </h2>
      <div className="border-t border-[var(--border)] mt-4">
        {queries.map((op) => (
          <Operation key={op.name} op={op} />
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight text-[var(--text)]">
        Mutations
      </h2>
      <div className="border-t border-[var(--border)] mt-4">
        {mutations.map((op) => (
          <Operation key={op.name} op={op} />
        ))}
      </div>

      {graphql.types.length > 0 && (
        <>
          <h2 className="mt-12 text-xl font-semibold tracking-tight text-[var(--text)]">
            Types
          </h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[var(--surface)] border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                  <th className="py-2 px-3 font-medium">Type</th>
                  <th className="py-2 px-3 font-medium">Fields</th>
                </tr>
              </thead>
              <tbody>
                {graphql.types.map((t) => (
                  <tr key={t.name} className="border-b border-[var(--border)] last:border-b-0 align-top">
                    <td className="py-2 px-3 font-mono text-[var(--text)]">{t.name}</td>
                    <td className="py-2 px-3 font-mono text-[12px] text-[var(--text-muted)]">{t.fields}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </article>
  );
}
