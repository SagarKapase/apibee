"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha(algo: string, text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest(algo, data);
  return toHex(hash);
}

// Compact MD5 — Web Crypto doesn't support it
function md5(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const len = bytes.length;

  function rotl(x: number, n: number) {
    return (x << n) | (x >>> (32 - n));
  }

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(2 ** 32 * Math.abs(Math.sin(i + 1)));
  }

  const bitLen = len * 8;
  const padLen = ((56 - ((len + 1) % 64)) + 64) % 64;
  const totalLen = len + 1 + padLen + 8;
  const buf = new Uint8Array(totalLen);
  buf.set(bytes);
  buf[len] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(totalLen - 8, bitLen & 0xffffffff, true);
  view.setUint32(totalLen - 4, Math.floor(bitLen / 0x100000000), true);

  for (let offset = 0; offset < totalLen; offset += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = view.getUint32(offset + j * 4, true);
    }

    let A = a0, B = b0, C = c0, D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }

      F = (F + A + K[i] + M[g]) | 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotl(F, s[i])) | 0;
    }

    a0 = (a0 + A) | 0;
    b0 = (b0 + B) | 0;
    c0 = (c0 + C) | 0;
    d0 = (d0 + D) | 0;
  }

  const result = new Uint8Array(16);
  const rv = new DataView(result.buffer);
  rv.setUint32(0, a0, true);
  rv.setUint32(4, b0, true);
  rv.setUint32(8, c0, true);
  rv.setUint32(12, d0, true);
  return toHex(result.buffer);
}

interface Hashes {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

const algos: { key: keyof Hashes; label: string }[] = [
  { key: "md5", label: "MD5" },
  { key: "sha1", label: "SHA-1" },
  { key: "sha256", label: "SHA-256" },
  { key: "sha512", label: "SHA-512" },
];

export function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Hashes | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const compute = useCallback(async (text: string) => {
    if (!text) {
      setHashes(null);
      return;
    }
    const [s1, s256, s512] = await Promise.all([
      sha("SHA-1", text),
      sha("SHA-256", text),
      sha("SHA-512", text),
    ]);
    setHashes({
      md5: md5(text),
      sha1: s1,
      sha256: s256,
      sha512: s512,
    });
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => compute(input), 200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [input, compute]);

  const byteCount = new TextEncoder().encode(input).length;

  const allFormatted = hashes
    ? `MD5:     ${hashes.md5}\nSHA-1:   ${hashes.sha1}\nSHA-256: ${hashes.sha256}\nSHA-512: ${hashes.sha512}`
    : "";

  return (
    <ToolShell
      title="Hash Generator"
      description="Type or paste text. See MD5, SHA-1, SHA-256, and SHA-512 hashes instantly."
    >
      {/* Input */}
      <ToolPanel
        label="Input Text"
        actions={
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {byteCount} bytes
            </span>
            <button
              onClick={() => setInput("")}
              className="text-[10px] font-medium text-[var(--text-muted)] hover:text-red-400 cursor-pointer transition-colors"
            >
              Clear
            </button>
          </div>
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full min-h-[120px] bg-[var(--code-bg)] px-4 py-3 text-[13px] font-mono text-[var(--code-fg)] resize-y outline-none leading-[1.6] placeholder-[#525252] focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
          placeholder="Type or paste text here..."
          spellCheck={false}
        />
      </ToolPanel>

      {/* Hash results */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Hashes
          </span>
          {hashes && (
            <CopyButton
              text={allFormatted}
              label="Copy All"
              className="text-[var(--text-muted)] hover:text-[var(--accent)] text-xs"
            />
          )}
        </div>

        {algos.map((algo) => (
          <ToolPanel
            key={algo.key}
            label={algo.label}
            dark
            actions={
              hashes ? (
                <CopyButton
                  text={hashes[algo.key]}
                  className="text-[#525252] hover:text-[var(--accent)] text-xs"
                />
              ) : undefined
            }
          >
            <div className="bg-[var(--code-bg)] px-4 py-3 min-h-[40px] flex items-center">
              {hashes ? (
                <code className="text-[12px] font-mono text-[var(--code-fg)] break-all select-all leading-relaxed">
                  {hashes[algo.key]}
                </code>
              ) : (
                <span className="text-[12px] font-mono text-[#525252]">
                  Enter text to generate hashes
                </span>
              )}
            </div>
          </ToolPanel>
        ))}
      </div>
    </ToolShell>
  );
}
