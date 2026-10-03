"use client";

import { useState } from "react";
import { CopyButton } from "../copy-button";
import { Highlighted } from "@/lib/syntax";

export interface ResponseState {
  status: number;
  statusText: string;
  timeMs: number;
  size: number;
  headers: [string, string][];
  contentType: string;
  redirected: boolean;
  finalUrl: string;
  kind: "text" | "image" | "file" | "empty";
  text: string;
  truncated: boolean;
  objectUrl?: string;
  fileName?: string;
  done: boolean;
}

const HIGHLIGHT_LIMIT = 150_000;

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function statusTone(status: number) {
  if (status >= 500) return "text-red-600 dark:text-red-400";
  if (status >= 400) return "text-amber-700 dark:text-amber-400";
  if (status >= 300) return "text-sky-600 dark:text-sky-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function prettyBody(res: ResponseState): { text: string; lang: "json" | "xml" | "text" } {
  const ct = res.contentType.toLowerCase();
  if (ct.includes("json") || /^\s*[[{]/.test(res.text)) {
    try {
      return { text: JSON.stringify(JSON.parse(res.text), null, 2), lang: "json" };
    } catch {
      // NDJSON, JSONP or deliberately broken JSON: show it as it came.
    }
  }
  if (ct.includes("xml") || ct.includes("html") || ct.includes("svg")) {
    return { text: res.text, lang: "xml" };
  }
  return { text: res.text, lang: "text" };
}

export function ResponseView({ response }: { response: ResponseState }) {
  const [tab, setTab] = useState<"body" | "headers">("body");
  const body = response.done && response.kind === "text" ? prettyBody(response) : null;

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 bg-[var(--surface)] border-b border-[var(--border)] text-xs">
        <span className={`font-mono font-semibold ${statusTone(response.status)}`}>
          {response.status} {response.statusText}
        </span>
        <span className="text-[var(--text-muted)]">{Math.round(response.timeMs)} ms</span>
        <span className="text-[var(--text-muted)]">{formatBytes(response.size)}</span>
        {!response.done && <span className="text-[var(--text-muted)]">Receiving…</span>}
        <span className="ml-auto flex gap-1">
          {(["body", "headers"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                tab === t
                  ? "bg-[var(--accent-soft)] text-[var(--text)] font-medium"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {t === "body" ? "Body" : `Headers (${response.headers.length})`}
            </button>
          ))}
        </span>
      </div>

      {response.redirected && (
        <p className="px-3 py-2 text-xs text-[var(--text-muted)] border-b border-[var(--border)]">
          The browser followed a redirect. Final URL:{" "}
          <code className="font-mono break-all text-[var(--text)]">{response.finalUrl}</code>
        </p>
      )}

      {tab === "headers" ? (
        <div className="px-3 py-2 text-xs">
          <dl className="space-y-1 font-mono">
            {response.headers.map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-[var(--text-muted)] shrink-0">{k}:</dt>
                <dd className="text-[var(--text)] break-all">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] text-[var(--text-muted)]">
            Browsers only show scripts the headers the server exposes through CORS.
          </p>
        </div>
      ) : response.kind === "empty" ? (
        <p className="px-3 py-4 text-xs text-[var(--text-muted)]">No body.</p>
      ) : response.kind === "image" && response.objectUrl ? (
        <div className="p-3 bg-[var(--bg)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={response.objectUrl} alt="Response image" className="max-h-72 max-w-full" />
        </div>
      ) : response.kind === "file" && response.objectUrl ? (
        <p className="px-3 py-4 text-sm">
          <a
            href={response.objectUrl}
            download={response.fileName}
            className="link-underline text-[var(--text)]"
          >
            Download {response.fileName}
          </a>{" "}
          <span className="text-[var(--text-muted)]">({response.contentType || "binary"})</span>
        </p>
      ) : (
        <div className="relative">
          {response.done && (
            <CopyButton
              text={body?.text ?? response.text}
              label="response body"
              hideLabel
              className="absolute top-2 right-2 text-[#8d9299] hover:text-[#e1e3e5]"
            />
          )}
          <pre className="bg-[var(--code-bg)] px-3 py-3 pr-9 overflow-auto max-h-[28rem] text-[12px] leading-[1.6]">
            <code className="font-mono text-[var(--code-fg)]">
              {body && body.text.length <= HIGHLIGHT_LIMIT ? (
                <Highlighted code={body.text} lang={body.lang} />
              ) : (
                (body?.text ?? response.text) || " "
              )}
            </code>
          </pre>
          {response.truncated && (
            <p className="px-3 py-2 text-[11px] text-[var(--text-muted)] border-t border-[var(--border)]">
              Showing the first 2 MB.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
