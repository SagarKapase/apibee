"use client";

import { useState, useMemo } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";

type Mode = "encode" | "decode";
type EncodeScope = "component" | "full";

const examples = {
  encode: "https://api.testingapis.com/search?q=hello world&category=API Tools&page=1",
  decode:
    "https%3A%2F%2Fapi.testingapis.com%2Fsearch%3Fq%3Dhello%20world%26category%3DAPI%20Tools%26page%3D1",
};

function countEncoded(original: string, encoded: string): number {
  let count = 0;
  let i = 0;
  for (const ch of original) {
    const enc = encoded.slice(i);
    const encCh = encodeURIComponent(ch);
    if (encCh !== ch) count++;
    i += enc.startsWith(encCh) ? encCh.length : ch.length;
  }
  return count;
}

export function UrlCodec() {
  const [mode, setMode] = useState<Mode>("encode");
  const [scope, setScope] = useState<EncodeScope>("component");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: null };
    try {
      if (mode === "encode") {
        const result =
          scope === "component"
            ? encodeURIComponent(input)
            : encodeURI(input);
        return { output: result, error: null };
      }
      const result = decodeURIComponent(input);
      return { output: result, error: null };
    } catch {
      return {
        output: "",
        error:
          mode === "decode"
            ? "Invalid percent-encoding. Check for malformed % sequences."
            : "Could not encode this input.",
      };
    }
  }, [input, mode, scope]);

  function switchMode(m: Mode) {
    setMode(m);
    setInput("");
  }

  function loadExample() {
    setInput(examples[mode]);
  }

  const inputLen = input.length;
  const outputLen = output.length;
  const encodedChars =
    mode === "encode" && input && output ? countEncoded(input, output) : 0;

  return (
    <ToolShell
      title="URL encoding"
      description="Percent-encode text for use in URLs, or decode it back."
    >
      {/* Mode toggle + scope */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 p-1 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                mode === m
                  ? "bg-[var(--btn-bg)] text-[var(--btn-fg)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)]"
              }`}
            >
              {m === "encode" ? "Encode" : "Decode"}
            </button>
          ))}
        </div>

        {/* Scope toggle — only shown in encode mode */}
        {mode === "encode" && (
          <div className="flex gap-1 p-1 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            {(
              [
                { key: "component" as const, label: "Component" },
                { key: "full" as const, label: "Full URL" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setScope(key)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer ${
                  scope === key
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={loadExample}
          className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] border border-[var(--border)] rounded-lg hover:bg-[var(--accent-soft)] transition-all duration-200 cursor-pointer"
        >
          Load Example
        </button>
      </div>

      {/* Info for scope */}
      {mode === "encode" && (
        <p className="text-[11px] text-[var(--text-muted)] mb-4 font-mono">
          {scope === "component"
            ? "encodeURIComponent: encodes everything, including : / ? # & ="
            : "encodeURI: keeps URL structure characters (: / ? # & =)"}
        </p>
      )}

      {/* Panels */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Input */}
        <ToolPanel
          label={mode === "encode" ? "Text to Encode" : "Encoded URL"}
          actions={
            input ? (
              <button
                onClick={() => setInput("")}
                className="text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)] cursor-pointer transition-colors"
              >
                Clear
              </button>
            ) : null
          }
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Paste text or URL to encode..."
                : "Paste percent-encoded string to decode..."
            }
            spellCheck={false}
            className="w-full min-h-[300px] bg-[var(--code-bg)] px-4 py-3 text-[13px] font-mono text-[var(--code-fg)] resize-y outline-none leading-[1.6] placeholder-[#656b73] focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
          />
        </ToolPanel>

        {/* Output */}
        <ToolPanel
          label={mode === "encode" ? "Encoded Output" : "Decoded Text"}
          dark
          actions={
            output ? (
              <CopyButton
                text={output}
                className="text-[#8d9299] hover:text-[#e1e3e5] text-xs"
              />
            ) : null
          }
        >
          <div className="bg-[var(--code-bg)] px-4 py-3 min-h-[300px]">
            {error ? (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-[12px] text-red-400 font-mono leading-relaxed">
                {error}
              </div>
            ) : output ? (
              <pre className="text-[13px] leading-[1.6] font-mono text-[var(--code-fg)] whitespace-pre-wrap break-all bg-transparent">
                {output}
              </pre>
            ) : (
              <p className="text-[13px] text-[#656b73] font-mono">
                {mode === "encode"
                  ? "Encoded output will appear here..."
                  : "Decoded text will appear here..."}
              </p>
            )}
          </div>
        </ToolPanel>
      </div>

      {/* Stats */}
      {(inputLen > 0 || outputLen > 0) && (
        <div className="mt-3 flex flex-wrap gap-4 text-xs font-mono text-[var(--text-muted)]">
          <span>Input: {inputLen} chars</span>
          <span>Output: {outputLen} chars</span>
          {mode === "encode" && encodedChars > 0 && (
            <span>Encoded chars: {encodedChars}</span>
          )}
        </div>
      )}
    </ToolShell>
  );
}
