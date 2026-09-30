"use client";

import { useState, useCallback } from "react";

export function CopyButton({
  text,
  className = "",
  label,
  hideLabel = false,
}: {
  text: string;
  className?: string;
  label?: string;
  hideLabel?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={copy}
      className={`
        group/copy inline-flex items-center gap-1.5 text-sm cursor-pointer
        text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200
        ${className}
      `}
      aria-label={`Copy ${label || "to clipboard"}`}
    >
      <span className="relative w-4 h-4 flex items-center justify-center">
        {/* Clipboard icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute inset-0 transition-opacity duration-150 ${
            copied ? "opacity-0" : "opacity-100"
          }`}
        >
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </svg>
        {/* Check icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute inset-0 text-emerald-500 transition-opacity duration-150 ${
            copied ? "opacity-100" : "opacity-0"
          }`}
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      {label && !hideLabel && (
        <span className={`transition-colors duration-200 ${copied ? "text-emerald-500" : ""}`}>
          {copied ? "Copied" : label}
        </span>
      )}
    </button>
  );
}
