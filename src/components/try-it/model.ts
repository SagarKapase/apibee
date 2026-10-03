import { BASE_URL, type Endpoint, type Method, type Param } from "@/lib/api-config";

export interface Row {
  id: number;
  key: string;
  value: string;
  doc?: Param;
  custom?: boolean;
}

export interface FormRow {
  id: number;
  key: string;
  value: string;
  isFile: boolean;
  file?: File | null;
}

export interface RequestState {
  method: Method;
  pathValues: Record<string, string>;
  query: Row[];
  headers: Row[];
  body: string;
  form: FormRow[];
  binary: File | null;
}

let nextId = 1;
export const newId = () => nextId++;

// Browsers refuse to set these, so the panel shows them but never sends them.
export const FORBIDDEN_HEADERS = new Set([
  "accept-charset",
  "accept-encoding",
  "connection",
  "content-length",
  "cookie",
  "date",
  "host",
  "keep-alive",
  "origin",
  "referer",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "user-agent",
]);

export function initialState(endpoint: Endpoint): RequestState {
  const req = endpoint.request;
  const exampleQuery = new Map(req.query.map(([k, v]) => [k.toLowerCase(), v]));
  const exampleHeaders = new Map(req.headers.map(([k, v]) => [k.toLowerCase(), [k, v] as const]));

  const query: Row[] = endpoint.params
    .filter((p) => p.in === "query")
    .map((p) => ({ id: newId(), key: p.name, value: exampleQuery.get(p.name.toLowerCase()) ?? "", doc: p }));
  const documented = new Set(query.map((r) => r.key.toLowerCase()));
  for (const [k, v] of req.query) {
    if (!documented.has(k.toLowerCase())) query.push({ id: newId(), key: k, value: v });
  }

  const headers: Row[] = endpoint.params
    .filter((p) => p.in === "header")
    .map((p) => ({
      id: newId(),
      key: p.name,
      value: exampleHeaders.get(p.name.toLowerCase())?.[1] ?? "",
      doc: p,
    }));
  const documentedHeaders = new Set(headers.map((r) => r.key.toLowerCase()));
  for (const [k, v] of req.headers) {
    if (documentedHeaders.has(k.toLowerCase())) continue;
    // The browser sets the multipart boundary itself.
    if (req.bodyType === "multipart" && k.toLowerCase() === "content-type") continue;
    headers.push({ id: newId(), key: k, value: v });
  }
  if (req.basic && !req.digest) {
    headers.push({ id: newId(), key: "Authorization", value: `Basic ${btoa(req.basic)}` });
  }

  return {
    method: endpoint.exampleRequest.method,
    pathValues: { ...req.pathParams },
    query,
    headers,
    body: req.body ?? "",
    form: req.form.map(([key, value, isFile]) => ({ id: newId(), key, value, isFile })),
    binary: null,
  };
}

// ── Credentials ──────────────────────────────────────────────────────────

export type Credentials = Record<string, string>;

const STORE_KEY = "testingapis:credentials";

export function loadCredentials(): Credentials {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveCredentials(creds: Credentials) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(creds));
  } catch {
    // Storage can be unavailable (private mode); credentials then last for the visit.
  }
}

