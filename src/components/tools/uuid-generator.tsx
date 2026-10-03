"use client";

import { useState, useCallback } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";

function formatUuid(raw: string, upper: boolean, noDashes: boolean): string {
  let out = raw;
  if (noDashes) out = out.replace(/-/g, "");
  if (upper) out = out.toUpperCase();
  return out;
}

export function UuidGenerator() {
  const [current, setCurrent] = useState(() => crypto.randomUUID());
  const [bulk, setBulk] = useState<string[]>([]);
  const [count, setCount] = useState(10);
  const [upper, setUpper] = useState(false);
  const [noDashes, setNoDashes] = useState(false);

  const generate = useCallback(() => {
    setCurrent(crypto.randomUUID());
  }, []);

  const bulkGenerate = useCallback(() => {
    const clamped = Math.max(1, Math.min(100, count));
    const ids = Array.from({ length: clamped }, () => crypto.randomUUID());
    setBulk((prev) => [...ids, ...prev]);
  }, [count]);

  const displayed = formatUuid(current, upper, noDashes);

  return (
    <ToolShell
      title="UUID generator"
      description="Generate random v4 UUIDs, one at a time or in bulk. Click one to copy it."
    >
      {/* Format toggles */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-[var(--text-muted)] mr-1">Format:</span>
        <button
          onClick={() => setUpper((u) => !u)}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-md border cursor-pointer transition-all duration-150 ${
            upper
              ? "border-[var(--accent)]/50 bg-[var(--accent)]/15 text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)]"
          }`}
        >
          Uppercase
        </button>
        <button
          onClick={() => setNoDashes((d) => !d)}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-md border cursor-pointer transition-all duration-150 ${
            noDashes
              ? "border-[var(--accent)]/50 bg-[var(--accent)]/15 text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)]"
          }`}
        >
          No dashes
        </button>
      </div>

      {/* Current UUID display */}
      <ToolPanel
        label="Generated UUID"
        dark
        actions={
          <div className="flex items-center gap-2">
            <CopyButton
              text={displayed}
              className="text-[#8d9299] hover:text-[#e1e3e5] text-xs"
            />
            <button
              onClick={generate}
              className="px-3 py-1 text-[11px] font-semibold rounded-md bg-[#f59e0b] text-[#1c1917] hover:bg-[#fbbf24] cursor-pointer transition-colors"
            >
              Generate
            </button>
          </div>
        }
      >
        <div className="bg-[var(--code-bg)] px-4 py-6 flex items-center justify-center">
          <code className="text-lg sm:text-xl font-mono text-[var(--code-fg)] select-all tracking-wide">
            {displayed}
          </code>
        </div>
      </ToolPanel>

      {/* Bulk generate */}
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-semibold text-[var(--text)]">
            Bulk Generate
          </span>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 10)}
            className="w-16 bg-[var(--surface)] border border-[var(--border)] rounded-md px-2 py-1 text-sm font-mono text-[var(--text)] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none text-center"
          />
          <button
            onClick={bulkGenerate}
            className="px-3 py-1.5 text-xs font-bold rounded-md bg-[var(--btn-bg)] text-[var(--btn-fg)] cursor-pointer transition-all duration-150 btn-press"
          >
            Generate {count}
          </button>
        </div>

        {bulk.length > 0 && (
          <ToolPanel
            label={`${bulk.length} UUIDs`}
            dark
            actions={
              <div className="flex items-center gap-2">
                <CopyButton
                  text={bulk.map((u) => formatUuid(u, upper, noDashes)).join("\n")}
                  label="Copy All"
                  className="text-[#8d9299] hover:text-[#e1e3e5] text-xs"
                />
                <button
                  onClick={() => setBulk([])}
                  className="text-[10px] font-medium text-[#656b73] hover:text-red-400 cursor-pointer transition-colors"
                >
                  Clear
                </button>
              </div>
            }
          >
            <div className="bg-[var(--code-bg)] max-h-[360px] overflow-y-auto">
              {bulk.map((uuid, i) => {
                const formatted = formatUuid(uuid, upper, noDashes);
                return (
                  <div
                    key={`${uuid}-${i}`}
                    className={`flex items-center justify-between px-4 py-1.5 font-mono text-[12px] group ${
                      i % 2 === 0 ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <code className="text-[var(--code-fg)] select-all">
                      {formatted}
                    </code>
                    <CopyButton
                      text={formatted}
                      className="text-[#8d9299] hover:text-[#e1e3e5] opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    />
                  </div>
                );
              })}
            </div>
          </ToolPanel>
        )}
      </div>
    </ToolShell>
  );
}
