"use client";

import { useState, useMemo } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";

const EXAMPLE_ORIGINAL = `{
  "name": "snap-test.in",
  "version": "1.0.0",
  "description": "Free REST API for developers",
  "endpoints": 12,
  "auth": "JWT",
  "format": "JSON"
}`;

const EXAMPLE_MODIFIED = `{
  "name": "snap-test.in",
  "version": "2.0.0",
  "description": "Free REST API for developers and teams",
  "endpoints": 16,
  "auth": "JWT",
  "format": ["JSON", "XML"],
  "tools": 16
}`;

interface DiffLine {
  type: "equal" | "added" | "removed";
  text: string;
  oldNum: number | null;
  newNum: number | null;
}

function computeDiff(oldLines: string[], newLines: string[]): DiffLine[] {
  const m = oldLines.length;
  const n = newLines.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to produce diff
  const result: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.push({
        type: "equal",
        text: oldLines[i - 1],
        oldNum: i,
        newNum: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({
        type: "added",
        text: newLines[j - 1],
        oldNum: null,
        newNum: j,
      });
      j--;
    } else {
      result.push({
        type: "removed",
        text: oldLines[i - 1],
        oldNum: i,
        newNum: null,
      });
      i--;
    }
  }

  return result.reverse();
}

const TA_CLASS =
  "w-full min-h-[200px] bg-[var(--code-bg)] px-4 py-3 text-[13px] font-mono text-[var(--code-fg)] resize-y outline-none leading-[1.6] placeholder-[#525252] focus:outline-none focus:ring-0 focus-visible:outline-none border-none";

export function TextDiffChecker() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");

  const diff = useMemo(() => {
    if (!original && !modified) return [];
    const oldLines = original.split("\n");
    const newLines = modified.split("\n");
    return computeDiff(oldLines, newLines);
  }, [original, modified]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let equal = 0;
    for (const line of diff) {
      if (line.type === "added") added++;
      else if (line.type === "removed") removed++;
      else equal++;
    }
    return { added, removed, equal };
  }, [diff]);

  function loadExample() {
    setOriginal(EXAMPLE_ORIGINAL);
    setModified(EXAMPLE_MODIFIED);
  }

  function clear() {
    setOriginal("");
    setModified("");
  }

  return (
    <ToolShell
      title="Text diff"
      description="Paste two versions of a text to compare them line by line."
    >
      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={loadExample}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)] transition-all duration-200 cursor-pointer"
        >
          Load Example
        </button>
        <button
          onClick={clear}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)] transition-all duration-200 cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Input panels */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <ToolPanel label="Original">
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className={TA_CLASS}
            placeholder="Paste original text here..."
            spellCheck={false}
          />
        </ToolPanel>
        <ToolPanel label="Modified">
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            className={TA_CLASS}
            placeholder="Paste modified text here..."
            spellCheck={false}
          />
        </ToolPanel>
      </div>

      {/* Stats */}
      {diff.length > 0 && (
        <div className="flex flex-wrap gap-4 text-xs font-mono mb-3">
          <span className="text-emerald-500">
            +{stats.added} addition{stats.added !== 1 ? "s" : ""}
          </span>
          <span className="text-red-400">
            -{stats.removed} deletion{stats.removed !== 1 ? "s" : ""}
          </span>
          <span className="text-[var(--text-muted)]">
            {stats.equal} unchanged
          </span>
        </div>
      )}

      {/* Diff output */}
      <ToolPanel label="Diff Output" dark>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          {diff.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-[#525252] font-mono">
              Paste text in both panels to see the diff
            </div>
          ) : (
            <div className="font-mono text-[12px] leading-[1.7]">
              {diff.map((line, i) => {
                const bg =
                  line.type === "added"
                    ? "bg-emerald-500/10"
                    : line.type === "removed"
                      ? "bg-red-500/10"
                      : "";
                const color =
                  line.type === "added"
                    ? "text-emerald-400"
                    : line.type === "removed"
                      ? "text-red-400"
                      : "text-[#78716c]";
                const marker =
                  line.type === "added"
                    ? "+"
                    : line.type === "removed"
                      ? "-"
                      : " ";

                return (
                  <div key={i} className={`flex ${bg}`}>
                    <span className="w-10 text-right pr-2 text-[#525252] select-none shrink-0">
                      {line.oldNum ?? ""}
                    </span>
                    <span className="w-10 text-right pr-2 text-[#525252] select-none shrink-0">
                      {line.newNum ?? ""}
                    </span>
                    <span
                      className={`w-6 text-center select-none shrink-0 ${color}`}
                    >
                      {marker}
                    </span>
                    <span className={`flex-1 px-2 ${color} whitespace-pre`}>
                      {line.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ToolPanel>
    </ToolShell>
  );
}
