"use client";

import { useState, useCallback, useEffect } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?/~`",
};

type CharsetKey = keyof typeof CHARSETS;

const PRESETS = [
  { label: "Password", length: 16, sets: ["uppercase", "lowercase", "numbers", "symbols"] as CharsetKey[], custom: "" },
  { label: "API Key", length: 40, sets: ["uppercase", "numbers"] as CharsetKey[], custom: "" },
  { label: "Hex Token", length: 64, sets: [] as CharsetKey[], custom: "0123456789abcdef" },
  { label: "PIN", length: 6, sets: ["numbers"] as CharsetKey[], custom: "" },
];

function generate(charset: string, length: number): string {
  if (!charset || length < 1) return "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => charset[v % charset.length]).join("");
}

function buildCharset(sets: CharsetKey[], custom: string): string {
  let cs = sets.map((k) => CHARSETS[k]).join("");
  if (custom) cs += custom;
  return [...new Set(cs)].join("");
}

function strengthInfo(charsetSize: number, length: number) {
  if (charsetSize === 0 || length === 0) return { bits: 0, pct: 0, label: "None", color: "bg-[#525252]" };
  const bits = Math.round(length * Math.log2(charsetSize));
  let pct: number, label: string, color: string;
  if (bits < 28) { pct = Math.min((bits / 28) * 25, 25); label = "Weak"; color = "bg-red-500"; }
  else if (bits < 60) { pct = 25 + ((bits - 28) / 32) * 25; label = "Fair"; color = "bg-orange-500"; }
  else if (bits < 120) { pct = 50 + ((bits - 60) / 60) * 25; label = "Good"; color = "bg-yellow-500"; }
  else { pct = Math.min(75 + ((bits - 120) / 80) * 25, 100); label = "Strong"; color = "bg-emerald-500"; }
  return { bits, pct: Math.round(pct), label, color };
}

export function PasswordGenerator() {
  const [length, setLength] = useState(32);
  const [activeSets, setActiveSets] = useState<CharsetKey[]>(["uppercase", "lowercase", "numbers", "symbols"]);
  const [custom, setCustom] = useState("");
  const [value, setValue] = useState("");
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkList, setBulkList] = useState<string[]>([]);

  const charset = buildCharset(activeSets, custom);
  const strength = strengthInfo(charset.length, length);

  const regen = useCallback(() => {
    setValue(generate(charset, length));
  }, [charset, length]);

  useEffect(() => { regen(); }, [regen]);

  const toggleSet = (key: CharsetKey) => {
    setActiveSets((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setLength(p.length);
    setActiveSets(p.sets);
    setCustom(p.custom);
  };

  const bulkGenerate = () => {
    const list = Array.from({ length: bulkCount }, () => generate(charset, length));
    setBulkList(list);
  };

  return (
    <ToolShell
      title="Password & Secret Generator"
      description="Generate secure passwords, API keys, and random tokens. Uses crypto.getRandomValues()."
    >
      {/* Main display */}
      <ToolPanel
        label="Generated Secret"
        dark
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={regen}
              className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[var(--accent)] text-white cursor-pointer transition-all duration-150 active:scale-95 hover:opacity-90"
            >
              Regenerate
            </button>
            <CopyButton text={value} className="text-[#525252] hover:text-[var(--accent)]" />
          </div>
        }
      >
        <div className="bg-[var(--code-bg)] px-4 py-5">
          <p
            className="font-mono text-[18px] leading-relaxed text-[var(--code-fg)] break-all select-all"
            style={{ wordBreak: "break-all" }}
          >
            {value || <span className="text-[#525252]">Select at least one character set</span>}
          </p>
          {/* Strength meter */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-[#1a1a22] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                style={{ width: `${strength.pct}%` }}
              />
            </div>
            <span className={`text-[11px] font-bold ${strength.color.replace("bg-", "text-")} whitespace-nowrap`}>
              {strength.label} ({strength.bits} bits)
            </span>
          </div>
        </div>
      </ToolPanel>

      {/* Settings */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        {/* Left: length + charsets */}
        <div className="space-y-5">
          {/* Length slider */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2 block">
              Length: <span className="text-[var(--accent)] font-mono">{length}</span>
            </label>
            <input
              type="range"
              min={4}
              max={128}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-[var(--accent)] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono mt-1">
              <span>4</span>
              <span>128</span>
            </div>
          </div>

          {/* Character sets */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2 block">
              Character Sets
            </span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CHARSETS) as CharsetKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => toggleSet(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all duration-200 active:scale-95 ${
                    activeSets.includes(key)
                      ? "bg-[var(--accent)] text-white"
                      : "border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)]"
                  }`}
                >
                  {key === "uppercase" ? "A-Z" : key === "lowercase" ? "a-z" : key === "numbers" ? "0-9" : "!@#$"}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Custom characters..."
              className="mt-2 w-full bg-[var(--code-bg)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs font-mono text-[var(--code-fg)] placeholder-[#525252] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right: presets */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2 block">
            Presets
          </span>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="px-3 py-2.5 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)] hover:border-[var(--accent)]/30 cursor-pointer transition-all duration-200 active:scale-95 text-left"
              >
                <span className="block text-[var(--text)] font-semibold">{p.label}</span>
                <span className="text-[10px]">
                  {p.length} chars · {p.custom ? p.custom.slice(0, 10) : p.sets.map((s) => (s === "uppercase" ? "A-Z" : s === "lowercase" ? "a-z" : s === "numbers" ? "0-9" : "!@#")).join(" ")}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk generate */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Bulk Generate
          </span>
          <input
            type="number"
            min={1}
            max={20}
            value={bulkCount}
            onChange={(e) => setBulkCount(Math.max(1, Math.min(20, Number(e.target.value))))}
            className="w-16 bg-[var(--code-bg)] border border-[var(--border)] rounded-md px-2 py-1 text-xs font-mono text-[var(--code-fg)] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
          />
          <button
            onClick={bulkGenerate}
            className="text-[11px] font-bold px-3 py-1 rounded-md bg-[var(--accent)] text-white cursor-pointer transition-all duration-150 active:scale-95 hover:opacity-90"
          >
            Generate
          </button>
          {bulkList.length > 0 && (
            <CopyButton
              text={bulkList.join("\n")}
              label="Copy All"
              className="text-[11px] text-[var(--accent)] hover:underline"
            />
          )}
        </div>
        {bulkList.length > 0 && (
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            {bulkList.map((v, i) => (
              <div
                key={`${v}-${i}`}
                className={`flex items-center justify-between px-4 py-2 text-[12px] font-mono ${
                  i % 2 === 0 ? "bg-[var(--code-bg)]" : "bg-[#13131a]"
                }`}
              >
                <span className="text-[var(--code-fg)] break-all select-all">{v}</span>
                <CopyButton text={v} className="text-[#525252] hover:text-[var(--accent)] shrink-0 ml-2" />
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolShell>
  );
}
