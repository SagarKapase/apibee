import Link from "next/link";
import { MethodTag } from "./method-tag";
import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";
import { bodyLang, fullUrl, withHost, type Endpoint } from "@/lib/api-config";

/** "application/json (model: Product); text/xml (model: Product)" -> parts */
function parseContentTypes(value: string) {
  const types: string[] = [];
  let model: string | undefined;
  for (const part of value.split(";")) {
    const m = part.trim().match(/^([^\s(]+)(?:\s*\((?:model:\s*(\w+)|[^)]*)\))?/);
    if (!m) continue;
    if (!types.includes(m[1])) types.push(m[1]);
    model ??= m[2];
  }
  return { types, model };
}

function statusTone(status: string) {
  const code = Number(status.slice(0, 3));
  if (code >= 200 && code < 300) return "text-emerald-400";
  if (code >= 300 && code < 400) return "text-sky-400";
  if (code >= 400) return "text-red-400";
  return "text-[#a8a29e]";
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-medium text-[var(--text)] mb-2">{children}</h4>
  );
}

export function EndpointEntry({ endpoint }: { endpoint: Endpoint }) {
  const { exampleRequest, exampleResponse, requestBody } = endpoint;
  const responseText = [
    ...exampleResponse.headers.map(([k, v]) => `${k}: ${v}`),
    ...(exampleResponse.headers.length && exampleResponse.body ? [""] : []),
    exampleResponse.body,
  ].join("\n");
  const body = requestBody ? parseContentTypes(requestBody.contentTypes ?? "") : null;
  const url = fullUrl(endpoint.path);
  const origin = url.slice(0, url.length - endpoint.path.length);
  const exampleUrl = exampleRequest.path ? fullUrl(exampleRequest.path) : url;

  return (
    <details
      id={endpoint.anchor}
      className="group/ep border-b border-[var(--border)]"
    >
      <summary className="flex items-start gap-3 py-3 cursor-pointer select-none">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          className="shrink-0 mt-[5px] text-[var(--text-muted)] transition-transform group-open/ep:rotate-90"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="flex gap-1 shrink-0">
              {endpoint.methods.map((m) => (
                <MethodTag key={m} method={m} />
              ))}
            </span>
            <code className="font-mono text-[13px] break-all">
              <span className="text-[var(--text-muted)]">{origin}</span>
              <span className="text-[var(--text)]">{endpoint.path}</span>
            </code>
            <CopyButton
              text={url}
              label={`URL ${url}`}
              hideLabel
              className="shrink-0"
            />
          </div>
          <p className="mt-1 text-[13px] text-[var(--text-muted)]">
            {endpoint.summary}
          </p>
        </div>
      </summary>

      <div className="pb-6 pl-6 space-y-5">
        {exampleUrl !== url && (
          <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
            <span className="text-xs text-[var(--text-muted)] shrink-0">Example</span>
            <MethodTag method={exampleRequest.method} />
            <code className="flex-1 min-w-0 font-mono text-[12.5px] text-[var(--text)] break-all select-all">
              {exampleUrl}
            </code>
            <CopyButton
              text={exampleUrl}
              label={`example URL ${exampleUrl}`}
              hideLabel
              className="shrink-0"
            />
          </div>
        )}

        {endpoint.description && (
          <div className="space-y-2 text-sm leading-relaxed text-[var(--text-muted)] max-w-3xl">
            {withHost(endpoint.description)
              .split("\n\n")
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </div>
        )}

        {endpoint.auth && (
          <p className="text-sm">
            <span className="font-medium text-[var(--text)]">Authentication: </span>
            <span className="text-[var(--text-muted)]">{endpoint.auth}</span>
          </p>
        )}

        {endpoint.params.length > 0 && (
          <div>
            <SectionTitle>Parameters</SectionTitle>
            <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-[var(--surface)] border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                    <th className="py-2 px-3 font-medium">Name</th>
                    <th className="py-2 px-3 font-medium">In</th>
                    <th className="py-2 px-3 font-medium">Type</th>
                    <th className="py-2 px-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.params.map((p) => (
                    <tr
                      key={`${p.in}-${p.name}`}
                      className="border-b border-[var(--border)] last:border-b-0 align-top"
                    >
                      <td className="py-2 px-3 whitespace-nowrap">
                        <code className="font-mono text-[var(--text)]">{p.name}</code>
                        {p.required && (
                          <span className="ml-2 text-[11px] text-[var(--accent)]">
                            required
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[var(--text-muted)]">{p.in}</td>
                      <td className="py-2 px-3 text-[var(--text-muted)] whitespace-nowrap">
                        {p.type}
                      </td>
                      <td className="py-2 px-3 text-[var(--text-muted)]">
                        {p.description}
                        {p.default && (
                          <span className="block text-xs mt-0.5">
                            Default: <code className="font-mono">{p.default}</code>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {requestBody && body && (
          <div>
            <SectionTitle>Request body</SectionTitle>
            <p className="text-[13px] text-[var(--text-muted)] mb-2">
              {requestBody.required ? "Required" : "Optional"}
              {body.types.length > 0 && (
                <>
                  {". "}
                  {body.types.map((t, i) => (
                    <span key={t}>
                      {i > 0 && ", "}
                      <code className="font-mono text-[12px]">{t}</code>
                    </span>
                  ))}
                </>
              )}
              {body.model && (
                <>
                  {". Model: "}
                  <Link
                    href={`/docs/models#${body.model.toLowerCase()}`}
                    className="link-underline text-[var(--text)]"
                  >
                    {body.model}
                  </Link>
                </>
              )}
              {requestBody.description && <>. {requestBody.description}</>}
            </p>
            {requestBody.example && (
              <CodeBlock
                label="Example body"
                code={requestBody.example}
                lang={bodyLang(requestBody.example)}
              />
            )}
          </div>
        )}

        {endpoint.responses.length > 0 && (
          <div>
            <SectionTitle>Responses</SectionTitle>
            <dl className="rounded-lg border border-[var(--border)] divide-y divide-[var(--border)] text-[13px]">
              {endpoint.responses.map((r) => (
                <div key={r.code} className="flex gap-4 px-3 py-2">
                  <dt className="w-10 shrink-0 font-mono text-[var(--text)]">{r.code}</dt>
                  <dd className="text-[var(--text-muted)]">{r.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="grid gap-3 lg:grid-cols-2 items-start">
          <CodeBlock
            label="Request"
            code={withHost(exampleRequest.curl)}
            lang="curl"
          />
          <CodeBlock
            label="Response"
            meta={
              exampleResponse.status && (
                <span className={`font-mono ${statusTone(exampleResponse.status)}`}>
                  {exampleResponse.status}
                </span>
              )
            }
            code={withHost(responseText) || "(empty body)"}
            lang={bodyLang(exampleResponse.body)}
          />
        </div>
      </div>
    </details>
  );
}
