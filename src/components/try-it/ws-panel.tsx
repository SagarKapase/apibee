"use client";

import { useEffect, useRef, useState } from "react";
import { WS_BASE_URL } from "@/lib/api-config";

interface LogEntry {
  id: number;
  dir: "in" | "out" | "info";
  text: string;
  at: string;
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-[13px] font-mono text-[var(--text)] focus:outline-none focus:border-[var(--text-muted)]";

export function WebSocketPanel({ path }: { path: string }) {
  const [url, setUrl] = useState(WS_BASE_URL + path);
  const [message, setMessage] = useState("hello");
  const [status, setStatus] = useState<"closed" | "connecting" | "open">("closed");
  const [log, setLog] = useState<LogEntry[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const idRef = useRef(0);

  function add(dir: LogEntry["dir"], text: string) {
    const at = new Date().toLocaleTimeString();
    setLog((l) => [...l, { id: idRef.current++, dir, text, at }].slice(-200));
  }

  function connect() {
    socketRef.current?.close();
    setStatus("connecting");
    add("info", `Connecting to ${url}`);
    const ws = new WebSocket(url);
    socketRef.current = ws;
    ws.onopen = () => {
      setStatus("open");
      add("info", "Connected");
    };
    ws.onmessage = (e) => add("in", typeof e.data === "string" ? e.data : "[binary message]");
    ws.onerror = () => add("info", "Connection error");
    ws.onclose = (e) => {
      setStatus("closed");
      add("info", `Closed (${e.code}${e.reason ? ` ${e.reason}` : ""})`);
    };
  }

  function send() {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(message);
    add("out", message);
  }

  useEffect(() => () => socketRef.current?.close(), []);

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="block text-xs text-[var(--text-muted)] mb-1">URL</span>
        <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} />
      </label>
      <div className="flex gap-2">
        {status === "closed" ? (
          <button
            type="button"
            onClick={connect}
            className="flex-1 h-9 rounded-md bg-[var(--btn-bg)] text-[var(--btn-fg)] text-sm font-medium hover:bg-[var(--btn-hover)] cursor-pointer"
          >
            Connect
          </button>
        ) : (
          <button
            type="button"
            onClick={() => socketRef.current?.close()}
            className="flex-1 h-9 rounded-md border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-[var(--accent-soft)] cursor-pointer"
          >
            {status === "connecting" ? "Connecting…" : "Disconnect"}
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message"
          className={inputClass}
        />
        <button
          type="button"
          onClick={send}
          disabled={status !== "open"}
          className="px-3 rounded-md border border-[var(--border)] text-sm text-[var(--text)] enabled:hover:bg-[var(--accent-soft)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--code-bg)] max-h-72 overflow-auto px-3 py-2 font-mono text-[12px] leading-[1.6]">
        {log.length === 0 ? (
          <p className="text-[#8d9299]">Messages appear here.</p>
        ) : (
          log.map((e) => (
            <p key={e.id} className="break-all">
              <span className="text-[#8d9299]">{e.at} </span>
              <span
                className={
                  e.dir === "in" ? "text-emerald-400" : e.dir === "out" ? "text-sky-400" : "text-[#969ba3]"
                }
              >
                {e.dir === "in" ? "← " : e.dir === "out" ? "→ " : "· "}
                {e.text}
              </span>
            </p>
          ))
        )}
      </div>
    </div>
  );
}
