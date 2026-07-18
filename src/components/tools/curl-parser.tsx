"use client";

import { useState, useMemo } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";
import { Highlighted } from "@/lib/syntax";

const EXAMPLE = `curl -X POST https://api.apibee.io/api/user/addUser -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGci..." -d '{"name":"Test","email":"test@dev.io","job":"Developer","city":"Tokyo"}'`;

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/20 text-emerald-400",
  POST: "bg-blue-500/20 text-blue-400",
  PUT: "bg-amber-500/20 text-amber-400",
  DELETE: "bg-red-500/20 text-red-400",
  PATCH: "bg-violet-500/20 text-violet-400",
  HEAD: "bg-slate-500/20 text-slate-400",
  OPTIONS: "bg-cyan-500/20 text-cyan-400",
};

interface Parsed {
  method: string;
  url: string;
  headers: [string, string][];
  body: string;
  queryParams: [string, string][];
  flags: string[];
}

function tokenize(raw: string): string[] {
  const cleaned = raw.replace(/\\\n/g, " ").trim();
  const tokens: string[] = [];
  let i = 0;
  while (i < cleaned.length) {
    if (cleaned[i] === " " || cleaned[i] === "\t") {
      i++;
      continue;
    }
    if (cleaned[i] === "'" || cleaned[i] === '"') {
      const q = cleaned[i];
      let j = i + 1;
      while (j < cleaned.length && cleaned[j] !== q) {
        if (cleaned[j] === "\\" && j + 1 < cleaned.length) j++;
        j++;
      }
      tokens.push(cleaned.slice(i + 1, j));
      i = j + 1;
      continue;
    }
    let j = i;
    while (j < cleaned.length && cleaned[j] !== " " && cleaned[j] !== "\t") j++;
    tokens.push(cleaned.slice(i, j));
    i = j;
  }
  return tokens;
}

function parseCurl(raw: string): Parsed | null {
  const tokens = tokenize(raw);
  if (tokens.length === 0) return null;

  let idx = 0;
  if (tokens[idx]?.toLowerCase() === "curl") idx++;

  let method = "GET";
  let url = "";
  const headers: [string, string][] = [];
  let body = "";
  const flags: string[] = [];

  while (idx < tokens.length) {
    const t = tokens[idx];
    if (t === "-X" || t === "--request") {
      idx++;
      if (idx < tokens.length) method = tokens[idx].toUpperCase();
    } else if (t === "-H" || t === "--header") {
      idx++;
      if (idx < tokens.length) {
        const h = tokens[idx];
        const sep = h.indexOf(":");
        if (sep > 0) {
          headers.push([h.slice(0, sep).trim(), h.slice(sep + 1).trim()]);
        }
      }
    } else if (t === "-d" || t === "--data" || t === "--data-raw" || t === "--data-binary") {
      idx++;
      if (idx < tokens.length) body = tokens[idx];
    } else if (t.startsWith("-")) {
      flags.push(t);
    } else if (!url) {
      url = t;
    }
    idx++;
  }

  if (body && method === "GET") method = "POST";

  let queryParams: [string, string][] = [];
  try {
    const u = new URL(url);
    queryParams = Array.from(u.searchParams.entries());
  } catch {}

  let formattedBody = body;
  try {
    const parsed = JSON.parse(body);
    formattedBody = JSON.stringify(parsed, null, 2);
  } catch {}

  return { method, url, headers, body: formattedBody, queryParams, flags };
}