async function postJson(path: string, body: unknown) {
  const res = await fetch(BASE_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return res.json();
}

async function jwtLogin(username: string, password: string) {
  return postJson("/api/auth/jwt/login", { username, password });
}

export interface PlaceholderInfo {
  label: string;
  hint: string;
  /** Values generated for every request instead of entered by the user. */
  generated?: boolean;
  /** Fetches the value (and sometimes related ones) from the API. */
  fetch?: () => Promise<Credentials>;
}

export const PLACEHOLDERS: Record<string, PlaceholderInfo> = {
  userJwt: {
    label: "User JWT",
    hint: "POST /api/auth/jwt/login as user / user123.",
    fetch: async () => {
      const r = await jwtLogin("user", "user123");
      return { userJwt: r.accessToken, refreshToken: r.refreshToken };
    },
  },
  adminJwt: {
    label: "Admin JWT",
    hint: "POST /api/auth/jwt/login as admin / admin123.",
    fetch: async () => ({ adminJwt: (await jwtLogin("admin", "admin123")).accessToken }),
  },
  refreshToken: {
    label: "Refresh token",
    hint: "POST /api/auth/jwt/login as user / user123.",
    fetch: async () => {
      const r = await jwtLogin("user", "user123");
      return { userJwt: r.accessToken, refreshToken: r.refreshToken };
    },
  },
  legacyJwt: {
    label: "Original API JWT",
    hint: "POST /api/User/Login as Michael / Thompson.",
    fetch: async () => ({
      legacyJwt: (await postJson("/api/User/Login", { username: "Michael", password: "Thompson" })).token,
    }),
  },
  oauthAccessToken: {
    label: "OAuth access token",
    hint: "POST /api/auth/oauth/token with the password grant as apibee / password123.",
    fetch: async () => {
      const res = await fetch(`${BASE_URL}/api/auth/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "password",
          username: "apibee",
          password: "password123",
          client_id: "apibee-client",
          client_secret: "apibee-secret",
        }),
      });
      if (!res.ok) throw new Error(`/api/auth/oauth/token returned ${res.status}`);
      return { oauthAccessToken: (await res.json()).access_token };
    },
  },
  csrfToken: {
    label: "CSRF token",
    hint: "GET /api/auth/csrf/token. The matching cookie cannot be sent from this page.",
    fetch: async () => {
      const res = await fetch(`${BASE_URL}/api/auth/csrf/token`);
      if (!res.ok) throw new Error(`/api/auth/csrf/token returned ${res.status}`);
      return { csrfToken: (await res.json()).csrfToken };
    },
  },
  sessionId: {
    label: "Session ID",
    hint: "The apibee_session cookie from POST /api/cookies/login. Browsers do not send cookies to another site, so use the curl example for this one.",
  },
  uuid: { label: "Idempotency key", hint: "A new UUID for every request.", generated: true },
  unixTimestamp: { label: "Timestamp", hint: "The current Unix time, set when you send.", generated: true },
  hmacSignature: {
    label: "Signature",
    hint: "HMAC-SHA256 of \"{timestamp}.{body}\" with apibee-hmac-secret, computed when you send.",
    generated: true,
  },
};

const PLACEHOLDER = /\{\{(\w+)\}\}/g;

export function placeholdersIn(texts: string[]): string[] {
  const found = new Set<string>();
  for (const text of texts) for (const m of text.matchAll(PLACEHOLDER)) found.add(m[1]);
  return [...found].filter((name) => name in PLACEHOLDERS);
}

export function fill(text: string, values: Credentials): string {
  return text.replace(PLACEHOLDER, (whole, name) => values[name] || whole);
}

async function hmacHex(key: string, message: string) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Saved credentials plus values that must be fresh for each request. */
export async function valuesForSend(state: RequestState, creds: Credentials): Promise<Credentials> {
  const values: Credentials = { ...creds, uuid: crypto.randomUUID() };
  const timestamp = String(Math.floor(Date.now() / 1000));
  values.unixTimestamp = timestamp;
  values.hmacSignature = await hmacHex("apibee-hmac-secret", `${timestamp}.${fill(state.body, values)}`);
  return values;
}

// ── URL and body ─────────────────────────────────────────────────────────

export function buildUrl(
  endpoint: Endpoint,
  state: RequestState,
  values: Credentials,
  origin = BASE_URL
): string {
  let path = endpoint.path;
  for (const [name, value] of Object.entries(state.pathValues)) {
    const filled = fill(value, values);
    // A catch-all segment such as /api/echo/{path} may contain slashes.
    const encoded = filled.split("/").map(encodeURIComponent).join("/");
    path = path.replace(`{${name}}`, filled ? encoded : `{${name}}`);
  }
  const params = state.query
    .filter((r) => r.key && r.value !== "")
    .map((r) => `${encodeURIComponent(r.key)}=${encodeURIComponent(fill(r.value, values))}`);
  return origin + path + (params.length ? `?${params.join("&")}` : "");
}

export function sendableHeaders(state: RequestState, values: Credentials): [string, string][] {
  return state.headers
    .filter((r) => r.key && r.value !== "" && !FORBIDDEN_HEADERS.has(r.key.toLowerCase()))
    .map((r) => [r.key, fill(r.value, values)]);
}

export function methodHasBody(method: Method) {
  return method !== "GET" && method !== "HEAD";
}

// ── Code samples ─────────────────────────────────────────────────────────

const sq = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;
const js = (s: string) => JSON.stringify(s);
const py = (s: string) => JSON.stringify(s);

export function toCurl(endpoint: Endpoint, state: RequestState, values: Credentials): string {
  const url = buildUrl(endpoint, state, values);
  const lines = [`curl${state.method === "GET" ? "" : ` -X ${state.method}`} ${sq(url)}`];
  for (const [k, v] of sendableHeaders(state, values)) lines.push(`-H ${sq(`${k}: ${v}`)}`);
  const type = endpoint.request.bodyType;
  if (endpoint.request.digest && endpoint.request.basic) {
    lines.push(`--digest -u ${sq(endpoint.request.basic)}`);
  }
  if (methodHasBody(state.method)) {
    if (type === "form") {
      for (const f of state.form) lines.push(`--data-urlencode ${sq(`${f.key}=${fill(f.value, values)}`)}`);
    } else if (type === "multipart") {
      for (const f of state.form) {
        lines.push(`-F ${sq(`${f.key}=${f.isFile ? `@${f.file?.name ?? f.value}` : fill(f.value, values)}`)}`);
      }
    } else if (type === "binary") {
      lines.push(`--data-binary @${state.binary?.name ?? "file.bin"}`);
    } else if (state.body) {
      lines.push(`-d ${sq(fill(state.body, values))}`);
    }
  }
  return lines.join(" \\\n  ");
}

export function toFetch(endpoint: Endpoint, state: RequestState, values: Credentials): string {
  const url = buildUrl(endpoint, state, values);
  const type = endpoint.request.bodyType;
  const headers = sendableHeaders(state, values);
  const pre: string[] = [];
  const opts: string[] = [];
  if (state.method !== "GET") opts.push(`method: ${js(state.method)}`);
  if (headers.length) {
    opts.push(`headers: {\n${headers.map(([k, v]) => `    ${js(k)}: ${js(v)},`).join("\n")}\n  }`);
  }
  if (methodHasBody(state.method)) {
    if (type === "form") {
      opts.push(
        `body: new URLSearchParams({\n${state.form
          .map((f) => `    ${js(f.key)}: ${js(fill(f.value, values))},`)
          .join("\n")}\n  })`
      );
    } else if (type === "multipart") {
      pre.push("const form = new FormData();");
      for (const f of state.form) {
        pre.push(
          f.isFile
            ? `form.append(${js(f.key)}, fileInput.files[0]); // ${f.file?.name ?? f.value}`
            : `form.append(${js(f.key)}, ${js(fill(f.value, values))});`
        );
      }
      opts.push("body: form");
    } else if (type === "binary") {
      opts.push("body: fileInput.files[0]");
    } else if (state.body) {
      opts.push(`body: ${js(fill(state.body, values))}`);
    }
  }
  const call = opts.length
    ? `const res = await fetch(${js(url)}, {\n  ${opts.join(",\n  ")},\n});`
    : `const res = await fetch(${js(url)});`;
  return [...pre, ...(pre.length ? [""] : []), call, "console.log(res.status, await res.text());"].join("\n");
}

