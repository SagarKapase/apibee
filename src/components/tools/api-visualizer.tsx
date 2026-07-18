"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { ToolShell } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";

// ─── Types ──────────────────────────────────────
interface ApiNode {
  id: string;
  name: string;
  type: "root" | "folder" | "request";
  parentId: string | null;
  method?: string;
  path?: string;
  description?: string;
  body?: Record<string, unknown> | string | null;
  headers?: { key: string; value: string }[];
  itemCount?: number;
  version?: string;
  children?: ApiNode[];
}

interface Stats {
  total: number;
  get: number;
  post: number;
  put: number;
  delete: number;
  patch: number;
}

type Format = "postman" | "openapi" | "custom" | null;

const HTTP_METHODS = ["get", "post", "put", "delete", "patch", "options", "head"];

const METHOD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  GET: { bg: "bg-emerald-500/15", text: "text-emerald-500", border: "border-emerald-500" },
  POST: { bg: "bg-blue-500/15", text: "text-blue-500", border: "border-blue-500" },
  PUT: { bg: "bg-amber-500/15", text: "text-amber-500", border: "border-amber-500" },
  DELETE: { bg: "bg-red-500/15", text: "text-red-500", border: "border-red-500" },
  PATCH: { bg: "bg-violet-500/15", text: "text-violet-500", border: "border-violet-500" },
  OPTIONS: { bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500" },
  HEAD: { bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500" },
};

const mc = (m: string) => METHOD_COLORS[m] || METHOD_COLORS.GET;

// ─── Sample data ────────────────────────────────
const SAMPLES: Record<string, { label: string; data: object }> = {
  postman: {
    label: "Postman Collection",
    data: {
      info: { name: "Auth API", version: "v2.0" },
      item: [
        {
          name: "User Management",
          item: [
            { name: "Login", request: { method: "POST", url: "https://api.example.com/v1/auth/login", description: "Authenticates user and returns a token." } },
            { name: "Get Profile", request: { method: "GET", url: "https://api.example.com/v1/user/profile" } },
            { name: "Update Profile", request: { method: "PUT", url: "https://api.example.com/v1/user/profile" } },
            { name: "Delete Account", request: { method: "DELETE", url: "https://api.example.com/v1/user/:id" } },
          ],
        },
        {
          name: "Products",
          item: [
            { name: "List Products", request: { method: "GET", url: "https://api.example.com/v1/products" } },
            { name: "Create Product", request: { method: "POST", url: "https://api.example.com/v1/products", body: { raw: '{"name":"Widget","price":9.99}' } } },
            { name: "Update Product", request: { method: "PATCH", url: "https://api.example.com/v1/products/:id" } },
            { name: "Delete Product", request: { method: "DELETE", url: "https://api.example.com/v1/products/:id" } },
          ],
        },
        {
          name: "Payments",
          item: [
            { name: "Create Payment", request: { method: "POST", url: "https://api.example.com/v1/payments", body: { raw: '{"amount":100,"currency":"USD"}' } } },
            { name: "Get Payment", request: { method: "GET", url: "https://api.example.com/v1/payments/:id" } },
            { name: "Refund", request: { method: "POST", url: "https://api.example.com/v1/payments/:id/refund" } },
          ],
        },
      ],
    },
  },
  openapi: {
    label: "OpenAPI 3.0",
    data: {
      openapi: "3.0.3",
      info: { title: "Petstore API", version: "1.0.0" },
      servers: [{ url: "https://petstore.example.com/api/v1" }],
      paths: {
        "/pets": {
          get: { tags: ["Pets"], summary: "List all pets", description: "Returns a paginated list of pets." },
          post: { tags: ["Pets"], summary: "Create a pet", requestBody: { content: { "application/json": { example: { name: "Buddy", species: "dog", age: 3 } } } } },
        },
        "/pets/{petId}": {
          get: { tags: ["Pets"], summary: "Get pet by ID" },
          put: { tags: ["Pets"], summary: "Update a pet" },
          delete: { tags: ["Pets"], summary: "Delete a pet" },
        },
        "/store/inventory": { get: { tags: ["Store"], summary: "Get inventory" } },
        "/store/orders": { post: { tags: ["Store"], summary: "Place an order" } },
        "/store/orders/{orderId}": {
          get: { tags: ["Store"], summary: "Get order by ID" },
          delete: { tags: ["Store"], summary: "Cancel order" },
        },
      },
    },
  },
  custom: {
    label: "Custom JSON",
    data: {
      name: "E-Commerce API",
      version: "v3.0",
      products: [
        { name: "List Products", method: "GET", url: "/api/products" },
        { name: "Create Product", method: "POST", url: "/api/products" },
        { name: "Get Product", method: "GET", url: "/api/products/:id" },
        { name: "Delete Product", method: "DELETE", url: "/api/products/:id" },
      ],
      orders: [
        { name: "List Orders", method: "GET", url: "/api/orders" },
        { name: "Create Order", method: "POST", url: "/api/orders" },
        { name: "Get Order", method: "GET", url: "/api/orders/:id" },
      ],
      users: [
        { name: "List Users", method: "GET", url: "/api/users" },
        { name: "Get User", method: "GET", url: "/api/users/:id" },
        { name: "Update User", method: "PUT", url: "/api/users/:id" },
      ],
    },
  },
};

// ─── Parsers ────────────────────────────────────
function detectFormat(data: Record<string, unknown>): Format {
  if (data.openapi || data.swagger) return "openapi";
  if (data.info && data.item && Array.isArray(data.item)) return "postman";
  return "custom";
}

function formatLabel(fmt: Format): string {
  if (fmt === "openapi") return "OpenAPI";
  if (fmt === "postman") return "Postman";
  if (fmt === "custom") return "Custom JSON";
  return "Unknown";
}

function parseOpenApi(data: Record<string, unknown>): { nodes: ApiNode[]; stats: Stats } {
  const info = (data.info || {}) as Record<string, unknown>;
  const servers = data.servers as Array<{ url: string }> | undefined;
  let baseUrl = "";
  if (servers && servers.length > 0) baseUrl = (servers[0].url || "").replace(/\/+$/, "");
  else if (data.host) {
    const scheme = ((data.schemes as string[]) || ["https"])[0];
    baseUrl = `${scheme}://${data.host}${data.basePath || ""}`.replace(/\/+$/, "");
  }

  const stats: Stats = { total: 0, get: 0, post: 0, put: 0, delete: 0, patch: 0 };
  const root: ApiNode = {
    id: "root",
    name: (info.title as string) || "API",
    version: (info.version as string) || "",
    type: "root",
    parentId: null,
    itemCount: 0,
    children: [],
  };

  const tagGroups: Record<string, ApiNode[]> = {};
  const paths = (data.paths || {}) as Record<string, Record<string, unknown>>;
  let nid = 0;

  Object.entries(paths).forEach(([pathStr, pathObj]) => {
    if (!pathObj) return;
    HTTP_METHODS.forEach((method) => {
      const op = pathObj[method] as Record<string, unknown> | undefined;
      if (!op) return;
      const upper = method.toUpperCase();
      const tags = (op.tags as string[]) || ["Default"];
      let body: Record<string, unknown> | string | null = null;
      const rb = op.requestBody as Record<string, unknown> | undefined;
      if (rb?.content) {
        const ct = rb.content as Record<string, Record<string, unknown>>;
        const json = ct["application/json"];
        if (json?.example) body = json.example as Record<string, unknown>;
      }
      tags.forEach((tag) => {
        if (!tagGroups[tag]) tagGroups[tag] = [];
        tagGroups[tag].push({
          id: `n-${nid++}`,
          name: (op.summary as string) || (op.operationId as string) || `${upper} ${pathStr}`,
          type: "request",
          parentId: "",
          method: upper,
          path: `${baseUrl}${pathStr}`,
          description: (op.description as string) || (op.summary as string) || "",
          body,
        });
      });
      const k = method as keyof Stats;
      if (k in stats) (stats[k] as number)++;
      stats.total++;
    });
  });

  Object.entries(tagGroups).forEach(([tag, endpoints]) => {
    const folderId = `f-${nid++}`;
    const folder: ApiNode = {
      id: folderId,
      name: tag,
      type: "folder",
      parentId: "root",
      itemCount: endpoints.length,
      children: endpoints.map((ep) => ({ ...ep, parentId: folderId })),
    };
    root.children!.push(folder);
  });
  root.itemCount = stats.total;
  return { nodes: [root], stats };
}

function parsePostman(data: Record<string, unknown>): { nodes: ApiNode[]; stats: Stats } {
  const info = (data.info || {}) as Record<string, unknown>;
  const stats: Stats = { total: 0, get: 0, post: 0, put: 0, delete: 0, patch: 0 };
  let nid = 0;

  const root: ApiNode = {
    id: "root",
    name: (info.name as string) || "Collection",
    version: (info.version as string) || "",
    type: "root",
    parentId: null,
    itemCount: 0,
    children: [],
  };

  function processItem(item: Record<string, unknown>, parentId: string): ApiNode {
    const nodeId = `n-${nid++}`;
    if (item.item && Array.isArray(item.item)) {
      const folder: ApiNode = {
        id: nodeId,
        name: (item.name as string) || "Folder",
        type: "folder",
        parentId,
        itemCount: (item.item as unknown[]).length,
        children: [],
      };
      (item.item as Record<string, unknown>[]).forEach((child) => {
        folder.children!.push(processItem(child, nodeId));
      });
      return folder;
    }
    const req = (item.request || item) as Record<string, unknown>;
    const rawUrl = req.url;
    const url = typeof rawUrl === "string" ? rawUrl : (rawUrl as Record<string, unknown>)?.raw as string || "";
    const method = ((req.method as string) || "GET").toUpperCase();
    const ml = method.toLowerCase() as keyof Stats;
    if (ml in stats) (stats[ml] as number)++;
    stats.total++;
    let body: Record<string, unknown> | string | null = null;
    const reqBody = req.body as Record<string, unknown> | undefined;
    if (reqBody?.raw) {
      try { body = JSON.parse(reqBody.raw as string) as Record<string, unknown>; } catch { body = reqBody.raw as string; }
    }
    return {
      id: nodeId,
      name: (item.name as string) || `${method} ${url}`,
      type: "request",
      parentId,
      method,
      path: url,
      description: extractDesc(item) || extractDesc(req) || "",
      body,
    };
  }

  if (data.item && Array.isArray(data.item)) {
    (data.item as Record<string, unknown>[]).forEach((item) => {
      root.children!.push(processItem(item, "root"));
    });
  }
  root.itemCount = stats.total;
  return { nodes: [root], stats };
}

function extractDesc(obj: Record<string, unknown>): string {
  const d = obj.description;
  if (!d) return "";
  if (typeof d === "string") return d;
  return (d as Record<string, unknown>).content as string || "";
}

function parseCustom(data: Record<string, unknown>): { nodes: ApiNode[]; stats: Stats } {
  const stats: Stats = { total: 0, get: 0, post: 0, put: 0, delete: 0, patch: 0 };
  let nid = 0;

  const root: ApiNode = {
    id: "root",
    name: (data.name as string) || (data.title as string) || "API Collection",
    version: (data.version as string) || "",
    type: "root",
    parentId: null,
    itemCount: 0,
    children: [],
  };

  const norm = (ep: Record<string, unknown>) => {
    const method = ((ep.method || ep.type || ep.httpMethod || "GET") as string).toUpperCase();
    const url = (ep.url || ep.path || ep.endpoint || ep.route || "") as string;
    const name = (ep.name || ep.title || ep.summary || `${method} ${url}`) as string;
    return { method, url, name, description: (ep.description || "") as string, body: (ep.body as Record<string, unknown> | string | null) || null };
  };

  const addEndpoints = (endpoints: Record<string, unknown>[], parentId: string) => {
    return endpoints.map((ep) => {
      const n = norm(ep);
      const ml = n.method.toLowerCase() as keyof Stats;
      if (ml in stats) (stats[ml] as number)++;
      stats.total++;
      return { id: `n-${nid++}`, name: n.name, type: "request" as const, parentId, method: n.method, path: n.url, description: n.description, body: n.body };
    });
  };

  if (Array.isArray(data)) {
    root.children = addEndpoints(data as Record<string, unknown>[], "root");
  } else {
    const flat = data.endpoints || data.routes || data.apis;
    if (Array.isArray(flat)) {
      root.children = addEndpoints(flat as Record<string, unknown>[], "root");
    } else {
      const meta = ["name", "title", "version", "description", "baseUrl", "base_url", "info"];
      const groups = Object.entries(data).filter(([k, v]) => Array.isArray(v) && !meta.includes(k));
      if (groups.length > 0) {
        groups.forEach(([groupName, endpoints]) => {
          const fid = `f-${nid++}`;
          const children = addEndpoints(endpoints as Record<string, unknown>[], fid);
          root.children!.push({ id: fid, name: groupName, type: "folder", parentId: "root", itemCount: children.length, children });
        });
      }
    }
  }
  root.itemCount = stats.total;
  return { nodes: [root], stats };
}

function parseData(data: unknown): { nodes: ApiNode[]; stats: Stats; format: Format } {
  if (!data || typeof data !== "object") throw new Error("Invalid data");
  const obj = data as Record<string, unknown>;
  const format = Array.isArray(data) ? "custom" : detectFormat(obj);
  if (format === "openapi") { const r = parseOpenApi(obj); return { ...r, format }; }
  if (format === "postman") { const r = parsePostman(obj); return { ...r, format }; }
  const r = parseCustom(Array.isArray(data) ? Object.assign({ endpoints: data }) : obj);
  return { ...r, format };
}

// ─── Components ─────────────────────────────────

function MethodBadge({ method }: { method: string }) {
  const c = mc(method);
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide ${c.bg} ${c.text}`}>
      {method}
    </span>
  );
}

function StatPill({ method, count }: { method: string; count: number }) {
  if (count === 0) return null;
  const c = mc(method);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${c.bg} ${c.text}`}>
      {method} <span className="opacity-70">{count}</span>
    </span>
  );
}

