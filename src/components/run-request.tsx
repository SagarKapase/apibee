"use client";

import { useState } from "react";
import { MethodTag } from "./method-tag";
import { BASE_URL, bodyLang, type Method } from "@/lib/api-config";
import { Highlighted } from "@/lib/syntax";

interface Result {
  status: number;
  statusText: string;
  ms: number;
  headers: [string, string][];
  body: string;
}

const MAX_BODY = 4000;

function pretty(text: string) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

/**
 * A request the reader can send from the page. The API allows any origin,
 * so this calls it directly from the browser.
 */
export function RunRequest({
  method = "GET",
  path,
  headers = {},
  body,
  showHeaders = [],
}: {
  method?: Method;
  path: string;
  headers?: Record<string, string>;
  body?: string;
  /** Response headers to display besides Content-Type. */
  showHeaders?: string[];
}) {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const url = BASE_URL + path;

  async function run() {
    setBusy(true);
    setError(null);
    const start = performance.now();
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json", ...headers } : headers,
        body,
      });
      const text = await res.text();
      const wanted = ["content-type", ...showHeaders.map((h) => h.toLowerCase())];
      setResult({
        status: res.status,
        statusText: res.statusText,
        ms: Math.round(performance.now() - start),
        headers: wanted.flatMap((h) => {
          const v = res.headers.get(h);
          return v === null ? [] : [[h, v] as [string, string]];
        }),
        body: pretty(text),
      });
    } catch {
      setResult(null);
      setError("The request failed before a response arrived. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const shown = result && result.body.length > MAX_BODY
    ? result.body.slice(0, MAX_BODY) + "\n…"
    : result?.body;

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2 bg-[var(--surface)]">
        <MethodTag method={method} />
        <code className="flex-1 min-w-0 font-mono text-[12px] text-[var(--text)] break-all">
          {path}
        </code>
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-md bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:bg-[var(--btn-hover)] disabled:opacity-60 cursor-pointer"
        >
          {busy ? "Sending" : result ? "Send again" : "Send"}
        </button>
      </div>
      {body && (
        <pre className="px-3 py-2 border-t border-[var(--border)] bg-[var(--surface)] text-[12px] font-mono text-[var(--text-muted)] overflow-auto">
          {body}
        </pre>
      )}
      {error && (
        <p className="px-3 py-2 border-t border-[var(--border)] text-xs text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
      {result && (
        <div className="border-t border-[var(--border)]">
          <div className="px-3 py-1.5 bg-[#161616] text-xs font-mono text-[#a8a29e] space-y-0.5">
            <p>
              <span className={result.status < 400 ? "text-emerald-400" : "text-red-400"}>
                {result.status} {result.statusText}
              </span>
              <span className="ml-3">{result.ms} ms</span>
            </p>
            {result.headers.map(([k, v]) => (
              <p key={k} className="break-all">
                {k}: {v}
              </p>
            ))}
          </div>
          {shown ? (
            <pre className="bg-[var(--code-bg)] px-4 py-3 overflow-auto max-h-80 text-[12px] leading-[1.6]">
              <code className="font-mono">
                <Highlighted code={shown} lang={bodyLang(shown)} />
              </code>
            </pre>
          ) : (
            <p className="bg-[var(--code-bg)] px-4 py-3 text-[12px] font-mono text-[#78716c]">
              (empty body)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
