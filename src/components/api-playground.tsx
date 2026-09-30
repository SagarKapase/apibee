"use client";

import { useState } from "react";
import Link from "next/link";
import { BASE_URL, bodyLang, type Method } from "@/lib/api-config";
import { MethodTag } from "./method-tag";
import { CopyButton } from "./copy-button";
import { Highlighted } from "@/lib/syntax";

export interface PlaygroundEndpoint {
  key: string;
  href: string;
  method: Method;
  path: string;
  summary: string;
  curl: string;
  requestBody?: string;
  status: string;
  response: string;
}

export interface PlaygroundGroup {
  id: string;
  title: string;
  endpoints: PlaygroundEndpoint[];
}

function statusTone(status: string) {
  const code = Number(status.slice(0, 3));
  if (code >= 400) return "text-red-600 dark:text-red-400";
  if (code >= 300) return "text-sky-600 dark:text-sky-400";
  return "text-emerald-600 dark:text-emerald-500";
}

export function APIPlayground({ groups }: { groups: PlaygroundGroup[] }) {
  const [groupIdx, setGroupIdx] = useState(0);
  const [endpointIdx, setEndpointIdx] = useState(0);

  const group = groups[groupIdx];
  const endpoint = group.endpoints[endpointIdx];
  const fullUrl = `${BASE_URL}${endpoint.path}`;

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden terminal-glow">
      {/* Group tabs */}
      <div
        role="tablist"
        aria-label="API group"
        className="flex overflow-x-auto border-b border-[var(--border)] bg-[var(--surface)]"
      >
        {groups.map((g, i) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={groupIdx === i}
            onClick={() => {
              setGroupIdx(i);
              setEndpointIdx(0);
            }}
            className={`relative shrink-0 px-4 py-3 text-[13px] whitespace-nowrap cursor-pointer transition-colors ${
              groupIdx === i
                ? "text-[var(--text)] font-medium"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {g.title}
            {groupIdx === i && (
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
          label="URL"
          hideLabel
          className="text-[#78716c] hover:text-[#e7e5e4] shrink-0"
        />
        <CopyButton
          text={endpoint.curl}
          label="cURL"
          className="text-[11px] text-[#a8a29e] hover:text-[#e7e5e4] border border-white/10 rounded px-2 py-0.5 shrink-0 hover:border-white/20"
        />
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Endpoint list */}
        <div className="lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--border)] bg-[var(--surface)]">
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible lg:max-h-[22rem] lg:overflow-y-auto py-1">
            {group.endpoints.map((ep, i) => (
              <button
                key={ep.key}
                onClick={() => setEndpointIdx(i)}
                title={ep.summary}
                className={`flex items-center gap-2 px-3 py-2 text-left whitespace-nowrap cursor-pointer w-full border-l-2 transition-colors ${
                  endpointIdx === i
                    ? "bg-[var(--accent-soft)] text-[var(--text)] border-l-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)] border-l-transparent"
                }`}
              >
                <MethodTag method={ep.method} />
                <span className="text-xs font-mono truncate">
                  {ep.path.replace(/^\/api/, "")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Request and response */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px] border-b border-[var(--border)] bg-[var(--surface)]">
            <p className="text-[var(--text-muted)]">{endpoint.summary}</p>
            <Link
              href={endpoint.href}
              className="shrink-0 link-underline text-[var(--text)]"
            >
              Open in docs
            </Link>
          </div>
          {endpoint.requestBody && (
            <div className="border-b border-[var(--border)]">
              <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface)]">
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  Request body
                </span>
                <CopyButton
                  text={endpoint.requestBody}
                  label="request body"
                  hideLabel
                  className="text-[var(--text-muted)]"
                />
              </div>
              <div className="bg-[var(--code-bg)] px-4 py-3 overflow-x-auto max-h-40">
                <pre className="text-[12px] leading-[1.6] bg-transparent">
                  <code className="font-mono">
                    <Highlighted
                      code={endpoint.requestBody}
                      lang={bodyLang(endpoint.requestBody)}
                    />
                  </code>
                </pre>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface)]">
            <span className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              Response
              <span className={`font-mono ${statusTone(endpoint.status)}`}>
                {endpoint.status}
              </span>
            </span>
            <CopyButton
              text={endpoint.response}
              label="response"
              hideLabel
              className="text-[var(--text-muted)]"
            />
          </div>
          <div className="bg-[var(--code-bg)] px-4 py-3 overflow-auto max-h-72">
            <pre className="text-[12px] leading-[1.6] bg-transparent">
              <code className="font-mono">
                <Highlighted
                  code={endpoint.response}
                  lang={bodyLang(endpoint.response)}
                />
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