function EndpointDetail({ node }: { node: ApiNode }) {
  return (
    <div className="mt-2 ml-5 p-3 rounded-lg bg-[var(--code-bg)] border border-[var(--border)] text-[12px] font-mono space-y-2"
      style={{ animation: "treeReveal 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
      <div className="flex items-center gap-2">
        <MethodBadge method={node.method!} />
        <code className="text-[var(--code-fg)] break-all flex-1">{node.path}</code>
        <CopyButton text={node.path || ""} className="text-[#525252] hover:text-[var(--accent)] shrink-0" />
      </div>
      {node.description && <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">{node.description}</p>}
      {node.body && (
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Body</span>
          <pre className="mt-1 text-[11px] text-[var(--code-accent)] leading-relaxed overflow-x-auto">
            {typeof node.body === "string" ? node.body : JSON.stringify(node.body, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function TreeNode({ node, depth, isLast, search, methodFilter }: {
  node: ApiNode;
  depth: number;
  isLast: boolean;
  search: string;
  methodFilter: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState(false);

  const visibleChildren = useMemo(() => {
    if (!node.children) return [];
    return node.children.filter((child) => {
      if (child.type === "folder") {
        return hasVisibleDescendant(child, search, methodFilter);
      }
      return matchesFilters(child, search, methodFilter);
    });
  }, [node.children, search, methodFilter]);

  if (node.type === "root") {
    return (
      <div>
        {/* Root card */}
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-[var(--accent)]/10 to-transparent border border-[var(--accent)]/20"
          style={{ animation: "treeReveal 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--accent)]">
                <circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-[var(--text)] text-sm">{node.name}</h3>
              {node.version && <span className="text-[10px] font-mono text-[var(--text-muted)]">{node.version}</span>}
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">{node.itemCount} endpoint{node.itemCount !== 1 ? "s" : ""}</p>
        </div>
        {/* Children */}
        <div className="space-y-0">
          {visibleChildren.map((child, i) => (
            <TreeNode key={child.id} node={child} depth={1} isLast={i === visibleChildren.length - 1} search={search} methodFilter={methodFilter} />
          ))}
        </div>
      </div>
    );
  }

  if (node.type === "folder") {
    return (
      <div style={{ animation: `treeReveal 0.35s cubic-bezier(0.16,1,0.3,1) ${depth * 30}ms both` }}>
        <div className="flex items-start">
          {/* Tree line */}
          <div className="flex flex-col items-center w-5 shrink-0" style={{ marginLeft: (depth - 1) * 20 }}>
            <div className={`w-px flex-1 ${isLast ? "" : "bg-[var(--border)]"}`} />
            <div className="w-2.5 h-px bg-[var(--border)]" style={{ marginTop: 18 }} />
          </div>
          {/* Folder card */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--accent-soft)] transition-all duration-200 cursor-pointer text-left group active:scale-[0.99] my-0.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${collapsed ? "" : "rotate-90"}`}>
              <path d="m9 18 6-6-6-6" />
            </svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--accent)] shrink-0">
              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
            </svg>
            <span className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{node.name}</span>
            <span className="text-[10px] font-mono text-[var(--text-muted)] ml-auto">{node.itemCount}</span>
          </button>
        </div>
        {/* Folder children — animated expand */}
        {!collapsed && visibleChildren.length > 0 && (
          <div className="relative" style={{ marginLeft: (depth - 1) * 20 + 10 }}>
            {!isLast && <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--border)]" />}
            <div className="ml-2.5">
              {visibleChildren.map((child, i) => (
                <TreeNode key={child.id} node={child} depth={depth + 1} isLast={i === visibleChildren.length - 1} search={search} methodFilter={methodFilter} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Endpoint node
  return (
    <div style={{ animation: `treeReveal 0.3s cubic-bezier(0.16,1,0.3,1) ${depth * 20}ms both` }}>
      <div className="flex items-start">
        <div className="flex flex-col items-center w-5 shrink-0" style={{ marginLeft: (depth - 1) * 20 }}>
          <div className={`w-px flex-1 ${isLast ? "" : "bg-[var(--border)]"}`} />
          <div className="w-2.5 h-px bg-[var(--border)]" style={{ marginTop: 14 }} />
        </div>
        <button
          onClick={() => setSelected(!selected)}
          className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer text-left my-0.5 active:scale-[0.99] ${
            selected ? "bg-[var(--accent-soft)] border border-[var(--accent)]/30" : "hover:bg-[var(--accent-soft)] border border-transparent"
          }`}
        >
          <MethodBadge method={node.method || "GET"} />
          <span className="text-[13px] text-[var(--text)] truncate">{node.name}</span>
          {node.path && <span className="text-[11px] font-mono text-[var(--text-muted)] truncate ml-auto hidden sm:block max-w-[200px]">{node.path}</span>}
        </button>
      </div>
      {selected && <EndpointDetail node={node} />}
    </div>
  );
}

function matchesFilters(node: ApiNode, search: string, methodFilter: string): boolean {
  if (node.type !== "request") return true;
  const ms = !search || (node.name.toLowerCase().includes(search.toLowerCase()) || (node.path || "").toLowerCase().includes(search.toLowerCase()));
  const mf = methodFilter === "ALL" || node.method === methodFilter;
  return ms && mf;
}

function hasVisibleDescendant(node: ApiNode, search: string, methodFilter: string): boolean {
  if (!node.children) return matchesFilters(node, search, methodFilter);
  return node.children.some((c) => c.type === "folder" ? hasVisibleDescendant(c, search, methodFilter) : matchesFilters(c, search, methodFilter));
}

// ─── Main component ─────────────────────────────

export function ApiVisualizer() {
  const [view, setView] = useState<"input" | "graph">("input");
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tree, setTree] = useState<ApiNode[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [format, setFormat] = useState<Format>(null);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const fileRef = useRef<HTMLInputElement>(null);

  const detectedFormat = useMemo<Format>(() => {
    if (!jsonText.trim()) return null;
    try {
      const d = JSON.parse(jsonText);
      if (!d || typeof d !== "object") return null;
      return Array.isArray(d) ? "custom" : detectFormat(d as Record<string, unknown>);
    } catch { return null; }
  }, [jsonText]);

  const quickStats = useMemo(() => {
    if (!jsonText.trim()) return null;
    try {
      const d = JSON.parse(jsonText);
      const { stats: s } = parseData(d);
      return s;
    } catch { return null; }
  }, [jsonText]);

  const loadSample = useCallback((key: string) => {
    const s = SAMPLES[key];
    if (s) { setJsonText(JSON.stringify(s.data, null, 2)); setError(null); }
  }, []);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setJsonText(reader.result as string); setError(null); };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const visualize = useCallback(() => {
    if (!jsonText.trim()) { setError("Paste an API spec first."); return; }
    try {
      const data = JSON.parse(jsonText);
      const result = parseData(data);
      setTree(result.nodes);
      setStats(result.stats);
      setFormat(result.format);
      setError(null);
      setSearch("");
      setMethodFilter("ALL");
      setView("graph");
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
    }
  }, [jsonText]);

  return (
    <ToolShell title="API Visualizer" description="Paste a Postman Collection, OpenAPI spec, or custom JSON. See your API as an interactive tree.">
      {view === "input" ? (
        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex gap-1.5">
              {Object.entries(SAMPLES).map(([key, s]) => (
                <button key={key} onClick={() => loadSample(key)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)] transition-all duration-150 cursor-pointer active:scale-95">
                  {s.label}
                </button>
              ))}
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)] transition-all duration-150 cursor-pointer active:scale-95 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></svg>
              Upload
            </button>
            <input ref={fileRef} type="file" accept=".json,.yaml,.yml" className="hidden" onChange={handleFile} />
            {detectedFormat && (
              <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent-soft)] text-[var(--accent)]">
                {formatLabel(detectedFormat)}
              </span>
            )}
          </div>

          {/* Input */}
          <div className="rounded-xl border border-[var(--border)] overflow-hidden terminal-glow">
            <textarea
              value={jsonText}
              onChange={(e) => { setJsonText(e.target.value); setError(null); }}
              className="w-full min-h-[350px] bg-[var(--code-bg)] px-4 py-3 text-[13px] font-mono text-[var(--code-fg)] resize-y outline-none leading-[1.6] placeholder-[#525252] focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
              placeholder='Paste your Postman Collection, OpenAPI spec, or custom JSON here...'
              spellCheck={false}
            />
          </div>

          {/* Quick stats */}
          {quickStats && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-[var(--text-muted)]">{quickStats.total} endpoints:</span>
              <StatPill method="GET" count={quickStats.get} />
              <StatPill method="POST" count={quickStats.post} />
              <StatPill method="PUT" count={quickStats.put} />
              <StatPill method="DELETE" count={quickStats.delete} />
              <StatPill method="PATCH" count={quickStats.patch} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-[12px] text-red-400 font-mono">
              {error}
            </div>
          )}

          {/* Visualize button */}
          <div className="mt-4">
            <button onClick={visualize}
              className="btn-press px-6 py-2.5 bg-[var(--accent)] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-[var(--ring)] transition-all cursor-pointer active:scale-95">
              Visualize
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="inline ml-1.5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <p className="mt-4 text-[11px] text-[var(--text-muted)]">
            Supports Postman Collections, OpenAPI 3.x, Swagger 2.x, and custom JSON formats. Paste JSON only — YAML support coming soon.
          </p>
        </div>
      ) : (
        <div>
          {/* Graph toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-[var(--border)]">
            <button onClick={() => setView("input")}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)] transition-colors cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
              Back
            </button>

            <div className="flex-1 min-w-[140px] max-w-[280px]">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search endpoints..."
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors" />
            </div>

            <div className="flex gap-0.5 overflow-x-auto">
              {["ALL", "GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
                <button key={m} onClick={() => setMethodFilter(m)}
                  className={`px-2 py-1 text-[10px] font-bold font-mono rounded-md cursor-pointer transition-all duration-150 active:scale-95 ${
                    methodFilter === m
                      ? m === "ALL" ? "bg-[var(--accent)]/15 text-[var(--accent)]" : `${mc(m).bg} ${mc(m).text}`
                      : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)]"
                  }`}>
                  {m}
                </button>
              ))}
            </div>

            {format && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent-soft)] text-[var(--accent)] hidden sm:inline">
                {formatLabel(format)}
              </span>
            )}
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs font-medium text-[var(--text)]">{stats.total} endpoints</span>
              <StatPill method="GET" count={stats.get} />
              <StatPill method="POST" count={stats.post} />
              <StatPill method="PUT" count={stats.put} />
              <StatPill method="DELETE" count={stats.delete} />
              <StatPill method="PATCH" count={stats.patch} />
            </div>
          )}

          {/* Tree */}
          <div className="relative">
            {tree && tree.map((rootNode) => (
              <TreeNode key={rootNode.id} node={rootNode} depth={0} isLast={true} search={search} methodFilter={methodFilter} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes treeReveal {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToolShell>
  );
}
