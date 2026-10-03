import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { BASE_URL, WS_BASE_URL } from "@/lib/api-config";
import { categories, endpointCount, groups } from "@/lib/api-data";

export const metadata: Metadata = {
  title: "API reference",
  description:
    "Reference for every testingapis.com endpoint: parameters, authentication, request bodies and example responses.",
};

const quickStart = `fetch('${BASE_URL}/api/Products?limit=3')
  .then(res => res.json())
  .then(data => console.log(data))`;

const simulatedError = `{
  "status": 503,
  "error": "Service Unavailable",
  "message": "Simulated error. Use ?error={code} to test different status codes.",
  "simulated": true
}`;

const notFoundError = `{
  "status": 404,
  "error": "Not Found",
  "message": "Book with ID 999 does not exist."
}`;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-14">
      <h2 className="text-xl font-semibold tracking-tight text-[var(--text)] mb-4">
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
        {children}
      </div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-[var(--surface)] border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
            {head.map((h) => (
              <th key={h} className="py-2 px-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[var(--border)] last:border-b-0 align-top"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`py-2 px-3 ${j === 0 ? "text-[var(--text)]" : "text-[var(--text-muted)]"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Url({ href, method }: { href: string; method?: string }) {
  return (
    <span className="flex items-center gap-2">
      <code className="font-mono text-[12px] text-[var(--text)] break-all">
        {method && <span className="text-[var(--text-muted)]">{method} </span>}
        {href}
      </code>
      <CopyButton text={href} label={href} hideLabel className="shrink-0" />
    </span>
  );
}

function C({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[12px] text-[var(--text)] break-words">
      {children}
    </code>
  );
}

export default function DocsPage() {
  return (
    <article className="max-w-4xl">
      <h1
        id="introduction"
        className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)]"
      >
        API reference
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--text-muted)] leading-relaxed">
        testingapis.com is a free API for testing HTTP clients. It has{" "}
        {endpointCount} endpoints in {groups.length} groups: realistic resources
        such as products, books and countries, plus endpoints for status codes,
        redirects, cookies, caching, authentication schemes, file formats,
        streaming and failure injection. Most endpoints need no credentials.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="px-3 py-1.5 bg-[var(--surface)] border-b border-[var(--border)] text-xs font-medium text-[var(--text-muted)]">
            Base URL
          </div>
          <div className="bg-[var(--code-bg)] px-4 py-3 flex items-center justify-between gap-3">
            <code className="text-sm font-mono text-[var(--code-fg)] select-all">
              {BASE_URL}
            </code>
            <CopyButton
              text={BASE_URL}
              label="base URL"
              hideLabel
              className="text-[#78716c] hover:text-[#e7e5e4]"
            />
          </div>
        </div>
        <CodeBlock label="Quick start" code={quickStart} lang="javascript" />
      </div>

      <Section id="discovery" title="Discovery">
        <Table
          head={["What", "Where"]}
          rows={[
            ["OpenAPI 3.0 document", <Url key="o" href={`${BASE_URL}/openapi/v1.json`} />],
            ["Swagger UI", <Url key="s" href={`${BASE_URL}/swagger`} />],
            ["Live route catalog", <Url key="c" method="GET" href={`${BASE_URL}/api`} />],
            [
              "Health checks",
              <div key="h" className="space-y-1">
                <Url method="GET" href={`${BASE_URL}/api/health`} />
                <Url method="GET" href={`${BASE_URL}/api/health/live`} />
                <Url method="GET" href={`${BASE_URL}/api/health/ready`} />
              </div>,
            ],
            [
              "GraphQL",
              <div key="g">
                <Url method="POST" href={`${BASE_URL}/graphql`} />
                <Link href="/docs/graphql" className="link-underline text-xs text-[var(--text)]">
                  Queries and mutations
                </Link>
              </div>,
            ],
            [
              "WebSockets",
              <div key="w" className="space-y-1">
                <Url href={`${WS_BASE_URL}/ws/echo`} />
                <Url href={`${WS_BASE_URL}/ws/ticker`} />
              </div>,
            ],
          ]}
        />
      </Section>

      <Section id="authentication" title="Authentication">
        <p>
          Endpoints without an authentication note are public. The endpoints that
          test authentication accept the fixed test credentials below. They are
          not secret.
        </p>
        <Table
          head={["Scheme", "How to send it", "Test values", "Used by"]}
          rows={[
            ["HTTP Basic", <C key="1">Authorization: Basic base64(user:pass)</C>, "apibee / password123 · Admin / Admin@1234 (original API)", <C key="u">/api/auth/basic*, /api/AuthTest/secure-data</C>],
            ["Bearer (static)", <C key="2">Authorization: Bearer &lt;token&gt;</C>, "apibee-token-123 · admin-token · user-token · readonly-token", <C key="u">/api/auth/bearer, /api/auth/roles/*</C>],
            ["JWT", <C key="3">Authorization: Bearer &lt;jwt&gt;</C>, "POST /api/auth/jwt/login with admin / admin123 or user / user123 · POST /api/User/Login with Michael / Thompson", <C key="u">/api/auth/jwt/me, /api/auth/jwt/admin, /api/Admin/authorize</C>],
            ["API key", <C key="4">X-API-Key header, ?api_key= or api_key cookie</C>, "apibee-key-123", <C key="u">/api/auth/api-key/*</C>],
            ["OAuth 2.0", <C key="5">Authorization: Bearer &lt;access_token&gt;</C>, "Clients apibee-client / apibee-secret and apibee-public (PKCE) · users apibee / password123, jane / jane123", <C key="u">/api/auth/oauth/protected, /userinfo</C>],
            ["Digest", "RFC 7616 challenge and response", "apibee / password123", <C key="u">/api/auth/digest</C>],
            ["HMAC signature", <C key="7">X-Timestamp and X-Signature headers</C>, "Secret apibee-hmac-secret", <C key="u">/api/auth/hmac</C>],
            ["Session cookie", <C key="8">Cookie apibee_session</C>, "POST /api/cookies/login with test / test123 or admin / admin123", <C key="u">/api/cookies/me</C>],
            ["CSRF", <C key="9">XSRF-TOKEN cookie and X-CSRF-Token header</C>, "Token from GET /api/auth/csrf/token", <C key="u">/api/auth/csrf/submit</C>],
          ]}
        />
        <p>
          A 401 means credentials are missing or invalid. A 403 means they are
          valid but not allowed, for example <C>user-token</C> on{" "}
          <C>/api/auth/roles/admin</C>.
        </p>
        <p>Examples use these placeholders for values that change per run:</p>
        <Table
          head={["Placeholder", "Where to get it"]}
          rows={[
            [<C key="a">{"{{userJwt}}"} / {"{{adminJwt}}"}</C>, "accessToken from POST /api/auth/jwt/login with user / user123 or admin / admin123."],
            [<C key="b">{"{{refreshToken}}"}</C>, "refreshToken from POST /api/auth/jwt/login."],
            [<C key="c">{"{{legacyJwt}}"}</C>, "token from POST /api/User/Login with Michael / Thompson (role Admin)."],
            [<C key="d">{"{{oauthAccessToken}}"}</C>, "access_token from POST /api/auth/oauth/token."],
            [<C key="e">{"{{csrfToken}}"}</C>, "token from GET /api/auth/csrf/token. The same value is set as the XSRF-TOKEN cookie."],
            [<C key="f">{"{{sessionId}}"}</C>, "apibee_session cookie set by POST /api/cookies/login (test / test123)."],
            [<C key="g">{"{{unixTimestamp}}"} / {"{{hmacSignature}}"}</C>, "The current Unix time in seconds, and the hex HMAC-SHA256 of \"{timestamp}.{raw body}\" with key apibee-hmac-secret."],
            [<C key="h">{"{{uuid}}"}</C>, "Any new UUID, used as an Idempotency-Key."],
          ]}
        />
      </Section>

      <Section id="request-options" title="Delays and simulated errors">
        <p>Two query parameters work on every endpoint:</p>
        <Table
          head={["Parameter", "Effect", "Example"]}
          rows={[
            [<C key="d">delay</C>, "Waits N seconds before responding. Maximum 10.", <C key="e">/api/Products?delay=2</C>],
            [<C key="r">error</C>, "Returns a simulated error instead of the real response: 400, 401, 403, 404, 408, 429, 500, 502 or 503. Adds the header X-Simulated: true.", <C key="e">/api/Products?error=503</C>],
          ]}
        />
        <p>
          Combined, as in <C>?delay=2&amp;error=503</C>, the request waits and
          then fails. A simulated error looks like this:
        </p>
        <CodeBlock label="Simulated error" code={simulatedError} lang="json" />
      </Section>

      <Section id="lists" title="Filtering, sorting and pagination">
        <p>
          Every resource list endpoint, such as <C>GET /api/Products</C> or{" "}
          <C>GET /api/Books</C>, accepts these query parameters:
        </p>
        <Table
          head={["Parameter", "Meaning", "Example"]}
          rows={[
            [<C key="l">limit</C>, "Page size, 1 to 100. Without it, all records are returned.", <C key="e">?limit=10</C>],
            [<C key="p">page</C>, "1-based page number. Requires limit.", <C key="e">?limit=10&amp;page=2</C>],
            [<C key="o">offset</C>, "Skip N records, as an alternative to page.", <C key="e">?limit=10&amp;offset=20</C>],
            [<C key="s">sort, order</C>, "Sort by any field. order is asc (default) or desc.", <C key="e">?sort=price&amp;order=desc</C>],
            [<C key="q">q</C>, "Case-insensitive search in title, name, body, description and text fields.", <C key="e">?q=keyboard</C>],
            [<C key="f">any field</C>, "Exact, case-insensitive filter on that property.", <C key="e">?category=books&amp;inStock=true</C>],
          ]}
        />
        <p>
          Lists return a plain JSON array. Totals are in the{" "}
          <C>X-Total-Count</C>, <C>X-Page</C>, <C>X-Per-Page</C> and{" "}
          <C>X-Total-Pages</C> headers. Cursor, Link header, keyset and HAL
          pagination are shown in{" "}
          <Link href="/docs/pagination" className="link-underline text-[var(--text)]">
            Pagination
          </Link>
          .
        </p>
      </Section>

      <Section id="responses" title="Responses and errors">
        <Table
          head={["Situation", "Status", "Body"]}
          rows={[
            ["Get one record", "200", "The record"],
            ["List records", "200", "Array of records, plus pagination headers"],
            ["Create", "201", <C key="c">{"{ message, data }"}</C>],
            ["Bulk create", "201", <C key="b">{"{ message, data: [ … ] }"}</C>],
            ["Replace or update", "200", <C key="u">{"{ message, data }"}</C>],
            ["Partial update (PATCH)", "200", <C key="p">{"{ message, changed, ignored, data }"}</C>],
            ["Delete", "200", <C key="d">{"{ message }"}</C>],
            ["Bulk delete", "200", <C key="x">{"{ message, deleted, notFound }"}</C>],
            ["Error", "4xx or 5xx", <C key="e">{"{ status, error, message }"}</C>],
            ["Model validation error", "400", "application/problem+json with errors per field"],
            ["Business validation (/api/validation/*)", "422", "application/problem+json (RFC 7807) with errors per field"],
          ]}
        />
        <CodeBlock label="Error" code={notFoundError} lang="json" />
        <p>
          Every response allows any origin (<C>Access-Control-Allow-Origin: *</C>,
          without credentials) and exposes the pagination, caching, rate limit and
          versioning headers to browser code. The <C>X-RateLimit-*</C> headers
          are informational; real limiting only happens on{" "}
          <Link href="/docs/rate-limit" className="link-underline text-[var(--text)]">
            Rate limit
          </Link>
          .
        </p>
        <p>
          All data lives in memory. Creates, updates and deletes work, but
          everything returns to the seed data when the server restarts.
        </p>
      </Section>

      <Section id="browser-notes" title="Calling from a browser">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="text-[var(--text)]">Cookies.</span> Browsers do not
            let JavaScript set the Cookie header, and cross-origin requests
            carry no credentials. Cookie-based endpoints only work from the same
            origin or through the proxy.
          </li>
          <li>
            <span className="text-[var(--text)]">Redirects.</span>{" "}
            <C>fetch()</C> follows redirects and hides the 3xx response. To see
            the real status and Location header, use the proxy.
          </li>
          <li>
            <span className="text-[var(--text)]">Proxy.</span>{" "}
            <C>POST /api/Proxy/call</C> forwards a request from the server and
            returns its status and body. It avoids CORS, cookie and redirect
            limits, but does not relay response headers.
          </li>
          <li>
            <span className="text-[var(--text)]">Streams.</span>{" "}
            <C>/api/stream/sse</C> is Server-Sent Events. The NDJSON, chunked,
            drip and JSON array streams arrive incrementally; read them with a
            streaming reader.
          </li>
          <li>
            <span className="text-[var(--text)]">WebSockets.</span>{" "}
            <C>/ws/echo</C> and <C>/ws/ticker</C> need the WebSocket API, not
            fetch.
          </li>
          <li>
            <span className="text-[var(--text)]">Digest auth.</span> Browsers
            only perform the challenge and response through their own login
            prompt.
          </li>
          <li>
            <span className="text-[var(--text)]">Failure injection.</span>{" "}
            <C>/api/chaos/abort</C> and <C>/api/chaos/partial</C> drop the
            connection on purpose. <C>/api/chaos/timeout</C> and{" "}
            <C>/api/chaos/slow</C> can take up to 60 seconds.
          </li>
          <li>
            <span className="text-[var(--text)]">Forbidden headers.</span>{" "}
            Browsers refuse to set Host, Content-Length, Accept-Encoding, Cookie
            and a few others.
          </li>
        </ul>
      </Section>

      <Section id="endpoints" title="Endpoints">
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
          {categories.map((c) => (
            <div key={c.id}>
              <h3 className="text-sm font-medium text-[var(--text)] mb-2">
                {c.title}
              </h3>
              <ul className="border-t border-[var(--border)]">
                {c.groups.map((g) => (
                  <li key={g.id} className="border-b border-[var(--border)]">
                    <Link
                      href={`/docs/${g.id}`}
                      className="flex items-baseline justify-between gap-3 py-2 hover:text-[var(--text)]"
                    >
                      <span className="text-[var(--text)]">{g.title}</span>
                      <span className="text-xs font-mono">
                        {g.endpoints.length}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </article>
  );
}
