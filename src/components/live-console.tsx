"use client";

import { useState, useCallback, useRef } from "react";
import { CopyButton } from "./copy-button";
import { Highlighted } from "@/lib/syntax";
import { BASE_URL } from "@/lib/api-config";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function sendsBody(method: Method) {
  return method === "POST" || method === "PUT" || method === "PATCH";
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

const methodColors: Record<Method, string> = {
  GET: "text-emerald-400",
  POST: "text-blue-400",
  PUT: "text-amber-400",
  PATCH: "text-teal-400",
  DELETE: "text-red-400",
};

interface ResponseData {
  status: number;
  statusText: string;
  time: number;
  body: string;
  isXml: boolean;
}

export function LiveConsole() {
  const [method, setMethod] = useState<Method>("GET");
  const [path, setPath] = useState("/api/Products?limit=3");
  const [body, setBody] = useState("");
  const [headers, setHeaders] = useState("");
  const [tab, setTab] = useState<"body" | "headers">("body");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const applyPreset = useCallback((p: Preset) => {
    setMethod(p.method);
    setPath(p.path);
    setBody(p.body);
    setHeaders(p.headers);
    setResponse(null);
    setError(null);
    if (p.body) setTab("body");
    if (p.headers) setTab("headers");
  }, []);

  const send = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setResponse(null);

    const url = `${BASE_URL}${path}`;
    const opts: RequestInit = {
      method,
      signal: controller.signal,
    };

    const parsedHeaders: Record<string, string> = {};
    if (headers.trim()) {
      for (const line of headers.split("\n")) {
        const idx = line.indexOf(":");
        if (idx > 0) {
          parsedHeaders[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
        }
      }
    }

    if (body.trim() && sendsBody(method)) {
      opts.body = body;
      if (body.trimStart().startsWith("<")) {
        parsedHeaders["Content-Type"] =
          parsedHeaders["Content-Type"] || "application/xml";
      } else {
        parsedHeaders["Content-Type"] =
          parsedHeaders["Content-Type"] || "application/json";
      }
    }

    if (Object.keys(parsedHeaders).length > 0) {
      opts.headers = parsedHeaders;
    }

    const t0 = performance.now();

    try {
      const res = await fetch(url, opts);
      const t1 = performance.now();
      const text = await res.text();

      let formatted = text;
      try {
        const json = JSON.parse(text);
        formatted = JSON.stringify(json, null, 2);
      } catch {}

      setResponse({
        status: res.status,
        statusText: res.statusText,
        time: Math.round(t1 - t0),
        body: formatted,
        isXml: formatted.trimStart().startsWith("<"),
      });
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      const msg =
        err instanceof TypeError
          ? "Network error. The server may be starting up after being idle. Try again in a few seconds."
          : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [method, path, body, headers]);

  const statusColor =
    response && response.status < 300
      ? "text-emerald-400"
      : response && response.status < 400
        ? "text-amber-400"
        : "text-red-400";

  const timeColor =
    response && response.time < 300
      ? "text-emerald-400"
      : response && response.time < 800
        ? "text-amber-400"
        : "text-red-400";

  const showTabs = sendsBody(method) || headers;

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden terminal-glow">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161616] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#d6d3d1]">
            Console
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#525252]">
          {BASE_URL}
        </span>
      </div>

      {/* Presets */}
      <div className="flex gap-1.5 px-4 py-2.5 bg-[#111111] border-b border-white/[0.06] overflow-x-auto">
        {presets.map((p) => {
          const active = path === p.path && method === p.method;
          return (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className={`shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-md border cursor-pointer
                transition-colors
                ${
                  active
                    ? "border-white/20 bg-white/[0.08] text-[#fafaf9]"
                    : "border-white/[0.08] text-[#a8a29e] hover:text-[#e7e5e4] hover:border-white/15"
                }
              `}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* URL bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-[var(--code-bg)]"
      >
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as Method)}
          className={`bg-transparent text-sm font-mono font-bold cursor-pointer outline-none transition-colors duration-200 ${methodColors[method]}`}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="flex-1 bg-transparent text-sm font-mono text-[var(--code-fg)] outline-none placeholder-[#525252] min-w-0 focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
          placeholder="/api/Products?limit=3"
        />
        <button
          onClick={send}
          disabled={loading}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer
            transition-colors
            ${
              loading
                ? "bg-white/10 text-white/50"
                : "bg-[#f59e0b] text-[#1c1917] hover:bg-[#fbbf24]"
            }
          `}
        >
          {loading ? (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Sending
            </>
          ) : (
            "Send"
          )}
        </button>
      </div>

      {/* Body / Headers tabs */}
      <div
        className="grid-expand border-b border-white/[0.06]"
        data-open={showTabs ? "true" : "false"}
      >
        <div>
          <div className="flex bg-[#111111] relative">
            {sendsBody(method) && (
              <button
                onClick={() => setTab("body")}
                className={`relative px-4 py-2 text-[11px] font-medium cursor-pointer transition-colors duration-200 ${
                  tab === "body"
                    ? "text-[#fafaf9]"
                    : "text-[#78716c] hover:text-[#e7e5e4]"
                }`}
              >
                Body
                {tab === "body" && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#f59e0b]"
                  />
                )}
              </button>
            )}
            <button
              onClick={() => setTab("headers")}
              className={`relative px-4 py-2 text-[11px] font-medium cursor-pointer transition-colors duration-200 ${
                tab === "headers"
                  ? "text-[#fafaf9]"
                  : "text-[#78716c] hover:text-[#e7e5e4]"
              }`}
            >
              Headers
              {tab === "headers" && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#f59e0b]"
                />
              )}
            </button>
          </div>

          <div>
            {tab === "body" && sendsBody(method) && (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="w-full bg-[var(--code-bg)] px-4 py-3 text-[12px] font-mono text-[var(--code-fg)] resize-none outline-none leading-[1.6] placeholder-[#525252] focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
                placeholder='{"name": "...", "email": "..."}'
                spellCheck={false}
              />
            )}
            {tab === "headers" && (
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                rows={3}
                className="w-full bg-[var(--code-bg)] px-4 py-3 text-[12px] font-mono text-[var(--code-fg)] resize-none outline-none leading-[1.6] placeholder-[#525252] focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
                placeholder="Authorization: Bearer <token>"
                spellCheck={false}
              />
            )}
          </div>
        </div>
      </div>

      {/* Response area */}
      <div className="bg-[var(--code-bg)]">
        {!response && !error && !loading && (
          <div className="px-4 py-8 text-center">
            <p className="text-[13px] text-[#525252] font-mono">
              Press Send to run the request.
            </p>
          </div>
        )}

        {loading && (
          <div
            className="px-4 py-8 text-center"
          >
            <div className="inline-flex items-center gap-2 text-[13px] text-[#a8a29e] font-mono">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Waiting for response
            </div>
          </div>
        )}

        {error && (
          <div
            className="px-4 py-4"
          >
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-[12px] text-red-400 font-mono leading-relaxed">
              {error}
            </div>
          </div>
        )}

        {response && (
          <div
          >
            {/* Response header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-[#525252]">
                  Response
                </span>
                <span
                  className={`text-xs font-mono font-bold ${statusColor}`}
                >
                  {response.status} {response.statusText}
                </span>
                <span
                  className={`text-xs font-mono ${timeColor}`}
                >
                  {response.time}ms
                </span>
              </div>
              <CopyButton
                text={response.body}
                className="text-[#78716c] hover:text-[#e7e5e4] text-xs"
              />
            </div>

            {/* Response body */}
            <div className="px-4 py-3 overflow-x-auto max-h-80 overflow-y-auto">
              <pre className="text-[12px] leading-[1.6] bg-transparent">
                <code className="font-mono">
                  <Highlighted
                    code={response.body}
                    lang={response.isXml ? "xml" : "json"}
                  />
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
