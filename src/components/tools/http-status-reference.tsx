"use client";

import { useState, useMemo } from "react";
import { ToolShell } from "@/components/tools/tool-shell";

interface StatusCode {
  code: number;
  text: string;
  description: string;
}

interface StatusGroup {
  label: string;
  color: string;
  badgeColor: string;
  codes: StatusCode[];
}

const groups: StatusGroup[] = [
  {
    label: "1xx Informational",
    color: "text-blue-500",
    badgeColor: "bg-blue-500/10 text-blue-500",
    codes: [
      { code: 100, text: "Continue", description: "Keep going. The server got your headers and is waiting for the body." },
      { code: 101, text: "Switching Protocols", description: "Upgrading to a different protocol (usually WebSocket)." },
      { code: 102, text: "Processing", description: "Got your request, still working on it. Hang tight." },
      { code: 103, text: "Early Hints", description: "Here are some headers while I figure out the actual response." },
    ],
  },
  {
    label: "2xx Success",
    color: "text-emerald-500",
    badgeColor: "bg-emerald-500/10 text-emerald-500",
    codes: [
      { code: 200, text: "OK", description: "Everything worked. Here's what you asked for." },
      { code: 201, text: "Created", description: "Created. The thing you POSTed now exists." },
      { code: 202, text: "Accepted", description: "Got it, will process later. No guarantees on when." },
      { code: 203, text: "Non-Authoritative Info", description: "Here's the data, but it came through a proxy that may have modified it." },
      { code: 204, text: "No Content", description: "Worked, but there's nothing to send back." },
      { code: 205, text: "Reset Content", description: "Done. Now clear your form." },
      { code: 206, text: "Partial Content", description: "Here's part of the file. You asked for a range, you got a range." },
      { code: 207, text: "Multi-Status", description: "Multiple operations, multiple results. Check each one." },
      { code: 208, text: "Already Reported", description: "Already told you about this in a previous part of the response." },
      { code: 226, text: "IM Used", description: "Responding with a delta, not the full thing. Used with delta encoding." },
    ],
  },
  {
    label: "3xx Redirection",
    color: "text-amber-500",
    badgeColor: "bg-amber-500/10 text-amber-500",
    codes: [
      { code: 300, text: "Multiple Choices", description: "Several options. Pick one." },
      { code: 301, text: "Moved Permanently", description: "Moved permanently. Update your bookmarks and links." },
      { code: 302, text: "Found", description: "It's over there temporarily. Keep using this URL though." },
      { code: 303, text: "See Other", description: "Go GET that other URL instead." },
      { code: 304, text: "Not Modified", description: "Nothing changed since you last checked. Use your cache." },
      { code: 305, text: "Use Proxy", description: "Access through a proxy. Deprecated and mostly ignored now." },
      { code: 307, text: "Temporary Redirect", description: "Same as 302, but keep using the same HTTP method." },
      { code: 308, text: "Permanent Redirect", description: "Same as 301, but keep using the same HTTP method." },
    ],
  },
  {
    label: "4xx Client Error",
    color: "text-red-500",
    badgeColor: "bg-red-500/10 text-red-500",
    codes: [
      { code: 400, text: "Bad Request", description: "Something's wrong with your request. Check the body or params." },
      { code: 401, text: "Unauthorized", description: "Not authenticated. Send a valid token." },
      { code: 402, text: "Payment Required", description: "Pay up. Reserved for future use, but some APIs actually use it." },
      { code: 403, text: "Forbidden", description: "Authenticated but not allowed. You don't have permission." },
      { code: 404, text: "Not Found", description: "Nothing here. Check the URL." },
      { code: 405, text: "Method Not Allowed", description: "This endpoint exists but doesn't support that HTTP method." },
      { code: 406, text: "Not Acceptable", description: "Can't respond in the format you asked for in Accept headers." },
      { code: 407, text: "Proxy Auth Required", description: "The proxy wants you to authenticate first." },
      { code: 408, text: "Request Timeout", description: "Took too long. The server gave up waiting." },
      { code: 409, text: "Conflict", description: "Conflicts with the current state. Usually a version or duplicate issue." },
      { code: 410, text: "Gone", description: "It was here, now it's gone. Permanently. Not coming back." },
      { code: 411, text: "Length Required", description: "Send a Content-Length header." },
      { code: 412, text: "Precondition Failed", description: "One of your precondition headers (If-Match, etc.) failed." },
      { code: 413, text: "Payload Too Large", description: "Request body is too big. Send less data." },
      { code: 414, text: "URI Too Long", description: "URL is too long. Move some of that into the body or use POST." },
      { code: 415, text: "Unsupported Media Type", description: "Wrong Content-Type. The server doesn't know what to do with that format." },
      { code: 416, text: "Range Not Satisfiable", description: "The byte range you asked for doesn't exist in this file." },
      { code: 417, text: "Expectation Failed", description: "The server can't meet the Expect header you sent." },
      { code: 418, text: "I'm a Teapot", description: "I'm a teapot. Yes, this is a real status code (RFC 2324)." },
      { code: 421, text: "Misdirected Request", description: "Sent to the wrong server. It can't produce a response for this combo of scheme + authority." },
      { code: 422, text: "Unprocessable Entity", description: "Valid JSON/XML, but the content doesn't make sense. Check your field values." },
      { code: 423, text: "Locked", description: "The resource is locked. Someone else is editing it." },
      { code: 424, text: "Failed Dependency", description: "This request depended on another one, and that one failed." },
      { code: 425, text: "Too Early", description: "Server won't risk processing a request that might be replayed (TLS early data)." },
      { code: 426, text: "Upgrade Required", description: "Switch to a different protocol (like TLS)." },
      { code: 428, text: "Precondition Required", description: "You need to send conditional headers (If-Match, etc.) to prevent conflicts." },
      { code: 429, text: "Too Many Requests", description: "Slow down. Too many requests. Check Retry-After header." },
      { code: 431, text: "Request Header Fields Too Large", description: "Headers are too big. Probably a giant cookie." },
      { code: 451, text: "Unavailable For Legal Reasons", description: "Blocked for legal reasons. Named after Fahrenheit 451." },
    ],
  },
  {
    label: "5xx Server Error",
    color: "text-rose-500",
    badgeColor: "bg-rose-500/10 text-rose-500",
    codes: [
      { code: 500, text: "Internal Server Error", description: "Server broke. Not your fault (probably)." },
      { code: 501, text: "Not Implemented", description: "The server doesn't support this method. Maybe it's not built yet." },
      { code: 502, text: "Bad Gateway", description: "The server behind the server broke." },
      { code: 503, text: "Service Unavailable", description: "Server's taking a break. Try again later." },
      { code: 504, text: "Gateway Timeout", description: "Upstream server didn't respond in time." },
      { code: 505, text: "HTTP Version Not Supported", description: "The server doesn't support the HTTP version you used." },
      { code: 506, text: "Variant Also Negotiates", description: "Server configuration error in content negotiation." },
      { code: 507, text: "Insufficient Storage", description: "Server ran out of space to complete the request." },
      { code: 508, text: "Loop Detected", description: "Infinite loop detected while processing the request." },
      { code: 510, text: "Not Extended", description: "The server needs more extensions on the request to fulfill it." },
      { code: 511, text: "Network Authentication Required", description: "Connect to the network first (captive portal, like airport Wi-Fi)." },
    ],
  },
];

