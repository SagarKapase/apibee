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
  const [contentKey, setContentKey] = useState(0);

  const resource = resources[resourceIdx];
  const endpoint = resource.endpoints[endpointIdx];
  const fullUrl = `${BASE_URL}${endpoint.path}`;
  const isXml = endpoint.response.trimStart().startsWith("<");

  function selectResource(idx: number) {
    setResourceIdx(idx);
    setEndpointIdx(0);
    setContentKey((k) => k + 1);
  }

  function selectEndpoint(idx: number) {
    setEndpointIdx(idx);
    setContentKey((k) => k + 1);
  }

  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden terminal-glow">
      {/* Resource tabs */}
      <div className="flex border-b border-[var(--border)] bg-[var(--surface)]">
        {resources.map((r, i) => (
          <button
            key={r.id}
            onClick={() => selectResource(i)}
            className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium cursor-pointer
              transition-all duration-250
              active:scale-[0.97]
              ${
                resourceIdx === i
                  ? "text-[var(--accent)] bg-[var(--accent-soft)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)]"
              }
            `}
          >
            <span
              className={`hidden sm:inline transition-transform duration-300 ${
                resourceIdx === i ? "scale-110" : ""
              }`}
            >
              {r.icon}
            </span>
            <span className="truncate">{r.title}</span>
            {/* Animated underline */}
            {resourceIdx === i && (
              <span
                className="absolute bottom-0 left-3 right-3 h-[2px] rounded-t bg-[var(--accent)]"
                style={{
                  animation:
                    "tabGrow 0.3s cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* URL bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[var(--code-bg)] border-b border-white/[0.06]">
        <MethodTag method={endpoint.method} />
        <code
          key={contentKey}
          className="flex-1 text-xs sm:text-sm font-mono text-[var(--code-fg)] truncate select-all"
          style={{
            animation: "fadeSlide 0.25s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {fullUrl}
        </code>
        <CopyButton
          text={fullUrl}
          className="text-[#525252] hover:text-[var(--accent)] shrink-0"
        />
        <CopyButton
          text={buildCurl(endpoint)}
          label="cURL"
          className="text-[10px] text-[#525252] hover:text-[var(--accent)] border border-white/10 rounded px-2 py-0.5 shrink-0 transition-all duration-150 active:scale-95 hover:border-white/20"
        />
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Endpoint list (left) */}
        <div className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--border)] bg-[var(--surface)]">
          <div className="px-3 py-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
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
                  active:scale-[0.97]
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
        <div className="flex-1 min-w-0" key={contentKey}>
          {/* Request body (POST/PUT only) */}
          {endpoint.requestBody && (
            <div
              className="border-b border-[var(--border)]"
              style={{
                animation: "fadeSlide 0.3s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface)]">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                  Request Body
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
          <div
            style={{
              animation: "fadeSlide 0.3s cubic-bezier(0.16,1,0.3,1) 0.05s both",
            }}
          >
            <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface)]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
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

      <style>{`
        @keyframes tabGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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
