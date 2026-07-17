import type { Endpoint, Method } from "@/lib/api-data";
import { MethodTag } from "./method-tag";
import { CopyButton } from "./copy-button";
import { BASE_URL } from "@/lib/api-data";

const borderColors: Record<Method, string> = {
  GET: "border-l-emerald-500",
  POST: "border-l-blue-500",
  PUT: "border-l-amber-500",
  DELETE: "border-l-red-500",
};

function detectLang(text: string): string {
  return text.trimStart().startsWith("<") ? "xml" : "json";
}

export function EndpointBlock({ endpoint }: { endpoint: Endpoint }) {
  const curlCmd = buildCurl(endpoint);
  const borderColor = borderColors[endpoint.method];

  return (
    <div className="py-7 border-b border-[var(--border)] last:border-b-0">
      {/* Method + Path */}
      <div
        className={`flex items-center gap-2.5 flex-wrap border-l-[3px] ${borderColor} pl-3 -ml-px`}
      >
        <MethodTag method={endpoint.method} />
        <code className="text-sm font-mono text-[var(--text)] break-all">
          {endpoint.path}
        </code>
      </div>

      <p className="mt-2.5 text-sm text-[var(--text-muted)] leading-relaxed pl-3">
        {endpoint.description}
      </p>

      {/* Parameters */}
      {endpoint.params && endpoint.params.length > 0 && (
        <div className="mt-5 pl-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-2">
            Parameters
          </h4>
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--accent-soft)]">
                  <th className="text-left py-2 px-3 font-semibold text-[var(--text-muted)] text-xs">
                    Name
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-[var(--text-muted)] text-xs">
                    Type
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-[var(--text-muted)] text-xs">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {endpoint.params.map((p) => (
                  <tr
                    key={p.name}
                    className="border-b border-[var(--border)] last:border-b-0"
                  >
                    <td className="py-2 px-3 font-mono text-sm text-[var(--accent)]">
                      {p.name}
                    </td>
                    <td className="py-2 px-3 text-[var(--text-muted)] text-xs">
                      {p.type}
                    </td>
                    <td className="py-2 px-3 text-[var(--text-muted)]">
                      {p.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request body */}
      {endpoint.requestBody && (
        <div className="mt-5 pl-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
              Request Body
              <span className="ml-2 text-[var(--accent)] font-mono normal-case tracking-normal">
                {detectLang(endpoint.requestBody)}
              </span>
            </h4>
            <CopyButton
              text={endpoint.requestBody}
              className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            />
          </div>
          <div className="rounded-lg bg-[var(--code-bg)] border border-[var(--border)] overflow-x-auto">
            <pre className="p-4 text-[13px] leading-[1.7]">
              <code className="text-[var(--code-fg)] font-mono">
                {endpoint.requestBody}
              </code>
            </pre>
          </div>
        </div>
      )}

      {/* Response */}
      <div className="mt-5 pl-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Response
            <span className="ml-2 text-emerald-500 font-mono normal-case tracking-normal text-[11px]">
              200
            </span>
          </h4>
          <CopyButton
            text={endpoint.response}
            className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          />
        </div>
        <div className="rounded-lg bg-[var(--code-bg)] border border-[var(--border)] overflow-x-auto">
          <pre className="p-4 text-[13px] leading-[1.7]">
            <code className="text-[var(--code-accent)] font-mono">
              {endpoint.response}
            </code>
          </pre>
        </div>
      </div>

      {/* cURL */}
      <div className="mt-4 pl-3">
        <CopyButton
          text={curlCmd}
          label="Copy as cURL"
          className="text-xs font-medium text-[var(--accent)] border border-[var(--accent)]/30 rounded-md px-3 py-1.5 hover:bg-[var(--accent-soft)] transition-all"
        />
      </div>
    </div>
  );
}

function buildCurl(ep: Endpoint): string {
  const url = `${BASE_URL}${ep.path}`;
  if (ep.method === "GET") return `curl ${url}`;
  if (ep.method === "DELETE") return `curl -X DELETE ${url}`;
  const contentType = ep.requestBody?.trimStart().startsWith("<")
    ? "application/xml"
    : "application/json";
  const body = ep.requestBody
    ? ` \\\n  -H "Content-Type: ${contentType}" \\\n  -d '${ep.requestBody.replace(/\n/g, "").replace(/\s+/g, " ")}'`
    : "";
  return `curl -X ${ep.method} ${url}${body}`;
}
