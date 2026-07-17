"use client";

import { useState, useCallback, useRef } from "react";
import { CopyButton } from "./copy-button";
import { Highlighted } from "@/lib/syntax";

const LIVE_URL = "https://api.snap-test.in";

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface Preset {
  label: string;
  method: Method;
  path: string;
  body: string;
  headers: string;
}

const presets: Preset[] = [
  {
    label: "Get Users",
    method: "GET",
    path: "/api/user/getAllUsers",
    body: "",
    headers: "",
  },
  {
    label: "Single User",
    method: "GET",
    path: "/api/user/user/101",
    body: "",
    headers: "",
  },
  {
    label: "Create User",
    method: "POST",
    path: "/api/user/addUser",
    body: `{
  "name": "Test User",
  "email": "test@dev.io",
  "job": "Developer",
  "city": "Tokyo"
}`,
    headers: "",
  },
  {
    label: "Login (JWT)",
    method: "POST",
    path: "/api/user/Login",
    body: `{
  "username": "Michael",
  "password": "Thompson"
}`,
    headers: "",
  },
  {
    label: "Protected Route",
    method: "GET",
    path: "/api/admin/authorize",
    body: "",
    headers: "Authorization: Bearer <paste_token_here>",
  },
  {
    label: "XML Users",
    method: "GET",
    path: "/api/xml/UserXML/all",
    body: "",
    headers: "",
  },
];

const methodColors: Record<Method, string> = {
  GET: "text-emerald-400",
  POST: "text-blue-400",
  PUT: "text-amber-400",
  DELETE: "text-red-400",
};

const methodBg: Record<Method, string> = {
  GET: "bg-emerald-400/10",
  POST: "bg-blue-400/10",
  PUT: "bg-amber-400/10",
  DELETE: "bg-red-400/10",
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
  const [path, setPath] = useState("/api/user/getAllUsers");
  const [body, setBody] = useState("");
  const [headers, setHeaders] = useState("");
  const [tab, setTab] = useState<"body" | "headers">("body");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
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
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  }, []);

  const send = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setResponse(null);

    const url = `${LIVE_URL}${path}`;
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

    if (body.trim() && (method === "POST" || method === "PUT")) {
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
          ? "Network error — the API might be waking up (hosted on free tier). Try again in a few seconds."
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

  const showTabs = method === "POST" || method === "PUT" || headers;

  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden terminal-glow">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a22] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-[#a8a29e]">
            Live Console
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#525252]">
          {LIVE_URL}
        </span>
      </div>

      {/* Presets */}
      <div className="flex gap-1.5 px-4 py-2.5 bg-[#13131a] border-b border-white/[0.06] overflow-x-auto">
        {presets.map((p) => {
          const active = path === p.path && method === p.method;
          return (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className={`shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-md border cursor-pointer
                transition-all duration-200
                active:scale-95
                ${
                  active
                    ? "border-[var(--accent)]/50 bg-[var(--accent)]/15 text-[var(--accent)] shadow-[0_0_8px_-3px_var(--accent)]"
                    : "border-white/[0.06] text-[#78716c] hover:text-[#d4d4d8] hover:border-white/15 hover:bg-white/[0.04]"
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
        className={`flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] transition-colors duration-300 ${
          flash ? methodBg[method] : "bg-[var(--code-bg)]"
        }`}
      >
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as Method)}
          className={`bg-transparent text-sm font-mono font-bold cursor-pointer outline-none transition-colors duration-200 ${methodColors[method]}`}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="flex-1 bg-transparent text-sm font-mono text-[var(--code-fg)] outline-none placeholder-[#525252] min-w-0 focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
          placeholder="/api/user/getAllUsers"
        />
        <button
          onClick={send}
          disabled={loading}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold cursor-pointer
            transition-all duration-200
            active:scale-95
            ${
              loading
                ? "bg-[var(--accent)]/50 text-white/50"
                : "bg-[var(--accent)] text-white hover:shadow-lg hover:shadow-[var(--ring)] hover:-translate-y-px"
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
              Sending...
            </>
          ) : (
            <>
              Send
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m5 12 14-7-4 7 4 7Z" fill="currentColor" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Body / Headers tabs */}
      <div
        className="grid-expand border-b border-white/[0.06]"
        data-open={showTabs ? "true" : "false"}
      >
        <div>
          <div className="flex bg-[#13131a] relative">
            {(method === "POST" || method === "PUT") && (
              <button
                onClick={() => setTab("body")}
                className={`relative px-4 py-2 text-[11px] font-medium cursor-pointer transition-colors duration-200 ${
                  tab === "body"
                    ? "text-[var(--accent)]"
                    : "text-[#525252] hover:text-[#a8a29e]"
                }`}
              >
                Body
                {tab === "body" && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t bg-[var(--accent)]"
                    style={{
                      animation: "tabSlide 0.25s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                )}
              </button>
            )}
            <button
              onClick={() => setTab("headers")}
              className={`relative px-4 py-2 text-[11px] font-medium cursor-pointer transition-colors duration-200 ${
                tab === "headers"
                  ? "text-[var(--accent)]"
                  : "text-[#525252] hover:text-[#a8a29e]"
              }`}
            >
              Headers
              {tab === "headers" && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t bg-[var(--accent)]"
                  style={{
                    animation: "tabSlide 0.25s cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              )}
            </button>
          </div>

          <div
            className="transition-opacity duration-200"
            style={{ opacity: flash ? 0.6 : 1 }}
          >
            {tab === "body" && (method === "POST" || method === "PUT") && (
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
              Hit Send to see the response
            </p>
          </div>
        )}

        {loading && (
          <div
            className="px-4 py-8 text-center"
            style={{ animation: "fadeIn 0.2s ease" }}
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
              Waiting for response...
            </div>
          </div>
        )}

        {error && (
          <div
            className="px-4 py-4"
            style={{ animation: "slideUp 0.3s cubic-bezier(0.16,1,0.3,1)" }}
          >
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-[12px] text-red-400 font-mono leading-relaxed">
              {error}
            </div>
          </div>
        )}

        {response && (
          <div
            style={{ animation: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1)" }}
          >
            {/* Response header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#525252]">
                  Response
                </span>
                <span
                  className={`text-xs font-mono font-bold ${statusColor}`}
                  style={{
                    animation: "popIn 0.3s cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  {response.status} {response.statusText}
                </span>
                <span
                  className={`text-xs font-mono ${timeColor}`}
                  style={{
                    animation:
                      "popIn 0.3s cubic-bezier(0.16,1,0.3,1) 0.05s both",
                  }}
                >
                  {response.time}ms
                </span>
              </div>
              <CopyButton
                text={response.body}
                className="text-[#525252] hover:text-[var(--accent)] text-xs"
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

      <style>{`
        @keyframes tabSlide {
          from { transform: scaleX(0); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
