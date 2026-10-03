"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { BASE_URL } from "@/lib/api-config";
import { groupIcon } from "@/lib/group-icons";
import type { Lang } from "@/lib/syntax";
import { CodeViewer } from "./code-viewer";
import { CopyButton } from "./copy-button";
import { Icon } from "./icon";
import { REASONS } from "./try-it/model";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function sendsBody(method: Method) {
  return method === "POST" || method === "PUT" || method === "PATCH";
}

/** A group from the API reference, with the request its first example makes. */
export interface ConsoleResource {
  id: string;
  title: string;
  count: number;
  /** Path shared by every endpoint in the group, such as /api/Products. */
  prefix: string;
  method: string;
  path: string;
  body?: string;
}

interface Preset {
  label: string;
  method: Method;
  path: string;
  body: string;
  headers: string;
}

const presets: Preset[] = [
  {
    label: "Products",
    method: "GET",
    path: "/api/Products?limit=3",
    body: "",
    headers: "",
  },
  {
    label: "One book",
    method: "GET",
    path: "/api/Books/1",
    body: "",
    headers: "",
  },
  {
    label: "Create a todo",
    method: "POST",
    path: "/api/Todos",
    body: `{
  "userId": 101,
  "title": "Write integration tests",
  "completed": false,
  "priority": "high"
}`,
    headers: "",
  },
  {
    label: "Echo",
    method: "POST",
    path: "/api/echo?tag=demo",
    body: `{
  "hello": "world"
}`,
    headers: "X-Request-Id: 42",
  },
  {
    label: "Status 418",
    method: "GET",
    path: "/api/status/418",
    body: "",
    headers: "",
  },
  {
    label: "Simulated 503",
    method: "GET",
    path: "/api/Products?error=503",
    body: "",
    headers: "",
  },
  {
    label: "Bearer token",
    method: "GET",
    path: "/api/auth/bearer",
    body: "",
    headers: "Authorization: Bearer apibee-token-123",
  },
  {
    label: "JWT login",
    method: "POST",
    path: "/api/auth/jwt/login",
    body: `{
  "username": "user",
  "password": "user123"
}`,
    headers: "",
  },
  {
    label: "UUIDs",
    method: "GET",
    path: "/api/utils/uuid?count=3",
    body: "",
    headers: "",
  },
];

// Only the method control carries these colors.
const methodStyles: Record<Method, { box: string; text: string }> = {
  GET: { box: "border-emerald-500/30 bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400" },
  POST: { box: "border-blue-500/30 bg-blue-500/10", text: "text-blue-700 dark:text-blue-400" },
  PUT: { box: "border-amber-500/30 bg-amber-500/10", text: "text-amber-700 dark:text-amber-400" },
  PATCH: { box: "border-orange-500/30 bg-orange-500/10", text: "text-orange-700 dark:text-orange-400" },
  DELETE: { box: "border-red-500/30 bg-red-500/10", text: "text-red-700 dark:text-red-400" },
};

