"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";

interface MatchResult {
  full: string;
  index: number;
  end: number;
  groups: string[];
}

const FLAG_OPTIONS = [
  { flag: "g", label: "global" },
  { flag: "i", label: "case-insensitive" },
  { flag: "m", label: "multiline" },
  { flag: "s", label: "dotAll" },
];

const PRESETS = [
  {
    label: "Email",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    flags: "g",
    test: "Contact us at hello@snap-test.in or support@example.com for help.",
  },
  {
    label: "URL",
    pattern: "https?:\\/\\/[^\\s]+",
    flags: "g",
    test: "Visit https://snap-test.in or http://example.com/path?q=1 for more.",
  },
  {
    label: "IP Address",
    pattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b",
    flags: "g",
    test: "Server at 192.168.1.1 responded. Backup at 10.0.0.255 is down.",
  },
  {
    label: "Phone",
    pattern: "\\+?\\d{1,3}[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}",
    flags: "g",
    test: "Call +1 (555) 123-4567 or 555.987.6543 for support.",
  },
];

const GROUP_COLORS = [
  { bg: "bg-sky-500/20", text: "text-sky-400" },
  { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  { bg: "bg-amber-500/20", text: "text-amber-400" },
  { bg: "bg-blue-500/20", text: "text-blue-400" },
  { bg: "bg-rose-500/20", text: "text-rose-400" },
  { bg: "bg-cyan-500/20", text: "text-cyan-400" },
];

function tryBuildRegex(
  pattern: string,
  flags: string
): { regex?: RegExp; error?: string } {
  if (!pattern) return {};
  try {
    return { regex: new RegExp(pattern, flags) };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

function findMatches(regex: RegExp, text: string): MatchResult[] {
  const results: MatchResult[] = [];
  if (!regex.global) {
    const m = regex.exec(text);
    if (m) {
      results.push({
        full: m[0],
        index: m.index,
        end: m.index + m[0].length,
        groups: m.slice(1).map((g) => g ?? ""),
      });
    }
    return results;
  }
  regex.lastIndex = 0;
  let m: RegExpExecArray | null;
  let safety = 0;
  while ((m = regex.exec(text)) !== null && safety < 5000) {
    results.push({
      full: m[0],
      index: m.index,
      end: m.index + m[0].length,
      groups: m.slice(1).map((g) => g ?? ""),
    });
    if (m[0].length === 0) {
      regex.lastIndex++;
    }
    safety++;
  }
  return results;
}

function highlightText(
  text: string,
  matches: MatchResult[]
): React.ReactNode[] {
  if (matches.length === 0) return [text];
  const nodes: React.ReactNode[] = [];
  let last = 0;
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    if (m.index > last) {
      nodes.push(
        <span key={`t-${i}`} className="text-[var(--code-fg)]">
          {text.slice(last, m.index)}
        </span>
      );
    }
    nodes.push(
      <mark
        key={`m-${i}`}
        className="bg-[var(--accent)]/20 text-[var(--accent)] px-0.5 rounded-sm"
      >
        {m.full}
      </mark>
    );
    last = m.end;
  }
  if (last < text.length) {
    nodes.push(
      <span key="tail" className="text-[var(--code-fg)]">
        {text.slice(last)}
      </span>
    );
  }
  return nodes;
}

export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("");
  const [debouncedPattern, setDebouncedPattern] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounceUpdate = useCallback(
    (p: string, t: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setDebouncedPattern(p);
        setDebouncedText(t);
      }, 100);
    },
    []
  );

  useEffect(() => {
    debounceUpdate(pattern, testText);
  }, [pattern, testText, debounceUpdate]);

  const { regex, error } = useMemo(
    () => tryBuildRegex(debouncedPattern, flags),
    [debouncedPattern, flags]
  );

  const matches = useMemo(() => {
    if (!regex || !debouncedText) return [];
    return findMatches(new RegExp(regex.source, regex.flags), debouncedText);
  }, [regex, debouncedText]);

  const highlighted = useMemo(
    () => (debouncedText ? highlightText(debouncedText, matches) : []),
    [debouncedText, matches]
  );

  function toggleFlag(f: string) {
    setFlags((prev) =>
      prev.includes(f) ? prev.replace(f, "") : prev + f
    );
  }

  function applyPreset(p: (typeof PRESETS)[number]) {
    setPattern(p.pattern);
    setFlags(p.flags);
    setTestText(p.test);
  }

  function clear() {
    setPattern("");
    setFlags("g");
    setTestText("");
  }

  return (
    <ToolShell
      title="Regex tester"
      description="Test a pattern against sample text. Matches and capture groups are highlighted as you type."
    >
      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)] hover:border-[var(--accent)]/30 transition-all duration-150 cursor-pointer"
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={clear}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-[var(--text-muted)] hover:text-red-400 transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Pattern input */}
      <div className="rounded-lg border border-[var(--border)] overflow-hidden terminal-glow mb-4">
        <div className="flex items-center justify-between px-4 py-2 bg-[#161616] border-b border-white/[0.06]">
          <span className="text-xs font-medium text-[#a8a29e]">
            Pattern
          </span>
        </div>
        <div className="flex items-center bg-[var(--code-bg)] px-4 py-3">
          <span className="text-[var(--text-muted)] font-mono text-lg mr-1 select-none">
            /
          </span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="flex-1 bg-transparent text-[14px] font-mono text-[var(--code-fg)] outline-none placeholder-[#525252] min-w-0 focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
            placeholder="enter regex pattern..."
            spellCheck={false}
          />
          <span className="text-[var(--text-muted)] font-mono text-lg mx-1 select-none">
            /
          </span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            className="w-[4ch] bg-transparent text-[14px] font-mono text-[var(--accent)] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none border-none text-center"
            spellCheck={false}
          />
        </div>
        {/* Flag toggles */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-[#111111] border-t border-white/[0.06]">
          {FLAG_OPTIONS.map((f) => (
            <button
              key={f.flag}
              onClick={() => toggleFlag(f.flag)}
              className={`h-6 px-2 text-[10px] font-mono font-bold rounded transition-all duration-150 cursor-pointer ${
                flags.includes(f.flag)
                  ? "bg-[var(--btn-bg)] text-[var(--btn-fg)]"
                  : "border border-white/10 text-[#78716c] hover:text-[#e7e5e4] hover:border-white/20"
              }`}
              title={f.label}
            >
              {f.flag}
            </button>
          ))}
          <span className="text-[10px] text-[#525252] ml-2 hidden sm:inline">
            {FLAG_OPTIONS.filter((f) => flags.includes(f.flag))
              .map((f) => f.label)
              .join(", ") || "no flags"}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-[12px] text-red-400 font-mono">
          {error}
        </div>
      )}

      {/* Test String + Highlighted output */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <ToolPanel
          label="Test String"
          actions={
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              {testText.length} chars
            </span>
          }
        >
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full min-h-[250px] bg-[var(--code-bg)] px-4 py-3 text-[13px] font-mono text-[var(--code-fg)] resize-y outline-none leading-[1.7] placeholder-[#525252] focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
            placeholder="Paste your test text here..."
            spellCheck={false}
          />
        </ToolPanel>

        <ToolPanel
          label="Highlighted"
          dark
          actions={
            <span
              className={`text-[10px] font-mono font-bold ${
                matches.length > 0 ? "text-emerald-400" : "text-[#525252]"
              }`}
            >
              {matches.length} match{matches.length !== 1 ? "es" : ""}
            </span>
          }
        >
          <div className="min-h-[250px] bg-[var(--code-bg)] px-4 py-3 overflow-auto">
            {debouncedText ? (
              <pre className="text-[13px] leading-[1.7] font-mono whitespace-pre-wrap break-words bg-transparent">
                {highlighted}
              </pre>
            ) : (
              <p className="text-[13px] text-[#525252] font-mono">
                Matches will appear here...
              </p>
            )}
          </div>
        </ToolPanel>
      </div>

      {/* Match Results */}
      {matches.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-[var(--text-muted)] mb-3">
            Match Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {matches.map((m, i) => (
              <div
                key={i}
                className="border border-[var(--border)] rounded-lg p-3 bg-[var(--surface)]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    Match {i + 1}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    {m.index}–{m.end}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded break-all">
                    {m.full}
                  </code>
                  <CopyButton
                    text={m.full}
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] shrink-0"
                  />
                </div>
                {m.groups.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {m.groups.map((g, gi) => {
                      const color =
                        GROUP_COLORS[gi % GROUP_COLORS.length];
                      return (
                        <div
                          key={gi}
                          className="flex items-center gap-2 text-[10px]"
                        >
                          <span
                            className={`font-mono font-bold ${color.text}`}
                          >
                            ${gi + 1}
                          </span>
                          <code
                            className={`font-mono ${color.bg} ${color.text} px-1 py-0.5 rounded text-[10px] break-all`}
                          >
                            {g || "(empty)"}
                          </code>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {debouncedText && debouncedPattern && !error && matches.length === 0 && (
        <p className="text-sm text-[var(--text-muted)] text-center py-4 font-mono">
          No matches found
        </p>
      )}
    </ToolShell>
  );
}
