"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BASE_URL, type Endpoint, type Method } from "@/lib/api-config";
import { CopyButton } from "../copy-button";
import { MethodTag } from "../method-tag";
import { CodeExamples } from "./code-examples";
import { ResponseView, type ResponseState } from "./response-view";
import { Section } from "./section";
import { WebSocketPanel } from "./ws-panel";
import {
  FORBIDDEN_HEADERS,
  PLACEHOLDERS,
  REASONS,
  buildUrl,
  fill,
  initialState,
  loadCredentials,
  methodHasBody,
  newId,
  placeholdersIn,
  saveCredentials,
  sendableHeaders,
  toCurl,
  toFetch,
  toPython,
  valuesForSend,
  type Credentials,
  type RequestState,
  type Row,
} from "./model";

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-[13px] font-mono text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-muted)]";

const MAX_TEXT = 2 * 1024 * 1024;
const COLLAPSED_ROWS = 5;
const FILE_TYPES = /pdf|octet-stream|zip|gzip|brotli|x-tar|audio\/|video\/|font\/|msword|officedocument/;

function FieldLabel({ name, meta, required, title }: { name: string; meta?: string; required?: boolean; title?: string }) {
  return (
    <span className="flex items-baseline justify-between gap-2 mb-1" title={title}>
      <span className="text-xs font-mono text-[var(--text)]">
        {name}
        {required && <span className="ml-1.5 font-sans text-[11px] text-[var(--accent)]">required</span>}
      </span>
      {meta && <span className="text-[11px] text-[var(--text-muted)] truncate">{meta}</span>}
    </span>
  );
}

function RowsEditor({
  rows,
  onChange,
  addLabel,
  collapsible,
  forbiddenCheck,
}: {
  rows: Row[];
  onChange: (rows: Row[]) => void;
  addLabel: string;
  collapsible?: boolean;
  forbiddenCheck?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible =
    collapsible && !showAll
      ? rows.filter((r, i) => i < COLLAPSED_ROWS || r.value !== "" || r.custom)
      : rows;
  const update = (id: number, patch: Partial<Row>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-2.5">
      {visible.map((r) => {
        const blocked = forbiddenCheck && FORBIDDEN_HEADERS.has(r.key.toLowerCase());
        return (
          <div key={r.id}>
            {r.doc ? (
              <label className="block">
                <FieldLabel
                  name={r.key}
                  required={r.doc.required}
                  meta={r.doc.type}
                  title={r.doc.description}
                />
                <input
                  value={r.value}
                  onChange={(e) => update(r.id, { value: e.target.value })}
                  placeholder={r.doc.default ?? ""}
                  className={inputClass}
                />
              </label>
            ) : (
              <div className="flex gap-1.5">
                <input
                  value={r.key}
                  onChange={(e) => update(r.id, { key: e.target.value })}
                  placeholder="Name"
                  aria-label="Name"
                  className={`${inputClass} w-2/5`}
                />
                <input
                  value={r.value}
                  onChange={(e) => update(r.id, { value: e.target.value })}
                  placeholder="Value"
                  aria-label={`${r.key || "Parameter"} value`}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => onChange(rows.filter((x) => x.id !== r.id))}
                  aria-label={`Remove ${r.key || "row"}`}
                  className="px-2 text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {blocked && (
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                Browsers do not let pages set this header, so it is not sent.
              </p>
            )}
          </div>
        );
      })}
      <div className="flex items-center gap-4 text-xs">
        {collapsible && rows.length > COLLAPSED_ROWS && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="link-underline text-[var(--text)] cursor-pointer"
          >
            {showAll ? "Show fewer" : `Show all ${rows.length}`}
          </button>
        )}
        <button
          type="button"
          onClick={() => onChange([...rows, { id: newId(), key: "", value: "", custom: true }])}
          className="text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
        >
          + {addLabel}
        </button>
      </div>
    </div>
  );
}

function notesFor(endpoint: Endpoint, groupId: string): string[] {
  const notes: string[] = [];
  const auth = endpoint.auth?.toLowerCase() ?? "";
  if (endpoint.request.digest) {
    notes.push("Digest authentication needs the browser's own login prompt. Open the URL in a new tab to try it, or use the curl example.");
  }
  if (groupId === "cookies" || auth.includes("cookie") || auth.includes("csrf")) {
    notes.push("Browsers do not send cookies to another site, so endpoints that read cookies will not see them from this page. The curl example works.");
  }
  if (groupId === "redirect") {
    notes.push("The browser follows redirects, so you see the final response. Run the curl example with -i to see each redirect.");
  }
  if (groupId === "chaos") {
    notes.push("These endpoints fail or stall on purpose, some for up to 60 seconds. Use Cancel to stop waiting.");
  }
  if (groupId === "streaming") {
    notes.push("The response is shown as it arrives.");
  }
  return notes;
}

