"use client";

import { useState, useMemo } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";
import { Highlighted } from "@/lib/syntax";

const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDEiLCJuYW1lIjoiTWljaGFlbCBUaG9tcHNvbiIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTcyMTIzNDU2NywiZXhwIjoxNzIxMjM4MTY3fQ.dGVzdC1zaWduYXR1cmUtaGVyZQ";

function base64UrlDecode(str: string): string {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4 !== 0) s += "=";
  return atob(s);
}

function formatDate(epoch: number): string {
  return new Date(epoch * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function relativeTime(epoch: number): string {
  const diff = epoch * 1000 - Date.now();
  const abs = Math.abs(diff);
  const seconds = Math.floor(abs / 1000);
  if (seconds < 60) return diff >= 0 ? `in ${seconds}s` : `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return diff >= 0 ? `in ${minutes} min` : `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return diff >= 0 ? `in ${hours}h` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return diff >= 0 ? `in ${days}d` : `${days}d ago`;
}

interface Decoded {
  header: Record<string, string>;
  payload: Record<string, unknown>;
  signature: string;
}

function tryDecode(token: string): { data?: Decoded; error?: string } {
  const trimmed = token.trim();
  if (!trimmed) return {};
  const parts = trimmed.split(".");
  if (parts.length !== 3)
    return {
      error: `Expected 3 parts separated by dots, got ${parts.length}. Not a valid JWT.`,
    };
  try {
    const headerJson = base64UrlDecode(parts[0]);
    const header = JSON.parse(headerJson);
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(base64UrlDecode(parts[1]));
    } catch {
      return { error: "Could not decode the payload. It is not valid Base64url JSON." };
    }
    return { data: { header, payload, signature: parts[2] } };
  } catch {
    return { error: "Could not decode the header. It is not valid Base64url JSON." };
  }
}

function ClaimRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-white/[0.06] last:border-b-0">
      <span className="text-[11px] text-[#a8a29e] shrink-0">{label}</span>
      <span
        className={`text-[12px] font-mono text-right truncate ${accent ? "text-[var(--accent)]" : "text-[var(--code-fg)]"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function JwtDecoder() {
  const [token, setToken] = useState("");

  const result = useMemo(() => tryDecode(token), [token]);
  const decoded = result.data;
  const error = result.error;

  const exp =
    decoded && typeof decoded.payload.exp === "number"
      ? decoded.payload.exp
      : null;
  const iat =
    decoded && typeof decoded.payload.iat === "number"
      ? decoded.payload.iat
      : null;
  const isExpired = exp !== null && exp * 1000 < Date.now();

  return (
    <ToolShell
      title="JWT decoder"
      description="Paste a JWT to read its header, payload and expiry. The signature is not verified."
    >
      {/* Token input */}
      <div className="rounded-lg border border-[var(--border)] overflow-hidden terminal-glow mb-4">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#161616] border-b border-white/[0.06]">
          <span className="text-xs font-medium text-[#a8a29e]">
            Token
          </span>
          <div className="flex items-center gap-2">
            {token && (
              <button
                onClick={() => setToken("")}
                className="text-[10px] text-[#78716c] hover:text-[#e7e5e4] transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
            {token && (
              <CopyButton
                text={token}
                className="text-[#78716c] hover:text-[#e7e5e4] text-xs"
              />
            )}
          </div>
        </div>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={4}
          className="w-full bg-[var(--code-bg)] px-4 py-3 text-[13px] font-mono text-[var(--code-fg)] resize-none outline-none leading-[1.6] placeholder-[#525252] focus:outline-none focus:ring-0 focus-visible:outline-none border-none min-h-[120px]"
          placeholder="Paste your JWT token here... (eyJhbGci...)"
          spellCheck={false}
        />
      </div>

      {/* Sample button */}
      <div className="mb-8">
        <button
          onClick={() => setToken(SAMPLE_TOKEN)}
          className="text-xs font-medium text-[var(--accent)] hover:underline cursor-pointer transition-colors"
        >
          Load sample token
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-4 mb-6"
          style={{
            animation: "slideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <p className="text-sm text-red-400 font-mono">{error}</p>
        </div>
      )}

      {/* Decoded sections */}
      {decoded && (
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          style={{
            animation: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Header */}
          <ToolPanel label="Header" dark>
            <div className="bg-[var(--code-bg)] px-4 py-3 overflow-x-auto">
              <pre className="text-[12px] leading-[1.6] bg-transparent">
                <code className="font-mono">
                  <Highlighted
                    code={JSON.stringify(decoded.header, null, 2)}
                    lang="json"
                  />
                </code>
              </pre>
            </div>
            <div className="flex gap-2 px-4 py-3 border-t border-white/[0.06]">
              {decoded.header.alg && (
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-white/[0.06] text-[#d6d3d1]">
                  {String(decoded.header.alg)}
                </span>
              )}
              {decoded.header.typ && (
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400">
                  {String(decoded.header.typ)}
                </span>
              )}
            </div>
          </ToolPanel>

          {/* Payload */}
          <ToolPanel
            label="Payload"
            dark
            actions={
              exp !== null ? (
                isExpired ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-400">
                    EXPIRED
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                    VALID
                  </span>
                )
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#525252]/20 text-[#78716c]">
                  NO EXPIRY
                </span>
              )
            }
          >
            <div className="bg-[var(--code-bg)] px-4 py-3 overflow-x-auto max-h-48 overflow-y-auto">
              <pre className="text-[12px] leading-[1.6] bg-transparent">
                <code className="font-mono">
                  <Highlighted
                    code={JSON.stringify(decoded.payload, null, 2)}
                    lang="json"
                  />
                </code>
              </pre>
            </div>
            {/* Claims breakdown */}
            <div className="px-4 py-3 border-t border-white/[0.06]">
              <span className="text-xs font-medium text-[#525252] block mb-2">
                Claims
              </span>
              {decoded.payload.sub != null && (
                <ClaimRow
                  label="Subject (sub)"
                  value={String(decoded.payload.sub)}
                  accent
                />
              )}
              {decoded.payload.name != null && (
                <ClaimRow
                  label="Name"
                  value={String(decoded.payload.name)}
                />
              )}
              {decoded.payload.role != null && (
                <ClaimRow
                  label="Role"
                  value={String(decoded.payload.role)}
                  accent
                />
              )}
              {iat !== null && (
                <ClaimRow label="Issued (iat)" value={formatDate(iat)} />
              )}
              {exp !== null && (
                <ClaimRow
                  label="Expires (exp)"
                  value={
                    <span className="flex items-center gap-2 justify-end">
                      <span>{formatDate(exp)}</span>
                      <span
                        className={`text-[10px] font-bold ${isExpired ? "text-red-400" : "text-emerald-400"}`}
                      >
                        {relativeTime(exp)}
                      </span>
                    </span>
                  }
                />
              )}
            </div>
          </ToolPanel>

          {/* Signature */}
          <ToolPanel
            label="Signature"
            actions={
              <CopyButton
                text={decoded.signature}
                className="text-[#78716c] hover:text-[#e7e5e4] text-xs"
              />
            }
          >
            <div className="px-4 py-3">
              <code className="text-[12px] font-mono text-[var(--text-muted)] break-all leading-relaxed block mb-3">
                {decoded.signature.length > 60
                  ? decoded.signature.slice(0, 60) + "…"
                  : decoded.signature}
              </code>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] pt-3">
                Signature cannot be verified without the secret key. This tool
                only decodes; it does not validate.
              </p>
            </div>
          </ToolPanel>
        </div>
      )}

      {/* Empty state */}
      {!token && !error && !decoded && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Paste a token above or{" "}
            <button
              onClick={() => setToken(SAMPLE_TOKEN)}
              className="text-[var(--accent)] hover:underline cursor-pointer"
            >
              load a sample
            </button>{" "}
            to get started.
          </p>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToolShell>
  );
}