export function HttpStatusReference() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        codes: g.codes.filter(
          (c) =>
            String(c.code).includes(q) ||
            c.text.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.codes.length > 0);
  }, [search]);

  const totalShown = filtered.reduce((n, g) => n + g.codes.length, 0);

  return (
    <ToolShell
      title="HTTP Status Codes"
      description="Every standard HTTP status code. Search by number or description."
    >
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#525252]"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, name, or description..."
            className="w-full bg-[var(--code-bg)] pl-10 pr-4 py-3 text-sm font-mono text-[var(--code-fg)] rounded-xl outline-none border border-[var(--border)] placeholder-[#525252] focus:outline-none focus:ring-0 focus-visible:outline-none"
            spellCheck={false}
          />
          {search && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#525252]">
              {totalShown} result{totalShown !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-6">
        {filtered.map((group) => (
          <div key={group.label}>
            <div className={`text-xs font-bold uppercase tracking-[0.12em] mb-2 ${group.color}`}>
              {group.label}
            </div>
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              {group.codes.map((c, i) => (
                <div
                  key={c.code}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-[var(--accent-soft)] transition-colors duration-150 ${
                    i < group.codes.length - 1 ? "border-b border-[var(--border)]" : ""
                  }`}
                >
                  <span
                    className={`shrink-0 text-sm font-mono font-bold px-2 py-0.5 rounded ${group.badgeColor}`}
                  >
                    {c.code}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-[var(--text)]">
                      {c.text}
                    </span>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-[var(--text-muted)]">
            No status codes match &ldquo;{search}&rdquo;
          </div>
        )}
      </div>
    </ToolShell>
  );
}
