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
  {
    slug: "uuid-generator",
    icon: "#",
    name: "UUID Generator",
    description:
      "Generate v4 UUIDs. One at a time or bulk. Copy with a click.",
    color: "from-cyan-500 to-sky-600",
  },
  {
    slug: "hash-generator",
    icon: "H",
    name: "Hash Generator",
    description:
      "MD5, SHA-1, SHA-256, SHA-512. Paste text, get every hash at once.",
    color: "from-slate-500 to-zinc-600",
  },
  {
    slug: "timestamp",
    icon: "⏱",
    name: "Unix Timestamp",
    description:
      "Convert timestamps to dates and dates to timestamps. Live clock included.",
    color: "from-teal-500 to-emerald-600",
  },
  {
    slug: "http-status",
    icon: "4xx",
    name: "HTTP Status Codes",
    description:
      "Every HTTP status code with its meaning. Searchable. Grouped by category.",
    color: "from-red-500 to-rose-600",
  },
  {
    slug: "regex-tester",
    icon: ".*",
    name: "Regex Tester",
    description:
      "Write a regex, paste test text, see matches highlighted live. Shows capture groups.",
    color: "from-fuchsia-500 to-purple-600",
  },
  {
    slug: "api-visualizer",
    icon: "◎",
    name: "API Visualizer",
    description:
      "Paste a Postman Collection, OpenAPI spec, or custom JSON. See your API as an interactive tree.",
    color: "from-violet-500 to-purple-600",
  },
  {
    slug: "curl-parser",
    icon: ">>",
    name: "cURL Parser",
    description:
      "Paste a cURL command. See method, URL, headers, and body broken out.",
    color: "from-orange-500 to-red-600",
  },
  {
    slug: "mock-data",
    icon: "fn",
    name: "Mock Data Generator",
    description:
      "Generate fake names, emails, addresses, phone numbers. Export as JSON.",
    color: "from-lime-500 to-green-600",
  },
  {
    slug: "password-generator",
    icon: "***",
    name: "Password Generator",
    description:
      "Secure passwords, API keys, random secrets. Set length and character rules.",
    color: "from-yellow-500 to-amber-600",
  },
  {
    slug: "qr-code",
    icon: "QR",
    name: "QR Code Generator",
    description:
      "Paste a URL or text, get a QR code. Download as PNG.",
    color: "from-sky-500 to-blue-600",
  },
  {
    slug: "text-diff",
    icon: "±",
    name: "Text Diff Checker",
    description:
      "Paste two texts, see exactly what changed. Additions, deletions, line by line.",
    color: "from-pink-500 to-rose-600",
  },
  {
    slug: "json-yaml-csv",
    icon: "⇄",
    name: "JSON ↔ YAML / CSV",
    description:
      "Convert between JSON, YAML, and CSV. Handles nested data and arrays.",
    color: "from-indigo-500 to-blue-600",
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
