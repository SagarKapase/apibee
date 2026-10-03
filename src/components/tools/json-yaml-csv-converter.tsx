"use client";

import { useState, useMemo } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";
import { Highlighted } from "@/lib/syntax";

type Format = "json" | "yaml" | "csv";

const LABELS: Record<Format, string> = {
  json: "JSON",
  yaml: "YAML",
  csv: "CSV",
};

const EXAMPLES: Record<Format, string> = {
  json: `[
  { "name": "Alice", "age": 30, "city": "NYC" },
  { "name": "Bob", "age": 25, "city": "London" },
  { "name": "Carol", "age": 28, "city": "Tokyo" }
]`,
  yaml: `- name: Alice
  age: 30
  city: NYC
- name: Bob
  age: 25
  city: London
- name: Carol
  age: 28
  city: Tokyo`,
  csv: `name,age,city
Alice,30,NYC
Bob,25,London
Carol,28,Tokyo`,
};

// ── JSON → YAML ──
function jsonToYaml(val: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (val === null || val === undefined) return "null";
  if (typeof val === "boolean") return String(val);
  if (typeof val === "number") return String(val);
  if (typeof val === "string") {
    if (
      val === "" ||
      val === "true" ||
      val === "false" ||
      val === "null" ||
      /[:#{}[\],&*?|>!%@`]/.test(val) ||
      /^\s|\s$/.test(val) ||
      !isNaN(Number(val))
    )
      return JSON.stringify(val);
    return val;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    return val
      .map((item) => {
        const inner = jsonToYaml(item, indent + 1);
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          const lines = inner.split("\n");
          return `${pad}- ${lines[0]}\n${lines.slice(1).map((l) => `${pad}  ${l}`).join("\n")}`;
        }
        return `${pad}- ${inner}`;
      })
      .join("\n");
  }
  if (typeof val === "object") {
    const entries = Object.entries(val as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries
      .map(([k, v]) => {
        const key = /[:#{}[\],&*?|>!%@`\s]/.test(k) ? JSON.stringify(k) : k;
        if (
          typeof v === "object" &&
          v !== null &&
          (Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0)
        ) {
          return `${pad}${key}:\n${jsonToYaml(v, indent + 1)}`;
        }
        return `${pad}${key}: ${jsonToYaml(v, indent)}`;
      })
      .join("\n");
  }
  return String(val);
}

// ── YAML → JSON ──
interface YNode {
  indent: number;
  raw: string;
  isArrayItem: boolean;
  key: string | null;
  value: string | null;
  children: YNode[];
}

function parseYamlValue(raw: string): unknown {
  const t = raw.trim();
  if (t === "" || t === "null" || t === "~") return null;
  if (t === "true") return true;
  if (t === "false") return false;
  if (/^-?\d+$/.test(t)) return parseInt(t, 10);
  if (/^-?\d+\.\d+$/.test(t)) return parseFloat(t);
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))
    return t.slice(1, -1);
  return t;
}

function yamlToJson(yaml: string): unknown {
  const lines = yaml.split("\n").filter((l) => l.trim() !== "" && !l.trim().startsWith("#"));
  if (lines.length === 0) return null;

  const nodes: YNode[] = lines.map((raw) => {
    const stripped = raw.replace(/\t/g, "  ");
    const indent = stripped.search(/\S/);
    let content = stripped.trim();
    const isArrayItem = content.startsWith("- ");
    if (isArrayItem) content = content.slice(2);
    const colonIdx = content.indexOf(": ");
    let key: string | null = null;
    let value: string | null = null;
    if (colonIdx > 0 && !content.startsWith('"')) {
      key = content.slice(0, colonIdx).trim();
      value = content.slice(colonIdx + 2).trim() || null;
    } else if (content.endsWith(":")) {
      key = content.slice(0, -1).trim();
      value = null;
    } else {
      value = content;
    }
    return { indent, raw, isArrayItem, key, value, children: [] };
  });

  // Build tree
  function buildTree(list: YNode[], baseIndent: number): YNode[] {
    const roots: YNode[] = [];
    let i = 0;
    while (i < list.length) {
      const node = list[i];
      if (node.indent < baseIndent) break;
      const childStart = i + 1;
      let childEnd = childStart;
      while (childEnd < list.length && list[childEnd].indent > node.indent) childEnd++;
      node.children = buildTree(list.slice(childStart, childEnd), node.indent + 1);
      roots.push(node);
      i = childEnd;
    }
    return roots;
  }

  function toValue(nodes: YNode[]): unknown {
    if (nodes.length === 0) return null;
    if (nodes[0].isArrayItem) {
      return nodes.map((n) => {
        if (n.children.length > 0 && n.key !== null) {
          const obj: Record<string, unknown> = {};
          obj[n.key] = n.value !== null ? parseYamlValue(n.value) : toValue(n.children);
          const childObj = toValue(n.children);
          if (typeof childObj === "object" && childObj !== null && !Array.isArray(childObj)) {
            Object.assign(obj, childObj);
          }
          return obj;
        }
        if (n.children.length > 0) return toValue(n.children);
        if (n.key !== null)  {
          const obj: Record<string, unknown> = {};
          obj[n.key] = n.value !== null ? parseYamlValue(n.value) : toValue(n.children);
          return obj;
        }
        return parseYamlValue(n.value ?? "");
      });
    }
    const obj: Record<string, unknown> = {};
    for (const n of nodes) {
      if (n.key !== null) {
        obj[n.key] = n.children.length > 0 ? toValue(n.children) : parseYamlValue(n.value ?? "");
      }
    }
    return obj;
  }

  const minIndent = Math.min(...nodes.map((n) => n.indent));
  const tree = buildTree(nodes, minIndent);
  return toValue(tree);
}

