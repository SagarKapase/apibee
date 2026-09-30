import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";

export const metadata: Metadata = {
  title: "Developer tools",
  description:
    "JSON formatter, JWT decoder, Base64 and URL encoders, format converters and generators. Everything runs in your browser.",
};

const groups = [
  {
    title: "Format and convert",
    tools: [
      {
        slug: "json-formatter",
        name: "JSON formatter",
        description: "Format and validate JSON. Errors show a line number.",
      },
      {
        slug: "json-xml",
        name: "JSON and XML converter",
        description: "Convert in either direction, including nested objects and arrays.",
      },
      {
        slug: "json-yaml-csv",
        name: "JSON, YAML and CSV converter",
        description: "Convert between the three formats, including nested data.",
      },
      {
        slug: "text-diff",
        name: "Text diff",
        description: "Compare two texts line by line and see what was added or removed.",
      },
    ],
  },
  {
    title: "Encode and decode",
    tools: [
      {
        slug: "base64",
        name: "Base64",
        description: "Encode text to Base64 or decode it. UTF-8 safe.",
      },
      {
        slug: "url-encoder",
        name: "URL encoding",
        description: "Percent-encode text for URLs or decode it back.",
      },
      {
        slug: "jwt-decoder",
        name: "JWT decoder",
        description: "Read a token's header, payload and expiry. Does not verify signatures.",
      },
      {
        slug: "curl-parser",
        name: "cURL parser",
        description: "Split a cURL command into method, URL, headers and body.",
      },
    ],
  },
  {
    title: "Generate",
    tools: [
      {
        slug: "uuid-generator",
        name: "UUID generator",
        description: "Generate v4 UUIDs, one at a time or in bulk.",
      },
      {
        slug: "hash-generator",
        name: "Hash generator",
        description: "MD5, SHA-1, SHA-256 and SHA-512 of any text.",
      },
      {
        slug: "password-generator",
        name: "Password generator",
        description: "Passwords, API keys and secrets with configurable length and characters.",
      },
      {
        slug: "mock-data",
        name: "Mock data",
        description: "Fake names, emails, addresses and phone numbers as JSON.",
      },
      {
        slug: "qr-code",
        name: "QR code",
        description: "Turn a URL or text into a QR code and download it as PNG.",
      },
    ],
  },
  {
    title: "Reference and testing",
    tools: [
      {
        slug: "http-status",
        name: "HTTP status codes",
        description: "Every status code with its meaning, grouped by class.",
      },
      {
        slug: "regex-tester",
        name: "Regex tester",
        description: "Test a pattern against text and see matches and capture groups.",
      },
      {
        slug: "timestamp",
        name: "Unix timestamp",
        description: "Convert between Unix timestamps and dates.",
      },
    ],
  },
];

const toolCount = groups.reduce((n, g) => n + g.tools.length, 0);

export default function ToolsPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)]">
        Developer tools
      </h1>
      <p className="mt-3 max-w-xl text-[var(--text-muted)] leading-relaxed">
        {toolCount} small utilities for everyday API work. They run in your
        browser, so nothing you paste is sent to a server.
      </p>

      <div className="mt-12 space-y-12">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="text-sm font-medium text-[var(--text)] mb-3">
              {group.title}
            </h2>
            <ul className="grid sm:grid-cols-2 border-t border-[var(--border)]">
              {group.tools.map((tool) => (
                <li key={tool.slug} className="border-b border-[var(--border)]">
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="group flex items-start justify-between gap-4 py-4 sm:pr-8"
                  >
                    <div>
                      <span className="text-sm font-medium text-[var(--text)] group-hover:underline underline-offset-4">
                        {tool.name}
                      </span>
                      <p className="mt-1 text-[13px] leading-snug text-[var(--text-muted)]">
                        {tool.description}
                      </p>
                    </div>
                    <Icon
                      name="arrowRight"
                      size={14}
                      className="mt-1 shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
