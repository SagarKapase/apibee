import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = {
  title: "Free Developer Tools — APIBee",
  description:
    "JSON formatter, JWT decoder, Base64 encoder, URL encoder, and JSON/XML converter. Client-side only — no data leaves your browser.",
};

const tools = [
  {
    slug: "json-formatter",
    icon: "{ }",
    name: "JSON Formatter",
    description:
      "Paste messy JSON, get it formatted and validated. Shows errors with line numbers.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    slug: "json-xml",
    icon: "↔",
    name: "JSON ↔ XML",
    description:
      "Convert between JSON and XML. Handles nested objects and arrays.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    slug: "jwt-decoder",
    icon: "🔑",
    name: "JWT Decoder",
    description:
      "Decode a JWT token. See header, payload, expiry. Tells you if it's expired.",
    color: "from-violet-500 to-purple-600",
  },
  {
    slug: "base64",
    icon: "B64",
    name: "Base64 Encode / Decode",
    description:
      "Encode text to Base64 or decode it back. Handles UTF-8.",
    color: "from-amber-500 to-orange-600",
  },
  {
    slug: "url-encoder",
    icon: "%",
    name: "URL Encode / Decode",
    description:
      "Encode special characters for URLs or decode them back to readable text.",
    color: "from-rose-500 to-pink-600",
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-14 sm:py-20">
      <FadeIn>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text)] mb-2">
          Developer Tools
        </h1>
        <p className="text-[var(--text-muted)] mb-2 max-w-lg">
          {tools.length} free utilities. Everything runs in your browser — no
          data leaves your machine.
        </p>
        <p className="text-xs text-[var(--text-muted)] mb-10 font-mono">
          No signup. No tracking. No backend.
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, i) => (
          <FadeIn key={tool.slug} delay={0.04 + i * 0.06}>
            <Link
              href={`/tools/${tool.slug}`}
              className="group block rounded-xl border border-[var(--border)] p-5 hover-lift hover:border-[var(--accent)]/40 hover:shadow-lg hover:shadow-[var(--ring)] transition-all h-full"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-white text-sm font-bold font-mono mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                {tool.icon}
              </div>
              <h2 className="font-semibold text-[var(--text)] mb-1.5 group-hover:text-[var(--accent)] transition-colors duration-200">
                {tool.name}
              </h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {tool.description}
              </p>
            </Link>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
