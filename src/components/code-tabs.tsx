"use client";

import { useId, useRef, useState } from "react";
import { CopyButton } from "./copy-button";
import { CodeViewer } from "./code-viewer";
import type { Lang } from "@/lib/syntax";

const langMap: Record<string, Lang> = {
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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  // Arrow keys move between languages, as in any tablist.
  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + languages.length) % languages.length;
    setActive(languages[next]);
    tabRefs.current[next]?.focus();
  }

  return (
    <div>
      <div className="rounded-[9px] overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[#0f1112] pl-2 pr-2.5">
          <div role="tablist" aria-label="Language" className="flex flex-1 min-w-0 overflow-x-auto">
            {languages.map((lang, i) => (
              <button
                key={lang}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={active === lang}
                aria-controls={`${id}-panel`}
                tabIndex={active === lang ? 0 : -1}
                onClick={() => setActive(lang)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`relative shrink-0 px-3 sm:px-3.5 py-3 text-xs whitespace-nowrap cursor-pointer transition-colors duration-150 ${
                  active === lang ? "text-[#f5f5f4] font-semibold" : "text-[#8d9299] hover:text-[#d8dade]"
                }`}
              >
                {lang}
                {active === lang && (
                  <span aria-hidden="true" className="absolute bottom-0 left-3 right-3 h-[2px] bg-[var(--code-accent)]" />
                )}
              </button>
            ))}
          </div>
          <CopyButton
            text={examples[active]}
            label={`${active} example`}
            display="Copy"
            className="shrink-0 h-7 px-2 rounded-[5px] border border-[#303338] bg-[#121416] text-[11px] text-[#b7bbc0] hover:text-[#f5f5f4] hover:border-[#41454a]"
          />
        </div>

        <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${languages.indexOf(active)}`}>
          <CodeViewer code={examples[active]} lang={langMap[active] ?? "javascript"} className="max-h-72" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPreviewOpen(!previewOpen)}
        aria-expanded={previewOpen}
        aria-controls={`${id}-preview`}
        className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer transition-colors duration-150"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          aria-hidden="true"
          className={`transition-transform duration-200 ${previewOpen ? "rotate-90" : ""}`}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        Response preview
      </button>

      {previewOpen && (
        <div id={`${id}-preview`} className="mt-2 rounded-[9px] overflow-hidden border border-[var(--border)]">
          <CodeViewer code={sampleResponse} lang="json" className="max-h-80" />
        </div>
      )}
    </div>
  );
}
