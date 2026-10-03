"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";
import { Highlighted } from "@/lib/syntax";

const SAMPLE = JSON.stringify(
  {
    users: [
      { id: 1, name: "Alice", email: "alice@example.com", active: true },
      { id: 2, name: "Bob", email: "bob@example.com", active: false },
    ],
    meta: { total: 2, page: 1, perPage: 10 },
  },
  null,
  2
);

interface Stats {
  keys: number;
  values: number;
  depth: number;
  bytes: number;
}

function computeStats(val: unknown, depth = 0): Stats {
  if (val === null || val === undefined || typeof val !== "object") {
    return { keys: 0, values: 1, depth, bytes: 0 };
  }
  if (Array.isArray(val)) {
    let maxDepth = depth;
    let keys = 0;
    let values = 0;
    for (const item of val) {
      const s = computeStats(item, depth + 1);
      keys += s.keys;
      values += s.values;
      if (s.depth > maxDepth) maxDepth = s.depth;
    }
    return { keys, values, depth: maxDepth, bytes: 0 };
  }
  const entries = Object.entries(val);
  let maxDepth = depth;
  let keys = entries.length;
  let values = 0;
  for (const [, v] of entries) {
    const s = computeStats(v, depth + 1);
    keys += s.keys;
    values += s.values;
    if (s.depth > maxDepth) maxDepth = s.depth;
  }
  return { keys, values, depth: maxDepth, bytes: 0 };
}

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [indent, setIndent] = useState<number>(2);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const format = useCallback(
    (raw: string, space: number) => {
      if (!raw.trim()) {
        setOutput("");
        setError(null);
        setStats(null);
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        const formatted = JSON.stringify(parsed, null, space);
        setOutput(formatted);
        setError(null);
        const s = computeStats(parsed);
        s.bytes = new TextEncoder().encode(raw).length;
        setStats(s);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setOutput("");
        setError(msg);
        setStats(null);
      }
    },
    []
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => format(input, indent), 150);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [input, indent, format]);

  return (
    <ToolShell
      title="JSON formatter"
      description="Format and validate JSON. Syntax errors show where the problem is."
    >
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Input */}
        <ToolPanel
          label="Input"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInput(SAMPLE)}
                className="text-[10px] font-medium text-[var(--accent)] hover:underline cursor-pointer"
              >
                Load Example
              </button>
              <button
                onClick={() => setInput("")}
                className="text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
              >
                Clear
              </button>
            </div>
          }
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[400px] bg-[var(--code-bg)] px-4 py-3 text-[13px] font-mono text-[var(--code-fg)] resize-y outline-none leading-[1.6] placeholder-[#656b73] focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
            placeholder="Paste your JSON here..."
            spellCheck={false}
          />
        </ToolPanel>

        {/* Output */}
        <ToolPanel
          label="Output"
          dark
          actions={
            <div className="flex items-center gap-2">
              {([2, 4] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setIndent(n)}
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors duration-150 ${
                    indent === n
                      ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                      : "text-[#8d9299] hover:text-[#e1e3e5]"
                  }`}
                >
                  {n}sp
                </button>
              ))}
              <button
                onClick={() => setIndent(0)}
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors duration-150 ${
                  indent === 0
                    ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "text-[#8d9299] hover:text-[#e1e3e5]"
                }`}
              >
                Min
              </button>
              {output && (
                <CopyButton
                  text={output}
                  className="text-[#8d9299] hover:text-[#e1e3e5] text-xs"
                />
              )}
            </div>
          }
        >
          <div className="min-h-[400px] bg-[var(--code-bg)] px-4 py-3 overflow-auto">
            {output ? (
              <pre className="text-[13px] leading-[1.6] bg-transparent">
                <code className="font-mono">
                  <Highlighted code={output} lang="json" />
                </code>
              </pre>
            ) : !error ? (
              <p className="text-[13px] text-[#656b73] font-mono">
                Formatted output will appear here
              </p>
            ) : null}
          </div>
        </ToolPanel>
      </div>

      {/* Stats / Error bar */}
      <div className="mt-3 px-1 text-xs font-mono min-h-[20px]">
        {error && <span className="text-red-400">{error}</span>}
        {stats && !error && (
          <span className="text-[var(--text-muted)]">
            {stats.keys} keys &middot; {stats.values} values &middot; depth{" "}
            {stats.depth} &middot; {stats.bytes} bytes
          </span>
        )}
      </div>
    </ToolShell>
  );
}
