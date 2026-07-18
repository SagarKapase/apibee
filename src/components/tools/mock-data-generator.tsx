"use client";

import { useState, useCallback } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";
import { Highlighted } from "@/lib/syntax";

const firstNames = [
  "James","Emma","Liam","Olivia","Noah","Ava","William","Sophia","Lucas","Mia",
  "Henry","Charlotte","Alexander","Amelia","Benjamin","Harper","Ethan","Evelyn",
  "Daniel","Abigail","Mason","Emily","Logan","Ella","Jackson","Scarlett",
];
const lastNames = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis",
  "Rodriguez","Martinez","Hernandez","Lopez","Wilson","Anderson","Thomas",
  "Taylor","Moore","Jackson","Martin","Lee","Perez","Clark","Lewis","Young",
];
const cities = [
  "New York","London","Tokyo","Paris","Berlin","Sydney","Toronto","Singapore",
  "Dubai","Mumbai","Seoul","Barcelona","Amsterdam","Stockholm","Austin",
  "Portland","Denver","Chicago","Miami","Seattle",
];
const jobs = [
  "Software Engineer","Product Manager","Data Scientist","UX Designer",
  "DevOps Engineer","Frontend Developer","Backend Developer","QA Engineer",
  "Tech Lead","CTO","Architect","SRE","ML Engineer","iOS Developer",
  "Android Developer","Full-Stack Developer","Security Engineer","VP Engineering",
];
const companies = [
  "TechCorp","DataFlow","CloudPeak","ByteWorks","CodeLabs","InnoSoft",
  "PixelForge","NetGrid","AppVault","DevSphere","NeuralEdge","StackWave",
  "BaseCamp","Vercel","Stripe","Linear","Notion","Figma",
];
const streets = [
  "Main St","Oak Ave","Park Blvd","Elm St","Cedar Ln","Maple Dr","Pine Rd",
  "Lake Ave","Hill St","River Rd","Broadway","5th Ave","Market St","Union St",
];

const FIELD_OPTIONS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "job", label: "Job" },
  { key: "city", label: "City" },
  { key: "address", label: "Address" },
  { key: "company", label: "Company" },
  { key: "avatar", label: "Avatar URL" },
] as const;

type FieldKey = (typeof FIELD_OPTIONS)[number]["key"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randDigits(n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function generate(
  count: number,
  fields: Set<FieldKey>
): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const first = pick(firstNames);
    const last = pick(lastNames);
    const rec: Record<string, unknown> = { id: i + 1 };
    if (fields.has("name")) rec.name = `${first} ${last}`;
    if (fields.has("email"))
      rec.email = `${first.toLowerCase()}.${last.toLowerCase()}@${pick(companies).toLowerCase().replace(/\s/g, "")}.com`;
    if (fields.has("phone"))
      rec.phone = `+1 (555) ${randDigits(3)}-${randDigits(4)}`;
    if (fields.has("job")) rec.job = pick(jobs);
    if (fields.has("city")) rec.city = pick(cities);
    if (fields.has("address"))
      rec.address = `${Math.floor(Math.random() * 9000) + 100} ${pick(streets)}, ${pick(cities)}`;
    if (fields.has("company")) rec.company = pick(companies);
    if (fields.has("avatar"))
      rec.avatar = `https://i.pravatar.cc/150?u=${i + 1}`;
    results.push(rec);
  }
  return results;
}

export function MockDataGenerator() {
  const [count, setCount] = useState(5);
  const [fields, setFields] = useState<Set<FieldKey>>(
    new Set(["name", "email", "job", "city"])
  );
  const [output, setOutput] = useState("");

  const toggleField = useCallback((key: FieldKey) => {
    setFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const doGenerate = useCallback(() => {
    const data = generate(Math.max(1, Math.min(100, count)), fields);
    setOutput(JSON.stringify(data, null, 2));
  }, [count, fields]);

  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mock-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const recordCount = output
    ? JSON.parse(output).length
    : 0;

  return (
    <ToolShell
      title="Mock Data Generator"
      description="Generate fake but realistic-looking data. Names, emails, jobs, addresses. Copy as JSON."
    >
      {/* Controls */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[var(--text-muted)]">
              Count
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Number(e.target.value) || 1)}
              className="w-16 bg-[var(--code-bg)] border border-[var(--border)] rounded-md px-2 py-1 text-sm font-mono text-[var(--text)] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none text-center"
            />
          </div>

          <div className="h-4 w-px bg-[var(--border)]" />

          <div className="flex flex-wrap gap-1.5">
            {FIELD_OPTIONS.map((f) => (
              <button
                key={f.key}
                onClick={() => toggleField(f.key)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md border cursor-pointer transition-all duration-150 active:scale-95 ${
                  fields.has(f.key)
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={doGenerate}
          className="btn-press flex items-center gap-1.5 px-5 py-2 bg-[var(--accent)] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-[var(--ring)] cursor-pointer"
        >
          Generate
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="m5 12 14-7-4 7 4 7Z" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Output */}
      {output && (
        <ToolPanel
          label={`Output — ${recordCount} records`}
          dark
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={download}
                className="text-[10px] text-[var(--accent)] hover:underline cursor-pointer"
              >
                Download JSON
              </button>
              <CopyButton
                text={output}
                className="text-[#525252] hover:text-[var(--accent)] text-xs"
              />
            </div>
          }
        >
          <div className="px-4 py-3 overflow-x-auto max-h-[500px] overflow-y-auto">
            <pre className="text-[12px] leading-[1.6] bg-transparent">
              <code className="font-mono">
                <Highlighted code={output} lang="json" />
              </code>
            </pre>
          </div>
        </ToolPanel>
      )}

      {!output && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--code-bg)] px-4 py-12 text-center">
          <p className="text-sm font-mono text-[#525252]">
            Select fields and hit Generate
          </p>
        </div>
      )}
    </ToolShell>
  );
}
