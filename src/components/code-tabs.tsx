"use client";

import { useState } from "react";
import { CopyButton } from "./copy-button";
import { Highlighted } from "@/lib/syntax";

const langMap: Record<
  string,
  "javascript" | "python" | "curl" | "java" | "php"
> = {
  JavaScript: "javascript",
  Python: "python",
  cURL: "curl",
  Java: "java",
  PHP: "php",
};

export function CodeTabs({
  examples,
  sampleResponse,
}: {
  examples: Record<string, string>;
  sampleResponse: string;
}) {
  const languages = Object.keys(examples);
  const [active, setActive] = useState(languages[0]);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div>
      <div className="rounded-lg overflow-hidden border border-[var(--border)] terminal-glow">
        {/* Tab bar */}
        <div className="flex items-center justify-between bg-[#161616] border-b border-white/[0.06] px-1 sm:px-2">
          <div className="flex gap-0 overflow-x-auto">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setActive(lang)}
                className={`relative px-3 sm:px-4 py-2.5 text-xs font-medium whitespace-nowrap cursor-pointer
                  transition-all duration-200
                  ${
                    active === lang
                      ? "text-[#fafaf9]"
                      : "text-[#78716c] hover:text-[#d6d3d1]"
                  }
                `}
              >
                {lang}
                {active === lang && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--code-accent)]"
                  />
                )}
              </button>
            ))}
          </div>
          <CopyButton
            text={examples[active]}
            className="text-[#78716c] hover:text-[#e7e5e4] px-2 py-1 text-xs"
          />
        </div>

        {/* Code area */}
        <div className="bg-[var(--code-bg)] p-4 sm:p-5 overflow-x-auto">
          <pre className="text-[13px] leading-[1.7] bg-transparent">
            <code className="font-mono block">
              <Highlighted
                code={examples[active]}
                lang={langMap[active] ?? "javascript"}
              />
            </code>
          </pre>
        </div>
      </div>

      {/* Response preview */}
      <div className="mt-3">
        <button
          onClick={() => setPreviewOpen(!previewOpen)}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] cursor-pointer hover:text-[var(--accent)] select-none font-medium transition-colors duration-200"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`transition-transform duration-300 ${
              previewOpen ? "rotate-90" : ""
            }`}
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          Response preview
        </button>

        <div
          className="grid-expand mt-2"
          data-open={previewOpen}
        >
          <div>
            <div className="rounded-lg bg-[var(--code-bg)] p-4 overflow-x-auto border border-[var(--border)]">
              <pre className="text-[13px] leading-[1.7] bg-transparent">
                <code className="font-mono">
                  <Highlighted code={sampleResponse} lang="json" />
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
