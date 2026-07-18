"use client";

import { CopyButton } from "./copy-button";
import { Highlighted } from "@/lib/syntax";

const CURL_CMD = "curl https://api.apibee.io/api/products?limit=2";

const JSON_RESPONSE = `[
  {
    "id": 1,
    "title": "Wireless Noise-Cancelling Headphones",
    "price": 249.99,
    "category": "electronics",
    "rating": { "rate": 4.3, "count": 127 },
    "inStock": true
  },
  {
    "id": 2,
    "title": "Mechanical Keyboard RGB",
    "price": 89.99,
    "category": "electronics",
    "rating": { "rate": 4.7, "count": 84 },
    "inStock": true
  }
]`;

export function HeroTerminal() {
  return (
    <div className="terminal-glow rounded-xl overflow-hidden bg-[var(--code-bg)]">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a22] border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs text-[#525252] font-mono select-none">
            Terminal
          </span>
        </div>
        <CopyButton
          text={CURL_CMD}
          className="text-[#525252] hover:text-[#a8a29e] text-xs"
        />
      </div>

      {/* Code area */}
      <div className="p-4 sm:p-5 overflow-x-auto">
        <pre className="text-[13px] leading-[1.7] bg-transparent">
          <code>
            <span className="text-[#34d399]">$</span>
            <span className="text-[#d4d4d8]"> curl </span>
            <span className="text-[#a8a29e]">
              https://api.apibee.io/api/products?limit=2
            </span>
            {"\n\n"}
            <Highlighted code={JSON_RESPONSE} lang="json" />
          </code>
        </pre>
      </div>
    </div>
  );
}
