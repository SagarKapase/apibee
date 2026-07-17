"use client";

import { useState } from "react";
import { CopyButton } from "./copy-button";
import { Highlighted } from "@/lib/syntax";

const langMap: Record<string, "javascript" | "python" | "curl" | "java" | "php"> = {
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

  return (
    <div>
      <div className="rounded-xl overflow-hidden border border-[var(--border)] terminal-glow">
        {/* Tab bar */}
        <div className="flex items-center justify-between bg-[#1a1a22] border-b border-white/[0.06] px-1 sm:px-2">
          <div className="flex gap-0 overflow-x-auto">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setActive(lang)}
                className={`relative px-3 sm:px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active === lang
                    ? "text-[#a78bfa]"
                    : "text-[#525252] hover:text-[#a8a29e]"
                }`}
              >
                {lang}
                {active === lang && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#a78bfa] rounded-t" />
                )}
              </button>
            ))}
          </div>
          <CopyButton
            text={examples[active]}
            className="text-[#525252] hover:text-[#a8a29e] px-2 py-1 text-xs"
          />
        </div>

        {/* Code area */}
        <div className="bg-[var(--code-bg)] p-4 sm:p-5 overflow-x-auto">
          <pre className="text-[13px] leading-[1.7] bg-transparent">
            <code className="font-mono">
              <Highlighted
                code={examples[active]}
                lang={langMap[active] ?? "javascript"}
              />
            </code>
          </pre>
        </div>
      </div>

      {/* Response */}
      <details className="mt-3 group">
        <summary className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] cursor-pointer hover:text-[var(--accent)] select-none font-medium transition-colors">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="transition-transform group-open:rotate-90"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          Response preview
        </summary>
        <div className="mt-2 rounded-xl bg-[var(--code-bg)] p-4 overflow-x-auto border border-[var(--border)]">
          <pre className="text-[13px] leading-[1.7] bg-transparent">
            <code className="font-mono">
              <Highlighted code={sampleResponse} lang="json" />
            </code>
          </pre>
        </div>
      </details>
    </div>
  );
}
