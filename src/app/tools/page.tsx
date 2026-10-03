import type { Metadata } from "next";
import { ToolsDirectory, type ToolGroup } from "@/components/tools-directory";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/tools",
  title: "Developer tools",
  description:
    "JSON formatter, JWT decoder, Base64 and URL encoders, format converters and generators. Everything runs in your browser.",
});

const groups: ToolGroup[] = [
  {
    id: "format",
    title: "Format and convert",
    short: "Format",
    description: "Reformat data or move it between formats.",
    icon: "repeat",
    tools: [
      {
        slug: "json-formatter",
        icon: "braces",
        name: "JSON formatter",
        description: "Format and validate JSON. Errors show a line number.",
      },
      {
        slug: "json-xml",
        icon: "code",
        name: "JSON and XML converter",
        description: "Convert in either direction, including nested objects and arrays.",
      },
      {
        slug: "json-yaml-csv",
        icon: "fileText",
        name: "JSON, YAML and CSV converter",
        description: "Convert between the three formats, including nested data.",
      },
      {
        slug: "text-diff",
        icon: "diff",
        name: "Text diff",
        description: "Compare two texts line by line and see what was added or removed.",
      },
    ],
  },
  {
    id: "encode",
    title: "Encode and decode",
    short: "Encode",
    description: "Encode, decode and take apart the strings APIs pass around.",
    icon: "lock",
    tools: [
      {
        slug: "base64",
        icon: "type",
        name: "Base64",
        description: "Encode text to Base64 or decode it. UTF-8 safe.",
      },
      {
        slug: "url-encoder",
        icon: "link",
        name: "URL encoding",
        description: "Percent-encode text for URLs or decode it back.",
      },
      {
        slug: "jwt-decoder",
        icon: "key",
        name: "JWT decoder",
        description: "Read a token's header, payload and expiry. Does not verify signatures.",
      },
      {
        slug: "curl-parser",
        icon: "terminal",
        name: "cURL parser",
        description: "Split a cURL command into method, URL, headers and body.",
      },
    ],
  },
  {
    id: "generate",
    title: "Generate",
    short: "Generate",
    description: "IDs, hashes, passwords, test data and QR codes.",
    icon: "sparkles",
    tools: [
      {
        slug: "uuid-generator",
        icon: "idCard",
        name: "UUID generator",
        description: "Generate v4 UUIDs, one at a time or in bulk.",
      },
      {
        slug: "hash-generator",
        icon: "hash",
        name: "Hash generator",
        description: "MD5, SHA-1, SHA-256 and SHA-512 of any text.",
      },
      {
        slug: "password-generator",
        icon: "lock",
        name: "Password generator",
        description: "Passwords, API keys and secrets with configurable length and characters.",
      },
      {
        slug: "mock-data",
        icon: "database",
        name: "Mock data",
        description: "Fake names, emails, addresses and phone numbers as JSON.",
      },
      {
        slug: "qr-code",
        icon: "qrCode",
        name: "QR code",
        description: "Turn a URL or text into a QR code and download it as PNG.",
      },
    ],
  },
  {
    id: "reference",
    title: "Reference and testing",
    short: "Reference",
    description: "Look up status codes, test patterns and convert times.",
    icon: "book",
    tools: [
      {
        slug: "http-status",
        icon: "activity",
        name: "HTTP status codes",
        description: "Every status code with its meaning, grouped by class.",
      },
      {
        slug: "regex-tester",
        icon: "regex",
        name: "Regex tester",
        description: "Test a pattern against text and see matches and capture groups.",
      },
      {
        slug: "timestamp",
        icon: "clock",
        name: "Unix timestamp",
        description: "Convert between Unix timestamps and dates.",
      },
    ],
  },
];

const toolCount = groups.reduce((n, g) => n + g.tools.length, 0);

export default function ToolsPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-14 sm:py-20">
      <ToolsDirectory groups={groups}>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Developer utilities
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[var(--text)]">
          Developer tools
        </h1>
        <p className="mt-3 max-w-xl text-[15px] text-[var(--text-muted)] leading-relaxed">
          {toolCount} small utilities for everyday API work. They run in your
          browser, so nothing you paste is sent to a server.
        </p>
      </ToolsDirectory>
    </div>
  );
}
