"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Highlighted, type Lang } from "@/lib/syntax";
import { MethodTag } from "../method-tag";
import { CopyButton } from "../copy-button";
import { CodeExamples } from "./code-examples";
import { REASONS } from "./model";
import { ResponseView, type ResponseState } from "./response-view";
import { Section } from "./section";
import {
  GRAPHQL_URL,
  formatGraphQL,
  graphqlCurl,
  graphqlErrors,
  graphqlFetch,
  graphqlPython,
  parseVariables,
} from "./graphql-model";

export interface PlaygroundOperation {
  kind: "query" | "mutation";
  name: string;
  example: string;
}

// Fired by the "Try it" buttons beside each operation in the docs.
const LOAD_EVENT = "graphql-playground:load";
const PLAYGROUND_ID = "playground";

export function TryOperationButton({ name }: { name: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(LOAD_EVENT, { detail: name }));
        document.getElementById(PLAYGROUND_ID)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }}
      className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-md border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent-soft)] cursor-pointer"
    >
      Try it
    </button>
  );
}

/**
 * A textarea over a highlighted copy of its text. Both share one grid cell, so
 * the box grows with its content and the two layers wrap identically.
 */
function CodeEditor({
  value,
  onChange,
  onSubmit,
  lang,
  label,
  placeholder,
  minHeight,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  lang: Lang;
  label: string;
  placeholder?: string;
  minHeight: string;
}) {
  const layer = `[grid-area:1/1] m-0 px-3 py-2.5 font-mono text-[12px] leading-[1.6] whitespace-pre-wrap [overflow-wrap:anywhere] ${minHeight}`;
  return (
    <div className="grid max-h-80 overflow-auto rounded-md border border-[var(--border)] bg-[var(--code-bg)] focus-within:border-[var(--text-muted)]">
      <pre aria-hidden="true" className={`${layer} pointer-events-none text-[var(--code-fg)]`}>
        {value ? <Highlighted code={value} lang={lang} /> : <span className="text-[#8d9299]">{placeholder}</span>}
        {"\n"}
      </pre>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onSubmit();
          }
        }}
        aria-label={label}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={`${layer} resize-none overflow-hidden bg-transparent text-transparent caret-[#fafaf9] outline-none selection:bg-[#fafaf9]/20`}
      />
    </div>
  );
}

export function GraphQLPlayground({ operations }: { operations: PlaygroundOperation[] }) {
  const [selected, setSelected] = useState(operations[0]?.name ?? "");
  const [query, setQuery] = useState(() => formatGraphQL(operations[0]?.example ?? ""));
  const [variables, setVariables] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const parsed = useMemo(() => parseVariables(variables), [variables]);
  const sendable = parsed.ok ? parsed.value : undefined;
  const examples = useMemo(
    () => ({
      cURL: graphqlCurl(query, sendable),
      fetch: graphqlFetch(query, sendable),
      Python: graphqlPython(query, sendable),
    }),
    [query, sendable]
  );
  const errors = response?.done ? graphqlErrors(response.text) : [];

  function load(name: string) {
    const op = operations.find((o) => o.name === name);
    if (!op) return;
    abortRef.current?.abort();
    setSelected(name);
    setQuery(formatGraphQL(op.example));
    setVariables("");
    setResponse(null);
    setError(null);
  }

  // The handler reads the latest state through a ref, so the listener is added once.
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  useEffect(() => {
    const onLoad = (e: Event) => loadRef.current((e as CustomEvent<string>).detail);
    window.addEventListener(LOAD_EVENT, onLoad);
    return () => {
      window.removeEventListener(LOAD_EVENT, onLoad);
      abortRef.current?.abort();
    };
  }, []);

  async function send() {
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    if (!query.trim()) {
      setError("Write a query or mutation first.");
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const started = performance.now();
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.value ? { query, variables: parsed.value } : { query }),
        signal: controller.signal,
      });
      const text = await res.text();
      setResponse({
        status: res.status,
        statusText: res.statusText || REASONS[res.status] || "",
        timeMs: performance.now() - started,
        size: new TextEncoder().encode(text).length,
        headers: [...res.headers.entries()],
        contentType: res.headers.get("content-type") ?? "",
        redirected: res.redirected,
        finalUrl: res.url,
        kind: text ? "text" : "empty",
        text,
        truncated: false,
        done: true,
      });
    } catch {
      // A newer request replaced this one; leave its state alone.
      if (abortRef.current !== controller) return;
      setError(
        controller.signal.aborted
          ? "Request cancelled."
          : "The request failed before a response arrived. Check your connection and try again."
      );
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }

  const queries = operations.filter((o) => o.kind === "query");
  const mutations = operations.filter((o) => o.kind === "mutation");

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold text-[var(--text)]">Try it</h2>
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          {GRAPHQL_URL.replace("https://", "")}
        </span>
      </div>

      <Section title="Request">
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5">
            <MethodTag method="POST" />
            <code className="flex-1 min-w-0 text-[12px] font-mono text-[var(--text)] break-all">{GRAPHQL_URL}</code>
            <CopyButton text={GRAPHQL_URL} label="GraphQL URL" hideLabel className="shrink-0" />
          </div>

          <label className="block">
            <span className="block text-xs font-medium text-[var(--text-muted)] mb-2">Example</span>
            <select
              value={selected}
              onChange={(e) => load(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-[13px] font-mono text-[var(--text)] cursor-pointer"
            >
              <optgroup label="Queries">
                {queries.map((o) => (
                  <option key={o.name} value={o.name}>
                    {o.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Mutations">
                {mutations.map((o) => (
                  <option key={o.name} value={o.name}>
                    {o.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-[var(--text-muted)]">Query</h3>
              <button
                type="button"
                onClick={() => setQuery(formatGraphQL(query))}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
              >
                Prettify
              </button>
            </div>
            <CodeEditor
              value={query}
              onChange={setQuery}
              onSubmit={send}
              lang="graphql"
              label="GraphQL query"
              placeholder="query { users { id name } }"
              minHeight="min-h-32"
            />
          </div>

          <div>
            <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">Variables</h3>
            <CodeEditor
              value={variables}
              onChange={setVariables}
              onSubmit={send}
              lang="json"
              label="Variables as JSON"
              placeholder='{ "id": 101 }'
              minHeight="min-h-14"
            />
            {!parsed.ok && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{parsed.error}</p>
            )}
          </div>

          <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
            Introspection is off, so there is no autocomplete. The operations and
            types on this page list every field. Press Ctrl+Enter (⌘+Enter on a Mac) to send.
          </p>
        </div>
      </Section>

      <Section title="Code examples" defaultOpen={false}>
        <CodeExamples examples={examples} />
      </Section>

      <div className="p-4 space-y-3">
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
        {errors.length > 0 && (
          <p role="status" className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
            {errors.length === 1 ? "The response has a GraphQL error" : `The response has ${errors.length} GraphQL errors`}
            {response && response.status < 400 ? ` despite the ${response.status} status` : ""}: {errors[0]}
          </p>
        )}
        {response && <ResponseView response={response} />}
      </div>
    </div>
  );
}