export function toPython(endpoint: Endpoint, state: RequestState, values: Credentials): string {
  const url = buildUrl(endpoint, state, values);
  const type = endpoint.request.bodyType;
  const headers = sendableHeaders(state, values);
  const args = [py(url)];
  const imports = ["import requests"];
  if (headers.length) {
    args.push(`headers={\n${headers.map(([k, v]) => `        ${py(k)}: ${py(v)},`).join("\n")}\n    }`);
  }
  if (endpoint.request.digest && endpoint.request.basic) {
    const [user, pass] = endpoint.request.basic.split(":");
    imports.push("from requests.auth import HTTPDigestAuth");
    args.push(`auth=HTTPDigestAuth(${py(user)}, ${py(pass ?? "")})`);
  }
  if (methodHasBody(state.method)) {
    if (type === "form") {
      args.push(`data={${state.form.map((f) => `${py(f.key)}: ${py(fill(f.value, values))}`).join(", ")}}`);
    } else if (type === "multipart") {
      const files = state.form.filter((f) => f.isFile);
      const fields = state.form.filter((f) => !f.isFile);
      if (files.length) {
        args.push(
          `files={${files.map((f) => `${py(f.key)}: open(${py(f.file?.name ?? f.value)}, "rb")`).join(", ")}}`
        );
      }
      if (fields.length) {
        args.push(`data={${fields.map((f) => `${py(f.key)}: ${py(fill(f.value, values))}`).join(", ")}}`);
      }
    } else if (type === "binary") {
      args.push(`data=open(${py(state.binary?.name ?? "file.bin")}, "rb")`);
    } else if (state.body) {
      args.push(`data=${py(fill(state.body, values))}`);
    }
  }
  const fn = state.method.toLowerCase();
  const call =
    args.length === 1
      ? `res = requests.${fn}(${args[0]})`
      : `res = requests.${fn}(\n    ${args.join(",\n    ")},\n)`;
  return `${imports.join("\n")}\n\n${call}\nprint(res.status_code, res.text)`;
}
