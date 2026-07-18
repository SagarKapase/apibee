"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";
import { Highlighted } from "@/lib/syntax";

type Direction = "json-to-xml" | "xml-to-json";

const SAMPLE_JSON = JSON.stringify(
  {
    users: [
      { id: 1, name: "Alice", role: "admin" },
      { id: 2, name: "Bob", role: "editor" },
    ],
    meta: { total: 2 },
  },
  null,
  2
);

const SAMPLE_XML = `<root>
  <users>
    <id>1</id>
    <name>Alice</name>
    <role>admin</role>
  </users>
  <users>
    <id>2</id>
    <name>Bob</name>
    <role>editor</role>
  </users>
  <meta>
    <total>2</total>
  </meta>
</root>`;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function jsonValueToXml(key: string, value: unknown, depth: number): string {
  const pad = "  ".repeat(depth);
  if (value === null || value === undefined) {
    return `${pad}<${key}/>`;
  }
  if (Array.isArray(value)) {
    return value.map((item) => jsonValueToXml(key, item, depth)).join("\n");
  }
  if (typeof value === "object") {
    const inner = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => jsonValueToXml(k, v, depth + 1))
      .join("\n");
    return `${pad}<${key}>\n${inner}\n${pad}</${key}>`;
  }
  return `${pad}<${key}>${escapeXml(String(value))}</${key}>`;
}

function jsonToXml(raw: string): string {
  const parsed = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null) {
    return `<root>${escapeXml(String(parsed))}</root>`;
  }
  if (Array.isArray(parsed)) {
    const inner = parsed
      .map((item) => jsonValueToXml("item", item, 1))
      .join("\n");
    return `<root>\n${inner}\n</root>`;
  }
  const inner = Object.entries(parsed)
    .map(([k, v]) => jsonValueToXml(k, v as unknown, 1))
    .join("\n");
  return `<root>\n${inner}\n</root>`;
}

function xmlNodeToJson(node: Element): unknown {
  const children = Array.from(node.children);
  if (children.length === 0) {
    const text = node.textContent?.trim() ?? "";
    if (text === "") return null;
    if (text === "true") return true;
    if (text === "false") return false;
    const num = Number(text);
    if (!isNaN(num) && text !== "") return num;
    return text;
  }

  const obj: Record<string, unknown> = {};
  const tagCounts: Record<string, number> = {};

  for (const child of children) {
    tagCounts[child.tagName] = (tagCounts[child.tagName] || 0) + 1;
  }

  for (const child of children) {
    const val = xmlNodeToJson(child);
    if (tagCounts[child.tagName] > 1) {
      if (!Array.isArray(obj[child.tagName])) {
        obj[child.tagName] = [];
      }
      (obj[child.tagName] as unknown[]).push(val);
    } else {
      obj[child.tagName] = val;
    }
  }

  return obj;
}

function xmlToJson(raw: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw.trim(), "text/xml");

  const errNode = doc.querySelector("parsererror");
  if (errNode) {
    throw new Error(
      errNode.textContent?.split("\n")[0] || "Invalid XML"
    );
  }

  const root = doc.documentElement;
  const result = xmlNodeToJson(root);
  return JSON.stringify(result, null, 2);
}

export function JsonXmlConverter() {
  const [direction, setDirection] = useState<Direction>("json-to-xml");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const convert = useCallback(
    (raw: string, dir: Direction) => {
      if (!raw.trim()) {
        setOutput("");
        setError(null);
        return;
      }
      try {
        const result =
          dir === "json-to-xml" ? jsonToXml(raw) : xmlToJson(raw);
        setOutput(result);
        setError(null);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setOutput("");
        setError(msg);
      }
    },
    []
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => convert(input, direction), 150);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [input, direction, convert]);

  const loadExample = () => {
    setInput(direction === "json-to-xml" ? SAMPLE_JSON : SAMPLE_XML);
  };

  const switchDirection = (dir: Direction) => {
    setDirection(dir);
    setInput("");
    setOutput("");
    setError(null);
  };

  const inputLang = direction === "json-to-xml" ? "JSON" : "XML";
  const outputLang = direction === "json-to-xml" ? "XML" : "JSON";
  const outputHighlightLang = direction === "json-to-xml" ? "xml" : "json";

  return (
    <ToolShell
      title="JSON ↔ XML Converter"
      description="Convert between JSON and XML. Handles nested objects, arrays, and escaping."
    >
      {/* Direction toggle */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] w-fit">
        <button
          onClick={() => switchDirection("json-to-xml")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-all duration-200 ${
            direction === "json-to-xml"
              ? "bg-[var(--accent)] text-white shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          JSON → XML
        </button>
        <button
          onClick={() => switchDirection("xml-to-json")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-all duration-200 ${
            direction === "xml-to-json"
              ? "bg-[var(--accent)] text-white shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          XML → JSON
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Input */}
        <ToolPanel
          label={`Input · ${inputLang}`}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={loadExample}
                className="text-[10px] font-medium text-[var(--accent)] hover:underline cursor-pointer"
              >
                Load Example
              </button>
              <button
                onClick={() => {
                  setInput("");
                  setOutput("");
                  setError(null);
                }}
                className="text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
              >
                Clear
              </button>
            </div>
          }
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[400px] bg-[var(--code-bg)] px-4 py-3 text-[13px] font-mono text-[var(--code-fg)] resize-y outline-none leading-[1.6] placeholder-[#525252] focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
            placeholder={`Paste your ${inputLang} here...`}
            spellCheck={false}
          />
        </ToolPanel>

        {/* Output */}
        <ToolPanel
          label={`Output · ${outputLang}`}
          dark
          actions={
            output ? (
              <CopyButton
                text={output}
                className="text-[#525252] hover:text-[var(--accent)] text-xs"
              />
            ) : undefined
          }
        >
          <div className="min-h-[400px] bg-[var(--code-bg)] px-4 py-3 overflow-auto">
            {output ? (
              <pre className="text-[13px] leading-[1.6] bg-transparent">
                <code className="font-mono">
                  <Highlighted code={output} lang={outputHighlightLang} />
                </code>
              </pre>
            ) : !error ? (
              <p className="text-[13px] text-[#525252] font-mono">
                Converted {outputLang} will appear here
              </p>
            ) : null}
          </div>
        </ToolPanel>
      </div>

      {error && (
        <div className="mt-3 px-1 text-xs font-mono text-red-400">{error}</div>
      )}
    </ToolShell>
  );
}
