import { BASE_URL } from "@/lib/api-config";

export const GRAPHQL_URL = `${BASE_URL}/graphql`;

export type Variables = Record<string, unknown>;

export type ParsedVariables =
  | { ok: true; value: Variables | undefined }
  | { ok: false; error: string };

// An empty editor sends no variables; anything else must be a JSON object.
export function parseVariables(text: string): ParsedVariables {
  if (!text.trim()) return { ok: true, value: undefined };
  try {
    const value: unknown = JSON.parse(text);
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, error: "Variables must be a JSON object." };
    }
    return { ok: true, value: value as Variables };
  } catch (e) {
    return { ok: false, error: `Variables are not valid JSON: ${(e as Error).message}` };
  }
}

/**
 * Puts each field of a selection set on its own line. Arguments, strings and
 * input objects inside parentheses are kept as written. Text with comments is
 * returned unchanged, since a comment runs to the end of its line.
 */
export function formatGraphQL(src: string): string {
  let out = "";
  let depth = 0;
  let parens = 0;
  let newline = false;
  let space = false;
  const indent = () => "  ".repeat(depth);

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "#") return src;

    if (/[\s,]/.test(ch) && !(ch === "," && parens > 0)) {
      if (parens === 0 && depth > 0) newline = true;
      else space = true;
      continue;
    }
    if (parens === 0 && ch === "{") {
      depth++;
      out = `${out.trimEnd()} {`;
      newline = true;
      space = false;
      continue;
    }
    if (parens === 0 && ch === "}") {
      depth = Math.max(0, depth - 1);
      out = `${out.trimEnd()}\n${indent()}}`;
      newline = space = false;
      continue;
    }

    if (newline) out += `\n${indent()}`;
    else if (space && out && !out.endsWith("(")) out += " ";
    newline = space = false;

    if (ch === '"') {
      // Copy the string as written, including escaped quotes.
      let j = i + 1;
      while (j < src.length && src[j] !== '"') j += src[j] === "\\" ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j;
      continue;
    }
    if (ch === "(") parens++;
    if (ch === ")") {
      parens = Math.max(0, parens - 1);
      out = out.trimEnd();
    }
    out += ch;
  }
  return out.trim();
}

const sq = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;

function payload(query: string, variables?: Variables) {
  return variables ? { query, variables } : { query };
}

export function graphqlCurl(query: string, variables?: Variables): string {
  return [
    `curl -X POST ${sq(GRAPHQL_URL)}`,
    `-H 'Content-Type: application/json'`,
    `-d ${sq(JSON.stringify(payload(query, variables)))}`,
  ].join(" \\\n  ");
}

const templateLiteral = (s: string) =>
  "`\n" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "\n`";

const indentJson = (value: unknown, by: string) =>
  JSON.stringify(value, null, 2).replace(/\n/g, `\n${by}`);

export function graphqlFetch(query: string, variables?: Variables): string {
  const fields = [`    query: ${templateLiteral(query)},`];
  if (variables) fields.push(`    variables: ${indentJson(variables, "    ")},`);
  return [
    `const res = await fetch(${JSON.stringify(GRAPHQL_URL)}, {`,
    `  method: "POST",`,
    `  headers: { "Content-Type": "application/json" },`,
    `  body: JSON.stringify({`,
    ...fields,
    `  }),`,
    `});`,
    `const { data, errors } = await res.json();`,
    `console.log(data, errors);`,
  ].join("\n");
}

// A JSON value written as a Python literal (true -> True, null -> None).
function pyLiteral(value: unknown, pad = ""): string {
  if (value === null) return "None";
  if (value === true) return "True";
  if (value === false) return "False";
  if (typeof value === "number" || typeof value === "string") return JSON.stringify(value);
  const inner = `${pad}    `;
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return `[\n${value.map((v) => `${inner}${pyLiteral(v, inner)},`).join("\n")}\n${pad}]`;
  }
  const entries = Object.entries(value as Variables);
  if (!entries.length) return "{}";
  return `{\n${entries
    .map(([k, v]) => `${inner}${JSON.stringify(k)}: ${pyLiteral(v, inner)},`)
    .join("\n")}\n${pad}}`;
}

export function graphqlPython(query: string, variables?: Variables): string {
  const lines = [
    "import requests",
    "",
    `query = """\n${query.replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"')}\n"""`,
  ];
  if (variables) lines.push(`variables = ${pyLiteral(variables)}`);
  lines.push(
    "",
    "res = requests.post(",
    `    ${JSON.stringify(GRAPHQL_URL)},`,
    `    json={"query": query${variables ? ', "variables": variables' : ""}},`,
    ")",
    "print(res.json())"
  );
  return lines.join("\n");
}

// GraphQL reports failures in the body, often with a 200 status.
export function graphqlErrors(text: string): string[] {
  try {
    const body = JSON.parse(text) as { errors?: { message?: string }[] };
    return Array.isArray(body.errors) ? body.errors.map((e) => e.message ?? "Unknown error") : [];
  } catch {
    return [];
  }
}
