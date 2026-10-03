"use client";

import { useState } from "react";
import { Highlighted } from "@/lib/syntax";
import { CopyButton } from "../copy-button";

export type ExampleLang = "cURL" | "fetch" | "Python";

// The same request as cURL, fetch and Python, in tabs.
export function CodeExamples({ examples }: { examples: Record<ExampleLang, string> }) {
  const [codeTab, setCodeTab] = useState<ExampleLang>("cURL");
  const code = examples[codeTab];
  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="flex items-center justify-between bg-[#0f1112] border-b border-white/[0.06] pl-1 pr-3">
        <div className="flex" role="tablist" aria-label="Language">
          {(["cURL", "fetch", "Python"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={codeTab === t}
              onClick={() => setCodeTab(t)}
              className={`relative px-3 py-2 text-xs cursor-pointer ${
                codeTab === t ? "text-[#fafaf9]" : "text-[#8d9299] hover:text-[#d8dade]"
              }`}
            >
              {t}
              {codeTab === t && <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--code-accent)]" />}
            </button>
          ))}
        </div>
        <CopyButton text={code} label={`${codeTab} example`} hideLabel className="text-[#8d9299] hover:text-[#e1e3e5]" />
      </div>
      <pre className="bg-[var(--code-bg)] px-3 py-3 overflow-auto max-h-64 text-[12px] leading-[1.6]">
        <code className="font-mono">
          <Highlighted
            code={code}
            lang={codeTab === "cURL" ? "curl" : codeTab === "fetch" ? "javascript" : "python"}
          />
        </code>
      </pre>
    </div>
  );
}
