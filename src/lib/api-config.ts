// Shared by server and client components. Keep this file free of catalog
// data so importing it does not pull the full API reference into a bundle.

export const BASE_URL = "https://api.snap-test.in";
export const WS_BASE_URL = "wss://api.snap-test.in";
export const HOST = "api.snap-test.in";

export type Method =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export interface Param {
  name: string;
  in: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

export interface RequestBody {
  required: boolean;
  contentTypes?: string;
  note?: string;
  description?: string;
  example?: string;
}

export interface ApiResponse {
  code: string;
  description: string;
}

export interface Endpoint {
  id: string;
  anchor: string;
  methods: Method[];
  path: string;
  summary: string;
  auth?: string;
  description?: string;
  params: Param[];
  requestBody?: RequestBody;
  responses: ApiResponse[];
  exampleRequest: { method: Method; path: string; curl: string };
  exampleResponse: { status: string; headers: [string, string][]; body: string };
}

export interface Group {
  id: string;
  name: string;
  title: string;
  description: string;
  endpoints: Endpoint[];
}

export interface Category {
  id: string;
  title: string;
  groups: Group[];
}

/** Replace the host placeholders used in the reference with real values. */
export function withHost(text: string): string {
  return text
    .replaceAll("{{wsBaseUrl}}", WS_BASE_URL)
    .replaceAll("{{baseUrl}}", BASE_URL)
    .replaceAll("{{host}}", HOST);
}

/** Absolute URL for an endpoint path. WebSocket paths get the wss:// origin. */
export function fullUrl(path: string): string {
  return (path.startsWith("/ws/") ? WS_BASE_URL : BASE_URL) + path;
}

/** Pick a highlighter language from a body's first character. */
export function bodyLang(body: string): "json" | "xml" | "text" {
  const first = body.trimStart()[0];
  if (first === "{" || first === "[") return "json";
  if (first === "<") return "xml";
  return "text";
}