// ── JSON → CSV ──
function jsonToCsv(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0)
    throw new Error("JSON must be an array of objects for CSV conversion.");
  const first = data[0];
  if (typeof first !== "object" || first === null || Array.isArray(first))
    throw new Error("Each item in the array must be a flat object.");
  const headers = Object.keys(first);
  const escape = (v: unknown): string => {
    const s = v === null || v === undefined ? "" : String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const rows = data.map((row: unknown) => {
    const r = row as Record<string, unknown>;
    return headers.map((h) => escape(r[h])).join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

// ── CSV → JSON ──
function csvToJson(csv: string): unknown {
  const lines = csv.split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 2) throw new Error("CSV needs at least a header row and one data row.");

  function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          result.push(current);
          current = "";
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
  }

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      const v = values[i] ?? "";
      if (v === "true") obj[h] = true;
      else if (v === "false") obj[h] = false;
      else if (v === "null" || v === "") obj[h] = v === "null" ? null : v;
      else if (!isNaN(Number(v)) && v.trim() !== "") obj[h] = Number(v);
      else obj[h] = v;
    });
    return obj;
  });
}

// ── Master converter ──
function convert(input: string, from: Format, to: Format): string {
  if (from === to) return input;

  let intermediate: unknown;

  // Parse input to JS value
  if (from === "json") {
    intermediate = JSON.parse(input);
  } else if (from === "yaml") {
    intermediate = yamlToJson(input);
  } else {
    intermediate = csvToJson(input);
  }

  // Convert to target
  if (to === "json") {
    return JSON.stringify(intermediate, null, 2);
  } else if (to === "yaml") {
    return jsonToYaml(intermediate);
  } else {
    return jsonToCsv(intermediate);
  }
}

function langFor(fmt: Format): "json" | "xml" {
  return "json";
}

const TA_CLASS =
  "w-full min-h-[300px] bg-[var(--code-bg)] px-4 py-3 text-[13px] font-mono text-[var(--code-fg)] resize-y outline-none leading-[1.6] placeholder-[#656b73] focus:outline-none focus:ring-0 focus-visible:outline-none border-none";

export function JsonYamlCsvConverter() {
  const [from, setFrom] = useState<Format>("json");
  const [to, setTo] = useState<Format>("yaml");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };
    try {
      return { output: convert(input, from, to), error: null };
    } catch (e: unknown) {
      return {
        output: "",
        error: e instanceof Error ? e.message : "Conversion failed",
      };
    }
  }, [input, from, to]);

  function swap() {
    const newFrom = to;
    const newTo = from;
    setFrom(newFrom);
    setTo(newTo);
    if (output) setInput(output);
  }

  function loadExample() {
    setInput(EXAMPLES[from]);
  }

  return (
    <ToolShell
      title="JSON, YAML and CSV converter"
      description="Convert between JSON, YAML and CSV. Runs in your browser."
    >
      {/* Format selectors */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--text-muted)]">
            From
          </span>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value as Format)}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text)] outline-none focus:outline-none focus-visible:outline-none cursor-pointer"
          >
            {(["json", "yaml", "csv"] as Format[]).map((f) => (
              <option key={f} value={f}>
                {LABELS[f]}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={swap}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all duration-200 cursor-pointer active:scale-90"
          aria-label="Swap formats"
        >
          ⇄
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--text-muted)]">
            To
          </span>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value as Format)}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text)] outline-none focus:outline-none focus-visible:outline-none cursor-pointer"
          >
            {(["json", "yaml", "csv"] as Format[]).map((f) => (
              <option key={f} value={f}>
                {LABELS[f]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={loadExample}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)] transition-all duration-200 cursor-pointer"
          >
            Load Example
          </button>
          <button
            onClick={() => setInput("")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)] transition-all duration-200 cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Panels */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ToolPanel label={`Input (${LABELS[from]})`}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={TA_CLASS}
            placeholder={`Paste ${LABELS[from]} here...`}
            spellCheck={false}
          />
        </ToolPanel>

        <ToolPanel
          label={`Output (${LABELS[to]})`}
          dark
          actions={
            output ? (
              <CopyButton
                text={output}
                className="text-[#8d9299] hover:text-[#e1e3e5] text-xs"
              />
            ) : undefined
          }
        >
          <div className="bg-[var(--code-bg)] px-4 py-3 min-h-[300px] overflow-x-auto">
            {error ? (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-[12px] text-red-400 font-mono leading-relaxed">
                {error}
              </div>
            ) : output ? (
              <pre className="text-[13px] leading-[1.6] bg-transparent">
                <code className="font-mono">
                  <Highlighted code={output} lang={langFor(to)} />
                </code>
              </pre>
            ) : (
              <span className="text-[13px] text-[#656b73] font-mono">
                Output will appear here...
              </span>
            )}
          </div>
        </ToolPanel>
      </div>
    </ToolShell>
  );
}
