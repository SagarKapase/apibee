"use client";

import { useState, useMemo } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";

type Mode = "encode" | "decode";

const examples: Record<Mode, string> = {
  encode: "Hello, world. UTF-8: é, ñ, ü, 日本語",
  decode: "SGVsbG8sIFdvcmxkISDwn4yNIFNwZWNpYWwgY2hhcnM6IMOpLCDDsSwgw7w=",
};

function utf8Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function utf8Decode(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function Base64Codec() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: null };
    try {
      if (mode === "encode") {
        return { output: utf8Encode(input), error: null };
      }
      return { output: utf8Decode(input), error: null };
    } catch {
      return {
        output: "",
        error:
          mode === "decode"
            ? "Invalid Base64. Check for typos or missing padding (=)."
            : "Could not encode this input.",
      };
    }
  }, [input, mode]);

  function switchMode(m: Mode) {
    setMode(m);
    setInput("");
  }

  function loadExample() {
    setInput(examples[mode]);
  }

  const inputLen = input.length;
  const outputLen = output.length;
  const ratio =
    inputLen > 0 && outputLen > 0
      ? Math.round((outputLen / inputLen) * 100)
      : 0;

  return (
    <ToolShell
      title="Base64"
      description="Encode text to Base64 or decode Base64 to plain text. UTF-8 safe."
    >
      {/* Mode toggle */}
      <div className="flex items-center gap-2 mb-6">
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
        <button
          onClick={loadExample}
          className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] border border-[var(--border)] rounded-lg hover:bg-[var(--accent-soft)] transition-all duration-200 cursor-pointer"
        >
          Load Example
        </button>
      </div>

      {/* Panels */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Input */}
        <ToolPanel
          label={mode === "encode" ? "Plain Text" : "Base64 Input"}
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
                ? "Paste or type text to encode..."
                : "Paste Base64 string to decode..."
            }
            spellCheck={false}
            className="w-full min-h-[300px] bg-[var(--code-bg)] px-4 py-3 text-[13px] font-mono text-[var(--code-fg)] resize-y outline-none leading-[1.6] placeholder-[#525252] focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
          />
        </ToolPanel>

        {/* Output */}
        <ToolPanel
          label={mode === "encode" ? "Base64 Output" : "Decoded Text"}
          dark
          actions={
            output ? (
              <CopyButton
                text={output}
                className="text-[#78716c] hover:text-[#e7e5e4] text-xs"
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
              <p className="text-[13px] text-[#525252] font-mono">
                {mode === "encode"
                  ? "Base64 output will appear here..."
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
          {ratio > 0 && <span>Ratio: {ratio}%</span>}
        </div>
      )}
    </ToolShell>
  );
}
