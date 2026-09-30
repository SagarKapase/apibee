"use client";

import { useState } from "react";
import type { Endpoint, Method } from "@/lib/api-data";
import { MethodTag } from "./method-tag";
import { CopyButton } from "./copy-button";
import { Highlighted } from "@/lib/syntax";
import { BASE_URL } from "@/lib/api-data";

const borderColors: Record<Method, string> = {
  GET: "border-l-emerald-500",
  POST: "border-l-blue-500",
  PUT: "border-l-amber-500",
  DELETE: "border-l-red-500",
};

export function EndpointAccordion({ endpoint }: { endpoint: Endpoint }) {
  const [open, setOpen] = useState(false);
  const curlCmd = buildCurl(endpoint);
  const isXml =
    endpoint.response.trimStart().startsWith("<") ||
    (endpoint.requestBody?.trimStart().startsWith("<") ?? false);
  const lang = isXml ? ("xml" as const) : ("json" as const);

  return (
    <div
      className={`border border-[var(--border)] rounded-lg overflow-hidden
        transition-all duration-300
        ${open ? "border-[var(--text-muted)]/40" : "hover:border-[var(--text-muted)]/40"}
      `}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer
          transition-all duration-200
          border-l-[3px] ${borderColors[endpoint.method]}
          ${
            open
              ? "bg-[var(--accent-soft)]"
              : "bg-[var(--surface)] hover:bg-[var(--accent-soft)]"
          }
        `}
      >
        <MethodTag method={endpoint.method} />
        <code className="text-xs sm:text-sm font-mono text-[var(--text)] flex-1 truncate">
          {endpoint.path}
        </code>
        <span className="text-xs text-[var(--text-muted)] hidden sm:block max-w-[200px] truncate">
          {endpoint.description}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 text-[var(--text-muted)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Expandable content */}
      <div className="grid-expand" data-open={open}>
        <div>
          <div className="border-t border-[var(--border)]">
            {/* Description + URL */}
            <div className="px-4 py-3 border-b border-[var(--border)] ep-section" style={{ "--ep-delay": "0s" } as React.CSSProperties}>
              <p className="text-sm text-[var(--text-muted)]">
                {endpoint.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <code className="text-xs font-mono text-[var(--accent)]">
                  {BASE_URL}
                  {endpoint.path}
                </code>
                <CopyButton
                  text={`${BASE_URL}${endpoint.path}`}
                  className="text-[var(--text-muted)] hover:text-[var(--accent)]"
                />
              </div>
            </div>

            {/* Parameters */}
            {endpoint.params && endpoint.params.length > 0 && (
              <div className="px-4 py-3 border-b border-[var(--border)] ep-section" style={{ "--ep-delay": "0.04s" } as React.CSSProperties}>
                <h4 className="text-xs font-medium text-[var(--text-muted)] mb-2">
                  Parameters
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[var(--text-muted)]">
                        <th className="text-left py-1 pr-4 font-semibold">Name</th>
                        <th className="text-left py-1 pr-4 font-semibold">Type</th>
                        <th className="text-left py-1 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {endpoint.params.map((p) => (
                        <tr key={p.name}>
                          <td className="py-1 pr-4 font-mono text-[var(--accent)]">{p.name}</td>
                          <td className="py-1 pr-4 text-[var(--text-muted)]">{p.type}</td>
                          <td className="py-1 text-[var(--text-muted)]">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Request body */}
            {endpoint.requestBody && (
              <div className="border-b border-[var(--border)] ep-section" style={{ "--ep-delay": "0.08s" } as React.CSSProperties}>
                <div className="flex items-center justify-between px-4 py-2">
                  <h4 className="text-xs font-medium text-[var(--text-muted)]">
                    Request Body
                  </h4>
                  <CopyButton
                    text={endpoint.requestBody}
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] text-xs"
                  />
                </div>
                <div className="bg-[var(--code-bg)] px-4 py-3 overflow-x-auto">
                  <pre className="text-[12px] leading-[1.6] bg-transparent">
                    <code className="font-mono">
                      <Highlighted code={endpoint.requestBody} lang={lang} />
                    </code>
                  </pre>
                </div>
              </div>
            )}

            {/* Response */}
            <div className="ep-section" style={{ "--ep-delay": "0.12s" } as React.CSSProperties}>
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-medium text-[var(--text-muted)]">
                    Response
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-emerald-500">200</span>
                </div>
                <CopyButton
                  text={endpoint.response}
                  className="text-[var(--text-muted)] hover:text-[var(--accent)] text-xs"
                />
              </div>
              <div className="bg-[var(--code-bg)] px-4 py-3 overflow-x-auto max-h-64 overflow-y-auto">
                <pre className="text-[12px] leading-[1.6] bg-transparent">
                  <code className="font-mono">
                    <Highlighted code={endpoint.response} lang={lang} />
                  </code>
                </pre>
              </div>
            </div>

            {/* cURL */}
            <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface)] ep-section" style={{ "--ep-delay": "0.16s" } as React.CSSProperties}>
              <CopyButton
                text={curlCmd}
                label="Copy as cURL"
                className="text-xs font-medium text-[var(--accent)] hover:underline"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildCurl(ep: Endpoint): string {
  const url = `${BASE_URL}${ep.path}`;
  if (ep.method === "GET") return `curl ${url}`;
  if (ep.method === "DELETE") return `curl -X DELETE ${url}`;
  const ct = ep.requestBody?.trimStart().startsWith("<")
    ? "application/xml"
    : "application/json";
  const body = ep.requestBody
    ? ` \\\n  -H "Content-Type: ${ct}" \\\n  -d '${ep.requestBody.replace(/\n/g, "").replace(/\s+/g, " ")}'`
    : "";
  return `curl -X ${ep.method} ${url}${body}`;
}