export function TryIt({ endpoint, groupId }: { endpoint: Endpoint; groupId: string }) {
  const isWebSocket = endpoint.path.startsWith("/ws/");
  const [state, setState] = useState<RequestState>(() => initialState(endpoint));
  const [creds, setCreds] = useState<Credentials>({});
  const [fetching, setFetching] = useState<string | null>(null);
  const [credError, setCredError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Saved credentials live in this browser only; read them after hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCreds(loadCredentials());
  }, []);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    []
  );

  const placeholders = useMemo(
    () =>
      placeholdersIn([
        ...state.headers.map((r) => r.value),
        ...state.query.map((r) => r.value),
        ...Object.values(state.pathValues),
        ...state.form.map((f) => f.value),
        state.body,
      ]),
    [state]
  );
  const entered = placeholders.filter((p) => !PLACEHOLDERS[p].generated);
  const generated = placeholders.filter((p) => PLACEHOLDERS[p].generated);
  const pathNames = Object.keys(state.pathValues);
  const bodyType = endpoint.request.bodyType;
  const hasBody = methodHasBody(state.method) && bodyType !== null;
  const notes = notesFor(endpoint, groupId);

  const examples = useMemo(
    () => ({
      cURL: toCurl(endpoint, state, creds),
      fetch: toFetch(endpoint, state, creds),
      Python: toPython(endpoint, state, creds),
    }),
    [endpoint, state, creds]
  );

  function setCredential(name: string, value: string) {
    const next = { ...creds, [name]: value };
    setCreds(next);
    saveCredentials(next);
  }

  async function fetchCredential(name: string) {
    const info = PLACEHOLDERS[name];
    if (!info.fetch) return;
    setFetching(name);
    setCredError(null);
    try {
      const values = await info.fetch();
      const next = { ...creds, ...values };
      setCreds(next);
      saveCredentials(next);
    } catch (e) {
      setCredError(`Could not get ${info.label.toLowerCase()}: ${(e as Error).message}`);
    } finally {
      setFetching(null);
    }
  }

  function clearCredentials() {
    setCreds({});
    saveCredentials({});
  }

  async function send() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const values = await valuesForSend(state, creds);
      const url = buildUrl(endpoint, state, values);
      const headers = new Headers(sendableHeaders(state, values));
      let body: BodyInit | undefined;
      if (hasBody) {
        if (bodyType === "form") {
          body = new URLSearchParams(state.form.map((f) => [f.key, fill(f.value, values)]));
        } else if (bodyType === "multipart") {
          const form = new FormData();
          for (const f of state.form) {
            if (f.isFile) {
              form.append(f.key, f.file ?? new Blob(["Sample file from testingapis.com\n"], { type: "text/plain" }), f.file?.name ?? f.value);
            } else {
              form.append(f.key, fill(f.value, values));
            }
          }
          headers.delete("content-type");
          body = form;
        } else if (bodyType === "binary") {
          body = state.binary ?? new Blob([crypto.getRandomValues(new Uint8Array(1024))]);
        } else if (state.body) {
          body = fill(state.body, values);
        }
      }

      const started = performance.now();
      const res = await fetch(url, { method: state.method, headers, body, signal: controller.signal });
      const contentType = res.headers.get("content-type") ?? "";
      const base: ResponseState = {
        status: res.status,
        statusText: res.statusText || REASONS[res.status] || "",
        timeMs: performance.now() - started,
        size: 0,
        headers: [...res.headers.entries()],
        contentType,
        redirected: res.redirected,
        finalUrl: res.url,
        kind: "text",
        text: "",
        truncated: false,
        done: false,
      };

      if (state.method === "HEAD" || res.status === 204 || res.status === 304 || !res.body) {
        setResponse({ ...base, kind: "empty", done: true });
        return;
      }

      if (contentType.startsWith("image/") || FILE_TYPES.test(contentType)) {
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;
        const disposition = res.headers.get("content-disposition") ?? "";
        const fileName =
          disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)/i)?.[1] ??
          endpoint.path.split("/").pop()?.replace(/[{}]/g, "") ??
          "download";
        setResponse({
          ...base,
          kind: contentType.startsWith("image/") ? "image" : "file",
          objectUrl,
          fileName,
          size: blob.size,
          timeMs: performance.now() - started,
          done: true,
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      let size = 0;
      let truncated = false;
      setResponse(base);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (text.length < MAX_TEXT) {
          text += decoder.decode(value, { stream: true });
        } else {
          truncated = true;
        }
        setResponse({ ...base, text, size, truncated, timeMs: performance.now() - started });
      }
      text += decoder.decode();
      setResponse({ ...base, text, size, truncated, timeMs: performance.now() - started, done: true });
    } catch {
      // A newer request replaced this one; leave its state alone.
      if (abortRef.current !== controller) return;
      if (controller.signal.aborted) {
        setError("Request cancelled.");
      } else {
        setError(
          "The request failed before a complete response arrived. The server may have closed the connection, the network may be down, or the browser blocked the request."
        );
      }
      setResponse((r) => (r ? { ...r, done: true } : r));
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }

  const methodSelect =
    endpoint.methods.length > 1 ? (
      <select
        value={state.method}
        onChange={(e) => setState({ ...state, method: e.target.value as Method })}
        aria-label="Method"
        className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs font-mono text-[var(--text)] cursor-pointer"
      >
        {endpoint.methods.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    ) : (
      <MethodTag method={state.method} />
    );

  const previewUrl = buildUrl(endpoint, state, creds);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold text-[var(--text)]">Try it</h2>
        <span className="text-[11px] font-mono text-[var(--text-muted)]">{BASE_URL.replace("https://", "")}</span>
      </div>

      {isWebSocket ? (
        <div className="p-4">
          <WebSocketPanel path={endpoint.exampleRequest.path} />
        </div>
      ) : (
        <>
          <Section title="Code examples">
            <CodeExamples examples={examples} />
          </Section>

          {(endpoint.auth || entered.length > 0 || generated.length > 0) && (
            <Section title="Authentication">
              {endpoint.auth && <p className="text-[13px] text-[var(--text-muted)] mb-3">{endpoint.auth}</p>}
              <div className="space-y-3">
                {entered.map((name) => {
                  const info = PLACEHOLDERS[name];
                  return (
                    <div key={name}>
                      <FieldLabel name={info.label} meta={`{{${name}}}`} />
                      <div className="flex gap-1.5">
                        <input
                          value={creds[name] ?? ""}
                          onChange={(e) => setCredential(name, e.target.value)}
                          placeholder="Paste a value or get one"
                          aria-label={info.label}
                          className={inputClass}
                        />
                        {info.fetch && (
                          <button
                            type="button"
                            onClick={() => fetchCredential(name)}
                            disabled={fetching !== null}
                            className="shrink-0 px-3 rounded-md border border-[var(--border)] text-xs text-[var(--text)] enabled:hover:bg-[var(--accent-soft)] disabled:opacity-60 cursor-pointer"
                          >
                            {fetching === name ? "Getting…" : "Get"}
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--text-muted)]">{info.hint}</p>
                    </div>
                  );
                })}
                {generated.map((name) => (
                  <p key={name} className="text-[11px] text-[var(--text-muted)]">
                    <code className="font-mono text-[var(--text)]">{`{{${name}}}`}</code>: {PLACEHOLDERS[name].hint}
                  </p>
                ))}
              </div>
              {credError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{credError}</p>}
              {entered.length > 0 && Object.keys(creds).length > 0 && (
                <button
                  type="button"
                  onClick={clearCredentials}
                  className="mt-3 text-xs text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  Clear saved credentials
                </button>
              )}
            </Section>
          )}

          <Section title="Request">
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5">
                {methodSelect}
                <code className="flex-1 min-w-0 text-[12px] font-mono text-[var(--text)] break-all">{previewUrl}</code>
                <CopyButton text={previewUrl} label="request URL" hideLabel className="shrink-0" />
              </div>

              {pathNames.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-medium text-[var(--text-muted)]">Path</h3>
                  {pathNames.map((name) => {
                    const doc = endpoint.params.find((p) => p.in === "path" && p.name === name);
                    return (
                      <label key={name} className="block">
                        <FieldLabel name={name} required meta={doc?.type} title={doc?.description} />
                        <input
                          value={state.pathValues[name]}
                          onChange={(e) =>
                            setState({ ...state, pathValues: { ...state.pathValues, [name]: e.target.value } })
                          }
                          className={inputClass}
                        />
                      </label>
                    );
                  })}
                </div>
              )}

              <div>
                <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">Query</h3>
                <RowsEditor
                  rows={state.query}
                  onChange={(query) => setState({ ...state, query })}
                  addLabel="Add query parameter"
                  collapsible
                />
              </div>

              <div>
                <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">Headers</h3>
                <RowsEditor
                  rows={state.headers}
                  onChange={(headers) => setState({ ...state, headers })}
                  addLabel="Add header"
                  forbiddenCheck
                />
              </div>

              {hasBody && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-medium text-[var(--text-muted)]">Body</h3>
                    {bodyType === "raw" && /^\s*[[{]/.test(state.body) && (
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            setState({ ...state, body: JSON.stringify(JSON.parse(state.body), null, 2) });
                          } catch {
                            // Leave text that is not valid JSON as it is.
                          }
                        }}
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                      >
                        Format JSON
                      </button>
                    )}
                  </div>
                  {bodyType === "raw" && (
                    <textarea
                      value={state.body}
                      onChange={(e) => setState({ ...state, body: e.target.value })}
                      rows={Math.min(16, Math.max(4, state.body.split("\n").length + 1))}
                      spellCheck={false}
                      aria-label="Request body"
                      className={`${inputClass} resize-y leading-[1.6]`}
                    />
                  )}
                  {(bodyType === "form" || bodyType === "multipart") && (
                    <div className="space-y-2.5">
                      {state.form.map((f) => (
                        <label key={f.id} className="block">
                          <FieldLabel name={f.key} meta={f.isFile ? "file" : undefined} />
                          {f.isFile ? (
                            <input
                              type="file"
                              onChange={(e) =>
                                setState({
                                  ...state,
                                  form: state.form.map((x) =>
                                    x.id === f.id ? { ...x, file: e.target.files?.[0] ?? null } : x
                                  ),
                                })
                              }
                              className="block w-full text-xs text-[var(--text-muted)] file:mr-3 file:rounded-md file:border file:border-[var(--border)] file:bg-[var(--bg)] file:px-2.5 file:py-1 file:text-[var(--text)]"
                            />
                          ) : (
                            <input
                              value={f.value}
                              onChange={(e) =>
                                setState({
                                  ...state,
                                  form: state.form.map((x) => (x.id === f.id ? { ...x, value: e.target.value } : x)),
                                })
                              }
                              className={inputClass}
                            />
                          )}
                        </label>
                      ))}
                      {bodyType === "multipart" && state.form.some((f) => f.isFile && !f.file) && (
                        <p className="text-[11px] text-[var(--text-muted)]">
                          Without a chosen file, a small sample text file is sent.
                        </p>
                      )}
                    </div>
                  )}
                  {bodyType === "binary" && (
                    <div>
                      <input
                        type="file"
                        onChange={(e) => setState({ ...state, binary: e.target.files?.[0] ?? null })}
                        aria-label="File to send"
                        className="block w-full text-xs text-[var(--text-muted)] file:mr-3 file:rounded-md file:border file:border-[var(--border)] file:bg-[var(--bg)] file:px-2.5 file:py-1 file:text-[var(--text)]"
                      />
                      {!state.binary && (
                        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                          Without a chosen file, 1 KB of random bytes is sent.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          <div className="p-4 space-y-3">
            {notes.map((n) => (
              <p key={n} className="text-xs leading-relaxed text-[var(--text-muted)]">
                {n}
              </p>
            ))}
            {endpoint.request.digest && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center h-9 leading-9 rounded-md border border-[var(--border)] text-sm text-[var(--text)] hover:bg-[var(--accent-soft)]"
              >
                Open in a new tab
              </a>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={send}
                className="flex-1 h-10 rounded-md bg-[var(--btn-bg)] text-[var(--btn-fg)] text-sm font-medium hover:bg-[var(--btn-hover)] cursor-pointer"
              >
                {loading ? "Sending…" : "Send request"}
              </button>
              {loading && (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  className="px-4 h-10 rounded-md border border-[var(--border)] text-sm text-[var(--text)] hover:bg-[var(--accent-soft)] cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
            {error && (
              <p role="alert" className="text-xs leading-relaxed text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            {response && <ResponseView response={response} />}
          </div>
        </>
      )}
    </div>
  );
}
