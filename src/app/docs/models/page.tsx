import type { Metadata } from "next";
import { models } from "@/lib/api-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/docs/models",
  title: "Data models",
  description:
    "Every field of every request and response model in the testingapis.com fake REST API: names, types, which are required and what each one holds.",
});

export default function ModelsPage() {
  return (
    <article className="max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">
        Data models
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--text-muted)] leading-relaxed">
        The fields of each model used in request and response bodies.
      </p>

      <div className="mt-10 space-y-10">
        {models.map((model) => (
          <section key={model.name} id={model.name.toLowerCase()}>
            <h2 className="font-mono text-[15px] text-[var(--text)] mb-3">
              {model.name}
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-[var(--surface)] border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                    <th className="py-2 px-3 font-medium">Field</th>
                    <th className="py-2 px-3 font-medium">Type</th>
                    <th className="py-2 px-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {model.fields.map((f) => (
                    <tr
                      key={f.name}
                      className="border-b border-[var(--border)] last:border-b-0 align-top"
                    >
                      <td className="py-2 px-3 whitespace-nowrap">
                        <code className="font-mono text-[var(--text)]">{f.name}</code>
                        {f.required && (
                          <span className="ml-2 text-[11px] text-[var(--accent)]">
                            required
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[var(--text-muted)] whitespace-nowrap">
                        {f.type}
                      </td>
                      <td className="py-2 px-3 text-[var(--text-muted)]">
                        {f.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