function statusStyle(status: number) {
  if (status >= 500) return { chip: "bg-red-500/10 text-red-700 dark:text-red-400", dot: "bg-red-500" };
  if (status >= 400) return { chip: "bg-amber-500/10 text-amber-700 dark:text-amber-400", dot: "bg-amber-500" };
  if (status >= 300) return { chip: "bg-sky-500/10 text-sky-700 dark:text-sky-400", dot: "bg-sky-500" };
  return { chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" };
}

// The field holds a full URL. A bare path such as /api/Books is sent to the API.
function resolveUrl(input: string) {
  const value = input.trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `${BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

interface ConsoleRequest {
  method: Method;
  url: string;
  headers: [string, string][];
  body?: string;
}

// What Send sends. The code tabs are generated from the same object.
function buildRequest(method: Method, url: string, headersText: string, body: string): ConsoleRequest {
  const headers: [string, string][] = [];
  for (const line of headersText.split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) headers.push([line.slice(0, idx).trim(), line.slice(idx + 1).trim()]);
  }
  const hasBody = body.trim() !== "" && sendsBody(method);
  if (hasBody && !headers.some(([k]) => k.toLowerCase() === "content-type")) {
    headers.push(["Content-Type", body.trimStart().startsWith("<") ? "application/xml" : "application/json"]);
  }
  return { method, url: resolveUrl(url), headers, body: hasBody ? body : undefined };
}

const sq = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;

function toCurl(r: ConsoleRequest) {
  const lines = [`curl${r.method === "GET" ? "" : ` -X ${r.method}`} ${sq(r.url)}`];
  for (const [k, v] of r.headers) lines.push(`-H ${sq(`${k}: ${v}`)}`);
  if (r.body) lines.push(`-d ${sq(r.body)}`);
  return lines.join(" \\\n  ");
}

function prettyJson(text: string) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return null;
  }
}

function toJavaScript(r: ConsoleRequest) {
  const opts: string[] = [];
  if (r.method !== "GET") opts.push(`method: ${JSON.stringify(r.method)}`);
  if (r.headers.length) {
    opts.push(`headers: {\n${r.headers.map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n")}\n  }`);
  }
  if (r.body) {
    const json = prettyJson(r.body);
    opts.push(json ? `body: JSON.stringify(${json.replace(/\n/g, "\n  ")})` : `body: ${JSON.stringify(r.body)}`);
  }
  const call = opts.length
    ? `const res = await fetch(${JSON.stringify(r.url)}, {\n  ${opts.join(",\n  ")},\n});`
    : `const res = await fetch(${JSON.stringify(r.url)});`;
  return `${call}\nconsole.log(res.status, await res.text());`;
}

function toPython(r: ConsoleRequest) {
  const args = [JSON.stringify(r.url)];
  if (r.headers.length) {
    args.push(`headers={\n${r.headers.map(([k, v]) => `        ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n")}\n    }`);
  }
  if (r.body) args.push(`data=${JSON.stringify(r.body)}`);
  const fn = r.method.toLowerCase();
  const call = args.length === 1 ? `res = requests.${fn}(${args[0]})` : `res = requests.${fn}(\n    ${args.join(",\n    ")},\n)`;
  return `import requests\n\n${call}\nprint(res.status_code, res.text)`;
}

interface ResponseData {
  status: number;
  statusText: string;
  time: number;
  size: number;
  headers: [string, string][];
  body: string;
  isXml: boolean;
}

// Sends the request to the API and reads the whole response.
async function execute(r: ConsoleRequest, signal: AbortSignal): Promise<ResponseData> {
  const t0 = performance.now();
  const res = await fetch(r.url, { method: r.method, headers: r.headers, body: r.body, signal });
  const text = await res.text();
  const formatted = prettyJson(text) ?? text;
  return {
    status: res.status,
    statusText: res.statusText || REASONS[res.status] || "",
    time: Math.round(performance.now() - t0),
    size: new TextEncoder().encode(text).length,
    headers: [...res.headers.entries()],
    body: formatted,
    isXml: formatted.trimStart().startsWith("<"),
  };
}

type View = "response" | "headers" | "curl" | "javascript" | "python";

const VIEWS: { id: View; label: string }[] = [
  { id: "response", label: "Response" },
  { id: "headers", label: "Headers" },
  { id: "curl", label: "cURL" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
];

// Highlighting very large bodies stalls the page; the copy button still gets everything.
const MAX_SHOWN = 200_000;

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function Spinner() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

const textareaClass =
  "block w-full bg-[var(--code-bg)] px-4 py-3 text-[12px] font-mono leading-[1.6] text-[var(--code-fg)] placeholder:text-[#656b73] resize-y outline-none border-0";

const subTab = (active: boolean) =>
  `relative px-2 py-2 text-[11.5px] cursor-pointer ${active ? "text-[var(--text)] font-medium" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`;

export function LiveConsole({ resources }: { resources: ConsoleResource[] }) {
  const [method, setMethod] = useState<Method>("GET");
  const [url, setUrl] = useState(`${BASE_URL}${presets[0].path}`);
  const [body, setBody] = useState("");
  const [headers, setHeaders] = useState("");
  const [requestTab, setRequestTab] = useState<"body" | "headers" | null>(null);
  const [view, setView] = useState<View>("response");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const viewRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  const request = buildRequest(method, url, headers, body);
  const headerCount = headers.split("\n").filter((l) => l.indexOf(":") > 0).length;

  // The sidebar highlights the group whose paths the current URL belongs to.
  let currentPath = "";
  try {
    const parsed = new URL(request.url);
    if (parsed.origin === new URL(BASE_URL).origin) currentPath = parsed.pathname.toLowerCase();
  } catch {
    // An unfinished URL matches nothing.
  }
  const activeResource = resources.find((r) => {
    const prefix = r.prefix.toLowerCase();
    return currentPath === prefix || currentPath.startsWith(`${prefix}/`);
  });

  function load(next: { method: Method; path: string; body: string; headers: string }) {
    abortRef.current?.abort();
    setMethod(next.method);
    setUrl(`${BASE_URL}${next.path}`);
    setBody(next.body);
    setHeaders(next.headers);
    setResponse(null);
    setError(null);
    setLoading(false);
    setRequestTab(next.headers ? "headers" : next.body ? "body" : null);
  }

  function loadResource(r: ConsoleResource) {
    const m = (METHODS as string[]).includes(r.method) ? (r.method as Method) : "GET";
    load({ method: m, path: r.path, body: sendsBody(m) ? (r.body ?? "") : "", headers: "" });
  }

  async function send() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setResponse(null);
    if (view !== "headers") setView("response");

    try {
      new URL(request.url);
    } catch {
      setLoading(false);
      setError("That is not a valid URL. Enter a full URL or a path such as /api/Products.");
      return;
    }

    setLoading(true);
    try {
      setResponse(await execute(request, controller.signal));
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      setError(
        err instanceof TypeError
          ? "Network error. The server may be starting up after being idle. Try again in a few seconds."
          : String(err)
      );
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }

  // Content of the selected response tab; null means there is nothing to show yet.
  let content: { code: string; lang: Lang } | null = null;
  if (view === "curl") content = { code: toCurl(request), lang: "curl" };
  else if (view === "javascript") content = { code: toJavaScript(request), lang: "javascript" };
  else if (view === "python") content = { code: toPython(request), lang: "python" };
  else if (response && view === "headers") {
    content = { code: response.headers.map(([k, v]) => `${k}: ${v}`).join("\n") || "(no headers exposed)", lang: "text" };
  } else if (response) {
    content = { code: response.body || "(empty body)", lang: response.isXml ? "xml" : "json" };
  }
  const truncated = content !== null && content.code.length > MAX_SHOWN;

  function onViewKeyDown(e: React.KeyboardEvent, index: number) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + VIEWS.length) % VIEWS.length;
    setView(VIEWS[next].id);
    viewRefs.current[next]?.focus();
  }

  const status = response ? statusStyle(response.status) : null;
  const methodStyle = methodStyles[method];

  return (
    <div className="grid md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[205px_minmax(0,1fr)] rounded-[9px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Resources */}
      <nav aria-label="Resources" className="hidden md:flex flex-col border-r border-[var(--border)] px-2.5 pt-3.5 pb-4">
        <p className="px-2.5 pb-2.5 text-[11px] font-semibold text-[var(--text)]">Resources</p>
        <ul className="space-y-0.5">
          {resources.map((r) => {
            const active = r === activeResource;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => loadResource(r)}
                  aria-pressed={active}
                  className={`relative flex w-full items-center gap-2.5 rounded-[5px] px-2.5 h-9 text-left text-[12.5px] cursor-pointer transition-colors duration-150 ${
                    active
                      ? "bg-amber-500/10 text-[var(--text)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
                  }`}
                >
                  {active && <span aria-hidden="true" className="absolute -left-2.5 top-1.5 bottom-1.5 w-[2px] bg-[var(--accent)]" />}
                  <Icon name={groupIcon(r.id)} size={15} className={active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
                  <span className="flex-1 truncate">{r.title}</span>
                  <span className="font-mono text-[10.5px] tabular-nums text-[var(--text-muted)]">{r.count}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <Link
          href="/docs#endpoints"
          className="mt-3 mx-2.5 inline-flex items-center gap-1 text-[11.5px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-150"
        >
          View all resources
          <Icon name="arrowRight" size={12} />
        </Link>
      </nav>

      <div className="min-w-0">
        {/* Phones pick a resource from a dropdown */}
        <label className="md:hidden flex items-center gap-2 px-3 pt-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Resource</span>
          <select
            value={activeResource?.id ?? ""}
            onChange={(e) => {
              const r = resources.find((x) => x.id === e.target.value);
              if (r) loadResource(r);
            }}
            className="flex-1 min-w-0 rounded-[5px] border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-[13px] text-[var(--text)] cursor-pointer"
          >
            <option value="" disabled>
              Choose a resource
            </option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.count})
              </option>
            ))}
          </select>
        </label>

        {/* Presets */}
        <div role="group" aria-label="Example requests" className="flex gap-1.5 overflow-x-auto border-b border-[var(--border)] px-3 py-2.5">
          {presets.map((p) => {
            const active = request.url === `${BASE_URL}${p.path}` && method === p.method;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => load(p)}
                aria-pressed={active}
                className={`relative shrink-0 h-[30px] px-2.5 rounded-[5px] border bg-[var(--bg)] text-[11px] cursor-pointer transition-colors duration-150 ${
                  active
                    ? "border-[var(--text-muted)]/50 text-[var(--text)] font-medium"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)]/40"
                }`}
              >
                {p.label}
                {active && <span aria-hidden="true" className="absolute -bottom-px left-2 right-2 h-[2px] bg-[var(--accent)]" />}
              </button>
            );
          })}
        </div>

        {/* Request bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-3 py-2.5">
          <div className="relative order-1">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as Method)}
              aria-label="HTTP method"
              className={`appearance-none h-9 w-[5.75rem] rounded-[5px] border pl-3 pr-7 font-mono text-[12px] font-bold cursor-pointer ${methodStyle.box} ${methodStyle.text}`}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <Icon
              name="chevronDown"
              size={13}
              className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 ${methodStyle.text}`}
            />
          </div>
          <div className="order-3 basis-full sm:order-2 sm:basis-auto sm:flex-1 min-w-0 flex items-center gap-1 h-9 rounded-[5px] border border-[var(--border)] bg-[var(--bg)] pl-3 pr-1 focus-within:border-[var(--text-muted)]">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) send();
              }}
              aria-label="Request URL"
              spellCheck={false}
              placeholder={`${BASE_URL}/api/Products?limit=3`}
              className="flex-1 min-w-0 bg-transparent font-mono text-[12px] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus-visible:outline-none"
            />
            <CopyButton
              text={request.url}
              label="request URL"
              hideLabel
              className="shrink-0 size-7 justify-center rounded-[4px] hover:bg-[var(--accent-soft)]"
            />
          </div>
          <button
            type="button"
            onClick={send}
            disabled={loading}
            className="order-2 ml-auto sm:order-3 sm:ml-0 inline-flex items-center gap-1.5 h-9 px-5 rounded-[5px] bg-[#f59e0b] text-[#171108] text-[12px] font-bold hover:bg-[#fbb326] disabled:opacity-70 cursor-pointer transition-colors duration-150"
          >
            {loading && <Spinner />}
            {loading ? "Sending" : "Send"}
          </button>
        </div>

        {/* Request body and headers */}
        <div className="border-b border-[var(--border)]">
          <div className="flex items-center gap-1 px-1.5">
            {sendsBody(method) && (
              <button
                type="button"
                onClick={() => setRequestTab(requestTab === "body" ? null : "body")}
                aria-expanded={requestTab === "body"}
                className={subTab(requestTab === "body")}
              >
                Body
                {requestTab === "body" && <span aria-hidden="true" className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--accent)]" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => setRequestTab(requestTab === "headers" ? null : "headers")}
              aria-expanded={requestTab === "headers"}
              className={subTab(requestTab === "headers")}
            >
              Headers
              {headerCount > 0 && <span className="ml-1 font-mono text-[10.5px] text-[var(--text-muted)]">{headerCount}</span>}
              {requestTab === "headers" && <span aria-hidden="true" className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--accent)]" />}
            </button>
          </div>
          {requestTab === "body" && sendsBody(method) && (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={Math.min(10, Math.max(4, body.split("\n").length + 1))}
              aria-label="Request body"
              placeholder='{"name": "...", "email": "..."}'
              spellCheck={false}
              className={textareaClass}
            />
          )}
          {requestTab === "headers" && (
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              rows={3}
              aria-label="Request headers, one per line"
              placeholder="Authorization: Bearer <token>"
              spellCheck={false}
              className={textareaClass}
            />
          )}
        </div>

        {/* Response */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] pl-1.5 pr-3">
          <div role="tablist" aria-label="Response view" className="flex flex-1 min-w-0 overflow-x-auto">
            {VIEWS.map((v, i) => (
              <button
                key={v.id}
                ref={(el) => {
                  viewRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${id}-view-${v.id}`}
                aria-selected={view === v.id}
                aria-controls={`${id}-panel`}
                tabIndex={view === v.id ? 0 : -1}
                onClick={() => setView(v.id)}
                onKeyDown={(e) => onViewKeyDown(e, i)}
                className={`relative shrink-0 px-2.5 py-3 text-[12px] whitespace-nowrap cursor-pointer transition-colors duration-150 ${
                  view === v.id ? "text-[var(--text)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {v.label}
                {view === v.id && <span aria-hidden="true" className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-[var(--accent)]" />}
              </button>
            ))}
          </div>
          {response && status && (
            <>
              <span className="hidden lg:inline font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                {response.time} ms · {formatBytes(response.size)}
              </span>
              <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-[5px] px-2 py-1 font-mono text-[11px] whitespace-nowrap ${status.chip}`}>
                <span aria-hidden="true" className={`size-1.5 rounded-full ${status.dot}`} />
                {response.status} {response.statusText}
              </span>
            </>
          )}
          {content && (
            <CopyButton
              text={content.code}
              label={view === "response" ? "response body" : VIEWS.find((v) => v.id === view)?.label}
              hideLabel
              className="shrink-0 size-7 justify-center rounded-[5px] border border-[var(--border)] hover:bg-[var(--accent-soft)]"
            />
          )}
        </div>

        <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-view-${view}`} aria-busy={loading}>
          {content && !(loading && (view === "response" || view === "headers")) ? (
            <>
              <CodeViewer
                code={truncated ? `${content.code.slice(0, MAX_SHOWN)}\n…` : content.code}
                lang={truncated ? "text" : content.lang}
                className="h-80 md:h-[23rem]"
              />
              {(truncated || view === "headers") && (
                <p className="border-t border-[var(--border)] px-4 py-2 text-[11px] text-[var(--text-muted)]">
                  {truncated
                    ? "Showing the first 200 KB. Copy gets the whole body."
                    : "Browsers only let pages read the headers the server exposes through CORS."}
                </p>
              )}
            </>
          ) : (
            <div className="grid h-80 md:h-[23rem] place-items-center bg-[var(--code-bg)] px-4">
              {loading ? (
                <p role="status" className="inline-flex items-center gap-2 font-mono text-[12px] text-[#969ba3]">
                  <Spinner />
                  Sending request…
                </p>
              ) : error ? (
                <p role="alert" className="max-w-md rounded-[6px] border border-red-500/25 bg-red-500/10 px-4 py-3 font-mono text-[12px] leading-relaxed text-red-400">
                  {error}
                </p>
              ) : (
                <p className="font-mono text-[12px] text-[#656b73]">Press Send to run the request.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
