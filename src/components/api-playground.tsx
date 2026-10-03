"use client";

import { useState } from "react";
import Link from "next/link";
import { BASE_URL, bodyLang, type Method } from "@/lib/api-config";
import { type Lang } from "@/lib/syntax";
import { groupIcon } from "@/lib/group-icons";
import { CodeViewer } from "./code-viewer";
import { CopyButton } from "./copy-button";
import { Icon } from "./icon";
import { MethodTag } from "./method-tag";

export interface PlaygroundEndpoint {
  key: string;
  href: string;
  method: Method;
  path: string;
  summary: string;
  curl: string;
  requestBody?: string;
  status: string;
  headers: [string, string][];
  response: string;
}

export interface PlaygroundGroup {
  id: string;
  title: string;
  endpoints: PlaygroundEndpoint[];
}

type View = "response" | "headers" | "body" | "curl" | "javascript";

const VIEW_LABELS: Record<View, string> = {
  response: "Response",
  headers: "Headers",
  body: "Request body",
  curl: "cURL",
  javascript: "JavaScript",
};

function statusTone(status: string) {
  const code = Number(status.slice(0, 3));
  if (code >= 400) return "bg-red-500/10 text-red-700 dark:text-red-400";
  if (code >= 300) return "bg-sky-500/10 text-sky-700 dark:text-sky-400";
  return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
}

