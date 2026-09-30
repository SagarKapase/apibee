import Link from "next/link";
import { MethodTag } from "./method-tag";
import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";
import { InlineText } from "./inline-text";
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

function codeTone(code: string) {
  const n = Number(code);
  if (n >= 500) return "text-red-600 dark:text-red-400";
  if (n >= 400) return "text-amber-700 dark:text-amber-400";
  if (n >= 300) return "text-sky-600 dark:text-sky-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold tracking-tight text-[var(--text)] mb-3">{children}</h2>
  );
}

export function EndpointDoc({ endpoint }: { endpoint: Endpoint }) {
  const { exampleRequest, exampleResponse, requestBody } = endpoint;
  const url = fullUrl(endpoint.path);
  const origin = url.slice(0, url.length - endpoint.path.length);
  const summaryDiffers = endpoint.summary.replace(/\.$/, "") !== endpoint.title;
  const body = requestBody ? parseContentTypes(requestBody.contentTypes ?? "") : null;
  const responseText = [
    ...exampleResponse.headers.map(([k, v]) => `${k}: ${v}`),
    ...(exampleResponse.headers.length && exampleResponse.body ? [""] : []),
    exampleResponse.body,
  ].join("\n");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">
          {endpoint.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
          <span className="flex gap-1 shrink-0">
            {endpoint.methods.map((m) => (
              <MethodTag key={m} method={m} />
            ))}
          </span>
          <code className="flex-1 min-w-0 font-mono text-[13px] break-all">
            <span className="text-[var(--text-muted)]">{origin}</span>
            <span className="text-[var(--text)]">{endpoint.path}</span>
          </code>
          <CopyButton text={url} label={`URL ${url}`} hideLabel className="shrink-0" />
        </div>

        <div className="mt-5 space-y-3 text-[15px] leading-relaxed text-[var(--text-muted)]">
          {summaryDiffers && (
            <p>
              <InlineText text={endpoint.summary} />
            </p>
          )}
          {endpoint.description &&
            endpoint.description
              .split("\n\n")
              .map((para, i) => (
                <p key={i}>
                  <InlineText text={para} />
                </p>
              ))}
        </div>

        {endpoint.auth && (
          <p className="mt-4 inline-flex items-start gap-2 rounded-md border border-[var(--border)] px-3 py-1.5 text-[13px] text-[var(--text)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-[3px] shrink-0 text-[var(--text-muted)]">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <span>
              <InlineText text={endpoint.auth} />
            </span>
          </p>
        )}
      </div>

      {endpoint.params.length > 0 && (
        <section>
          <Heading>
            Parameters{" "}
            <span className="text-xs font-normal font-mono text-[var(--text-muted)]">
              {endpoint.params.length}
            </span>
          </Heading>
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[var(--surface)] border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                  <th className="py-2 px-3 font-medium">Name</th>
                  <th className="py-2 px-3 font-medium">Type</th>
                  <th className="py-2 px-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.params.map((p) => (
                  <tr key={`${p.in}-${p.name}`} className="border-b border-[var(--border)] last:border-b-0 align-top">
                    <td className="py-2 px-3 whitespace-nowrap">
                      <code className="font-mono text-[var(--text)]">{p.name}</code>
                      {p.required && <span className="ml-2 text-[11px] text-[var(--accent)]">required</span>}
                    </td>
                    <td className="py-2 px-3 text-[var(--text-muted)] whitespace-nowrap">
                      <span className="font-mono text-xs">{p.in}</span> · {p.type}
                    </td>
                    <td className="py-2 px-3 text-[var(--text-muted)]">
                      <InlineText text={p.description} />
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
        </section>
      )}

      {requestBody && body && (
        <section>
          <Heading>Request body</Heading>
          <p className="text-[13px] text-[var(--text-muted)] mb-3">
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
                <Link href={`/docs/models#${body.model.toLowerCase()}`} className="link-underline text-[var(--text)]">
                  {body.model}
                </Link>
              </>
            )}
            {requestBody.description && (
              <>
                . <InlineText text={requestBody.description} />
              </>
            )}
          </p>
          {requestBody.example && (
            <CodeBlock label="Example body" code={requestBody.example} lang={bodyLang(requestBody.example)} />
          )}
        </section>
      )}

      {endpoint.responses.length > 0 && (
        <section>
          <Heading>Responses</Heading>
          <dl className="rounded-lg border border-[var(--border)] divide-y divide-[var(--border)] text-[13px]">
            {endpoint.responses.map((r) => (
              <div key={r.code} className="flex gap-4 px-3 py-2">
                <dt className={`w-10 shrink-0 font-mono font-medium ${codeTone(r.code)}`}>{r.code}</dt>
                <dd className="text-[var(--text-muted)]">
                  <InlineText text={r.description} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section>
        <Heading>Example</Heading>
        <div className="space-y-3">
          <CodeBlock label="Request" code={withHost(exampleRequest.curl)} lang="curl" />
          <CodeBlock
            label="Response"
            meta={
              exampleResponse.status && (
                <span className={`font-mono ${statusTone(exampleResponse.status)}`}>{exampleResponse.status}</span>
              )
            }
            code={withHost(responseText) || "(empty body)"}
            lang={bodyLang(exampleResponse.body)}
          />
        </div>
      </section>
    </div>
  );
}