export function CurlParser() {
  const [input, setInput] = useState("");

  const parsed = useMemo(() => parseCurl(input), [input]);

  return (
    <ToolShell
      title="cURL Parser"
      description="Paste a cURL command. See it broken down into method, URL, headers, and body."
    >
      <ToolPanel
        label="cURL Command"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInput("")}
              className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setInput(EXAMPLE)}
              className="text-[10px] text-[var(--accent)] hover:underline cursor-pointer"
            >
              Load Example
            </button>
          </div>
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="curl -X GET https://api.example.com/users -H 'Authorization: Bearer ...'"
          rows={4}
          spellCheck={false}
          className="w-full min-h-[100px] bg-[var(--code-bg)] px-4 py-3 text-[13px] font-mono text-[var(--code-fg)] resize-y outline-none leading-[1.6] placeholder-[#525252] focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
        />
      </ToolPanel>

      {parsed && parsed.url && (
        <div className="grid gap-3 mt-4">
          {/* Method + URL */}
          <div className="grid sm:grid-cols-[auto_1fr] gap-3">
            <ToolPanel label="Method" dark>
              <div className="px-4 py-3">
                <span
                  className={`text-xl font-bold font-mono px-3 py-1 rounded-lg ${
                    methodColors[parsed.method] || "bg-slate-500/20 text-slate-400"
                  }`}
                >
                  {parsed.method}
                </span>
              </div>
            </ToolPanel>

            <ToolPanel
              label="URL"
              dark
              actions={<CopyButton text={parsed.url} className="text-[#525252] hover:text-[var(--accent)] text-xs" />}
            >
              <div className="px-4 py-3">
                <code className="text-[13px] font-mono text-[var(--code-fg)] break-all">
                  {parsed.url}
                </code>
              </div>
            </ToolPanel>
          </div>

          {/* Query params */}
          {parsed.queryParams.length > 0 && (
            <ToolPanel label="Query Parameters">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-2 px-4 text-xs font-semibold text-[var(--text-muted)]">
                        Key
                      </th>
                      <th className="text-left py-2 px-4 text-xs font-semibold text-[var(--text-muted)]">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.queryParams.map(([k, v], i) => (
                      <tr
                        key={i}
                        className="border-b border-[var(--border)] last:border-b-0"
                      >
                        <td className="py-2 px-4 font-mono text-xs text-[var(--accent)]">
                          {k}
                        </td>
                        <td className="py-2 px-4 font-mono text-xs text-[var(--text)]">
                          {v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ToolPanel>
          )}

          {/* Headers */}
          {parsed.headers.length > 0 && (
            <ToolPanel label={`Headers (${parsed.headers.length})`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-2 px-4 text-xs font-semibold text-[var(--text-muted)]">
                        Name
                      </th>
                      <th className="text-left py-2 px-4 text-xs font-semibold text-[var(--text-muted)]">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.headers.map(([name, value], i) => (
                      <tr
                        key={i}
                        className="border-b border-[var(--border)] last:border-b-0"
                      >
                        <td className="py-2 px-4 font-mono text-xs text-[var(--accent)]">
                          {name}
                        </td>
                        <td className="py-2 px-4 font-mono text-xs text-[var(--text)] break-all">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ToolPanel>
          )}

          {/* Body */}
          {parsed.body && (
            <ToolPanel
              label="Body"
              dark
              actions={
                <CopyButton
                  text={parsed.body}
                  className="text-[#525252] hover:text-[var(--accent)] text-xs"
                />
              }
            >
              <div className="px-4 py-3 overflow-x-auto">
                <pre className="text-[12px] leading-[1.6] bg-transparent">
                  <code className="font-mono">
                    <Highlighted
                      code={parsed.body}
                      lang={parsed.body.trimStart().startsWith("<") ? "xml" : "json"}
                    />
                  </code>
                </pre>
              </div>
            </ToolPanel>
          )}

          {/* Flags */}
          {parsed.flags.length > 0 && (
            <ToolPanel label="Other Flags">
              <div className="px-4 py-3 flex flex-wrap gap-2">
                {parsed.flags.map((f, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs font-mono rounded bg-[var(--accent-soft)] text-[var(--text-muted)]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </ToolPanel>
          )}
        </div>
      )}

      {input && !parsed?.url && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400 font-mono">
          Could not find a URL in this command. Make sure it starts with
          &quot;curl&quot;.
        </div>
      )}
    </ToolShell>
  );
}