const isJson = (text: string) => /^\s*[[{]/.test(text);

// The example request as fetch, with the headers from its curl command.
function toJavaScript(ep: PlaygroundEndpoint) {
  const headers: [string, string][] = [];
  for (const m of ep.curl.matchAll(/-H\s+(["'])(.*?)\1/g)) {
    const i = m[2].indexOf(":");
    if (i > 0) headers.push([m[2].slice(0, i).trim(), m[2].slice(i + 1).trim()]);
  }
  const body = ep.requestBody;
  if (body && !headers.some(([k]) => k.toLowerCase() === "content-type")) {
    headers.push(["Content-Type", isJson(body) ? "application/json" : bodyLang(body) === "xml" ? "application/xml" : "text/plain"]);
  }

  const opts: string[] = [];
  if (ep.method !== "GET") opts.push(`method: ${JSON.stringify(ep.method)}`);
  if (headers.length) {
    opts.push(`headers: {\n${headers.map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n")}\n  }`);
  }
  if (body) {
    opts.push(
      isJson(body)
        ? `body: JSON.stringify(${body.trim().replace(/\n/g, "\n  ")})`
        : `body: ${JSON.stringify(body)}`
    );
  }
  const url = JSON.stringify(BASE_URL + ep.path);
  const call = opts.length ? `const res = await fetch(${url}, {\n  ${opts.join(",\n  ")},\n});` : `const res = await fetch(${url});`;
  const read = isJson(ep.response) ? "await res.json()" : "await res.text()";
  return `${call}\nconsole.log(res.status, ${read});`;
}

function viewContent(ep: PlaygroundEndpoint, view: View): { code: string; lang: Lang } {
  switch (view) {
    case "headers":
      return {
        code: ep.headers.length ? ep.headers.map(([k, v]) => `${k}: ${v}`).join("\n") : "No headers in this example.",
        lang: "text",
      };
    case "body":
      return { code: ep.requestBody ?? "", lang: bodyLang(ep.requestBody ?? "") };
    case "curl":
      return { code: ep.curl, lang: "curl" };
    case "javascript":
      return { code: toJavaScript(ep), lang: "javascript" };
    default:
      return { code: ep.response, lang: bodyLang(ep.response) };
  }
}

// Selected items: amber tint, with an amber bar on the left in the sidebar.
const selectedRow = "bg-amber-500/10 text-[var(--text)]";
const idleRow = "text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]";

export function APIPlayground({
  groups,
  resources,
  tabs,
}: {
  groups: PlaygroundGroup[];
  /** Group ids listed in the sidebar. */
  resources: string[];
  /** Group ids shown as tabs above the request. */
  tabs: string[];
}) {
  const byId = new Map(groups.map((g) => [g.id, g]));
  const [groupId, setGroupId] = useState(tabs[0] ?? resources[0]);
  const [endpointIdx, setEndpointIdx] = useState(0);
  const [view, setView] = useState<View>("response");

  const group = byId.get(groupId) ?? groups[0];
  const endpoint = group.endpoints[Math.min(endpointIdx, group.endpoints.length - 1)];
  const views: View[] = ["response", "headers", ...(endpoint.requestBody ? (["body"] as const) : []), "curl", "javascript"];
  const activeView = views.includes(view) ? view : "response";
  const content = viewContent(endpoint, activeView);
  const fullUrl = BASE_URL + endpoint.path;

  function selectGroup(id: string) {
    setGroupId(id);
    setEndpointIdx(0);
  }

  return (
    <div className="grid md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[210px_minmax(0,1fr)] rounded-[10px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Resource sidebar */}
      {/* The list scrolls inside the column, so its length never sets the explorer's height. */}
      <nav aria-label="Resources" className="relative hidden md:block border-r border-[var(--border)]">
        <div className="absolute inset-0 overflow-y-auto p-2">
          <p className="px-2.5 pt-1.5 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Resources
          </p>
          <ul className="space-y-0.5">
            {resources.map((id) => {
              const g = byId.get(id);
              if (!g) return null;
              const active = id === group.id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => selectGroup(id)}
                    aria-pressed={active}
                    className={`relative flex w-full items-center gap-2.5 rounded-md px-2.5 h-8 text-left text-[13px] cursor-pointer transition-colors duration-150 ${active ? selectedRow : idleRow}`}
                  >
                    {active && <span aria-hidden="true" className="absolute -left-2 top-1.5 bottom-1.5 w-[2px] bg-[var(--accent)]" />}
                    <Icon
                      name={groupIcon(id)}
                      size={15}
                      className={active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}
                    />
                    <span className="flex-1 truncate">{g.title}</span>
                    <span className="font-mono text-[11px] tabular-nums text-[var(--text-muted)]">{g.endpoints.length}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="min-w-0">
        {/* Phones get the resource list as a dropdown */}
        <label className="md:hidden flex items-center gap-2 px-4 pt-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Resource
          </span>
          <select
            value={resources.includes(group.id) ? group.id : ""}
            onChange={(e) => selectGroup(e.target.value)}
            className="flex-1 min-w-0 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-[13px] text-[var(--text)] cursor-pointer"
          >
            {!resources.includes(group.id) && (
              <option value="" disabled>
                {group.title}
              </option>
            )}
            {resources.map((id) => {
              const g = byId.get(id);
              return g ? (
                <option key={id} value={id}>
                  {g.title} ({g.endpoints.length})
                </option>
              ) : null;
            })}
          </select>
        </label>

        {/* Popular groups */}
        <div aria-label="Popular groups" role="group" className="flex overflow-x-auto border-b border-[var(--border)] px-2">
          {tabs.map((id) => {
            const g = byId.get(id);
            if (!g) return null;
            const active = id === group.id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => selectGroup(id)}
                aria-pressed={active}
                className={`relative shrink-0 px-3 py-3 text-[13px] whitespace-nowrap cursor-pointer transition-colors duration-150 ${
                  active ? "text-[var(--text)] font-medium" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {g.title}
                {active && <span aria-hidden="true" className="absolute bottom-0 left-3 right-3 h-[2px] bg-[var(--accent)]" />}
              </button>
            );
          })}
        </div>

        {/* Request bar */}
        <div className="mx-3 sm:mx-4 mt-3 sm:mt-4 flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg)] py-1.5 pl-2.5 pr-1.5">
          <MethodTag method={endpoint.method} />
          <code className="flex-1 min-w-0 truncate font-mono text-[12px] sm:text-[13px] text-[var(--text)]" title={fullUrl}>
            {fullUrl}
          </code>
          <CopyButton
            text={fullUrl}
            label="request URL"
            hideLabel
            className="shrink-0 size-8 justify-center rounded-md border border-[var(--border)] hover:bg-[var(--accent-soft)]"
          />
          <Link
            href={endpoint.href}
            className="shrink-0 hidden sm:inline-flex items-center gap-1 h-8 rounded-md border border-[var(--border)] px-2.5 text-xs text-[var(--text)] hover:bg-[var(--accent-soft)] transition-colors duration-150"
          >
            Open in docs
            <Icon name="arrowUpRight" size={12} />
          </Link>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] gap-y-3 p-3 sm:p-4">
          {/* Endpoints */}
          <div className="lg:pr-4 lg:border-r border-[var(--border)]">
            <p className="text-xs leading-relaxed text-[var(--text-muted)] mb-2 min-h-8">
              {endpoint.summary}{" "}
              <Link href={endpoint.href} className="sm:hidden link-underline text-[var(--text)]">
                Open in docs
              </Link>
            </p>
            <ul className="max-h-56 lg:max-h-[23rem] overflow-y-auto space-y-0.5">
              {group.endpoints.map((ep, i) => {
                const active = ep === endpoint;
                return (
                  <li key={ep.key}>
                    <button
                      type="button"
                      onClick={() => setEndpointIdx(i)}
                      aria-pressed={active}
                      title={ep.summary}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left cursor-pointer transition-colors duration-150 ${active ? selectedRow : idleRow}`}
                    >
                      <MethodTag method={ep.method} />
                      <span className="truncate font-mono text-[12px]">{ep.path.replace(/^\/api/, "")}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Example response, headers and code */}
          <div className="min-w-0 lg:pl-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)]">
              <div role="group" aria-label="Example view" className="flex flex-1 min-w-0 overflow-x-auto">
                {views.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    aria-pressed={activeView === v}
                    className={`relative shrink-0 px-2.5 py-2 text-xs whitespace-nowrap cursor-pointer transition-colors duration-150 ${
                      activeView === v ? "text-[var(--text)] font-medium" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {VIEW_LABELS[v]}
                    {activeView === v && <span aria-hidden="true" className="absolute -bottom-px left-2.5 right-2.5 h-[2px] bg-[var(--accent)]" />}
                  </button>
                ))}
              </div>
              <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] ${statusTone(endpoint.status)}`}>
                {endpoint.status}
              </span>
              <CopyButton text={content.code} label={VIEW_LABELS[activeView]} hideLabel className="shrink-0 p-1" />
            </div>
            <CodeViewer code={content.code} lang={content.lang} className="mt-3 h-72 lg:h-[23rem] rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
