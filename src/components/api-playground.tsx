"use client";

import { useState } from "react";
import { resources, BASE_URL } from "@/lib/api-data";
import type { Endpoint } from "@/lib/api-data";
import { MethodTag } from "./method-tag";
import { CopyButton } from "./copy-button";
import { Highlighted } from "@/lib/syntax";

export function APIPlayground() {
  const [resourceIdx, setResourceIdx] = useState(0);
  const [endpointIdx, setEndpointIdx] = useState(0);

  const resource = resources[resourceIdx];
  const endpoint = resource.endpoints[endpointIdx];
  const fullUrl = `${BASE_URL}${endpoint.path}`;
  const isXml = endpoint.response.trimStart().startsWith("<");

  function selectResource(idx: number) {
    setResourceIdx(idx);
    setEndpointIdx(0);
  }

  function selectEndpoint(idx: number) {
    setEndpointIdx(idx);
  }

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden terminal-glow">
      {/* Resource tabs */}
      <div
        role="tablist"
        aria-label="Resource"
        className="flex overflow-x-auto border-b border-[var(--border)] bg-[var(--surface)]"
      >
        {resources.map((r, i) => (
          <button
            key={r.id}
            role="tab"
            aria-selected={resourceIdx === i}
            onClick={() => selectResource(i)}
            className={`relative shrink-0 px-4 py-3 text-[13px] whitespace-nowrap cursor-pointer transition-colors ${
              resourceIdx === i
                ? "text-[var(--text)] font-medium"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {r.title}
            {resourceIdx === i && (
              <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[var(--accent)]" />
            )}
          </button>
        ))}
      </div>

      {/* URL bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[var(--code-bg)] border-b border-white/[0.06]">
        <MethodTag method={endpoint.method} />
        <code className="flex-1 text-xs sm:text-sm font-mono text-[var(--code-fg)] truncate select-all">
          {fullUrl}
        </code>
        <CopyButton
          text={fullUrl}
          className="text-[#78716c] hover:text-[#e7e5e4] shrink-0"
        />
        <CopyButton
          text={buildCurl(endpoint)}
          label="cURL"
          className="text-[10px] text-[#78716c] hover:text-[#e7e5e4] border border-white/10 rounded px-2 py-0.5 shrink-0 transition-all duration-150 hover:border-white/20"
        />
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Endpoint list (left) */}
        <div className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--border)] bg-[var(--surface)]">
          <div className="px-3 py-2">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              Endpoints
            </span>
          </div>
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible">
            {resource.endpoints.map((ep, i) => (
              <button
                key={`${ep.method}-${ep.path}`}
                onClick={() => selectEndpoint(i)}
                className={`flex items-center gap-2 px-3 py-2 text-left whitespace-nowrap cursor-pointer w-full
                  transition-all duration-200
                  ${
                    endpointIdx === i
                      ? "bg-[var(--accent-soft)] text-[var(--text)] border-l-2 border-l-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)] border-l-2 border-l-transparent"
                  }
                `}
              >
                <MethodTag method={ep.method} />
                <span className="text-xs font-mono truncate">
                  {ep.path.split("/").slice(-1)[0] || ep.path}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Response area (right) */}
        <div className="flex-1 min-w-0">
          {/* Request body (POST/PUT only) */}
          {endpoint.requestBody && (
            <div className="border-b border-[var(--border)]">
              <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface)]">
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  Request body
                </span>
                <CopyButton
                  text={endpoint.requestBody}
                  className="text-[var(--text-muted)] hover:text-[var(--accent)] text-xs"
                />
              </div>
              <div className="bg-[var(--code-bg)] px-4 py-3 overflow-x-auto max-h-40">
                <pre className="text-[12px] leading-[1.6] bg-transparent">
                  <code className="font-mono">
                    <Highlighted
                      code={endpoint.requestBody}
                      lang={
                        endpoint.requestBody.trimStart().startsWith("<")
                          ? "xml"
                          : "json"
                      }
                    />
                  </code>
                </pre>
              </div>
            </div>
          )}

          {/* Response */}
          <div>
            <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  Response
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-500">
                  200 OK
                </span>
              </div>
              <CopyButton
                text={endpoint.response}
                className="text-[var(--text-muted)] hover:text-[var(--accent)] text-xs"
              />
            </div>
            <div className="bg-[var(--code-bg)] px-4 py-3 overflow-x-auto max-h-72 overflow-y-auto">
              <pre className="text-[12px] leading-[1.6] bg-transparent">
                <code className="font-mono">
                  <Highlighted
                    code={endpoint.response}
                    lang={isXml ? "xml" : "json"}
                  />
                </code>
              </pre>
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
