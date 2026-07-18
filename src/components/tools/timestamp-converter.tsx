"use client";

import { useState, useEffect, useCallback } from "react";
import { ToolShell, ToolPanel } from "@/components/tools/tool-shell";
import { CopyButton } from "@/components/copy-button";

function relativeTime(epoch: number): string {
  const diff = epoch * 1000 - Date.now();
  const abs = Math.abs(diff);
  const past = diff < 0;
  let value: number;
  let unit: string;
  if (abs < 60_000) {
    value = Math.floor(abs / 1000);
    unit = "second";
  } else if (abs < 3_600_000) {
    value = Math.floor(abs / 60_000);
    unit = "minute";
  } else if (abs < 86_400_000) {
    value = Math.floor(abs / 3_600_000);
    unit = "hour";
  } else if (abs < 2_592_000_000) {
    value = Math.floor(abs / 86_400_000);
    unit = "day";
  } else if (abs < 31_536_000_000) {
    value = Math.floor(abs / 2_592_000_000);
    unit = "month";
  } else {
    value = Math.floor(abs / 31_536_000_000);
    unit = "year";
  }
  const plural = value !== 1 ? "s" : "";
  return past ? `${value} ${unit}${plural} ago` : `in ${value} ${unit}${plural}`;
}

function fmtLocal(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function TimestampConverter() {
  // Live clock
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Timestamp → Date
  const [tsInput, setTsInput] = useState("");
  const [isMs, setIsMs] = useState(false);

  // Date → Timestamp
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [second, setSecond] = useState("");
  const [useUtc, setUseUtc] = useState(false);

  // Compute Timestamp → Date
  const tsNum = tsInput.trim() ? Number(tsInput.trim()) : null;
  const tsValid = tsNum !== null && !isNaN(tsNum) && isFinite(tsNum);
  const tsEpochSec = tsValid ? (isMs ? tsNum! / 1000 : tsNum!) : null;
  const tsDate = tsEpochSec !== null ? new Date(tsEpochSec * 1000) : null;
  const tsDateValid = tsDate !== null && !isNaN(tsDate.getTime());

  // Compute Date → Timestamp
  const dateFieldsFilled = year.trim() && month.trim() && day.trim();
  let dateResult: { seconds: number; millis: number } | null = null;
  if (dateFieldsFilled) {
    const y = Number(year);
    const mo = Number(month) - 1;
    const d = Number(day);
    const h = Number(hour) || 0;
    const mi = Number(minute) || 0;
    const s = Number(second) || 0;
    const date = useUtc ? new Date(Date.UTC(y, mo, d, h, mi, s)) : new Date(y, mo, d, h, mi, s);
    if (!isNaN(date.getTime())) {
      dateResult = {
        seconds: Math.floor(date.getTime() / 1000),
        millis: date.getTime(),
      };
    }
  }

  const fillNowTs = useCallback(() => {
    setTsInput(String(Math.floor(Date.now() / 1000)));
    setIsMs(false);
  }, []);

  const fillNowDate = useCallback(() => {
    const n = new Date();
    if (useUtc) {
      setYear(String(n.getUTCFullYear()));
      setMonth(String(n.getUTCMonth() + 1));
      setDay(String(n.getUTCDate()));
      setHour(String(n.getUTCHours()));
      setMinute(String(n.getUTCMinutes()));
      setSecond(String(n.getUTCSeconds()));
    } else {
      setYear(String(n.getFullYear()));
      setMonth(String(n.getMonth() + 1));
      setDay(String(n.getDate()));
      setHour(String(n.getHours()));
      setMinute(String(n.getMinutes()));
      setSecond(String(n.getSeconds()));
    }
  }, [useUtc]);

  const numInput =
    "w-full bg-[var(--code-bg)] px-3 py-2 text-sm font-mono text-[var(--code-fg)] rounded-lg outline-none focus:outline-none focus:ring-0 focus-visible:outline-none border border-[var(--border)] placeholder-[#525252]";

  const smallNumInput =
    "w-full bg-[var(--code-bg)] px-2 py-1.5 text-xs font-mono text-[var(--code-fg)] rounded-md outline-none focus:outline-none focus:ring-0 focus-visible:outline-none border border-[var(--border)] placeholder-[#525252] text-center";

  return (
    <ToolShell
      title="Unix Timestamp Converter"
      description="Convert between Unix timestamps and human-readable dates. Live clock shows current time."
    >
      {/* Live Clock */}
      <ToolPanel label="Current Time" dark>
        <div className="px-4 py-5 bg-[var(--code-bg)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-2xl font-mono font-bold text-[var(--code-fg)] tabular-nums">
              {now}
            </div>
            <div className="text-sm text-[#a8a29e] mt-1">
              {fmtLocal(new Date(now * 1000))}
            </div>
          </div>
          <CopyButton
            text={String(now)}
            label="Copy"
            className="text-xs text-[#525252] hover:text-[var(--accent)] border border-white/10 rounded-md px-3 py-1.5 transition-colors"
          />
        </div>
      </ToolPanel>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        {/* Timestamp → Date */}
        <ToolPanel
          label="Timestamp → Date"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMs(!isMs)}
                className={`text-[10px] font-medium px-2 py-0.5 rounded cursor-pointer transition-colors duration-150 ${
                  isMs
                    ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                ms
              </button>
              <button
                onClick={fillNowTs}
                className="text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
              >
                Now
              </button>
            </div>
          }
        >
          <div className="p-4 space-y-4">
            <input
              type="text"
              inputMode="numeric"
              value={tsInput}
              onChange={(e) => setTsInput(e.target.value)}
              placeholder={isMs ? "1721234567000" : "1721234567"}
              className={numInput}
            />

            {tsInput.trim() && !tsValid && (
              <p className="text-xs text-red-400">Not a valid number.</p>
            )}

            {tsDateValid && tsDate && tsEpochSec !== null && (
              <div className="space-y-2">
                <DateRow label="ISO 8601" value={tsDate.toISOString()} />
                <DateRow label="UTC" value={tsDate.toUTCString()} />
                <DateRow label="Local" value={fmtLocal(tsDate)} />
                <DateRow
                  label="Relative"
                  value={relativeTime(tsEpochSec)}
                />
              </div>
            )}
          </div>
        </ToolPanel>

        {/* Date → Timestamp */}
        <ToolPanel
          label="Date → Timestamp"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUseUtc(!useUtc)}
                className={`text-[10px] font-medium px-2 py-0.5 rounded cursor-pointer transition-colors duration-150 ${
                  useUtc
                    ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                UTC
              </button>
              <button
                onClick={fillNowDate}
                className="text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
              >
                Now
              </button>
            </div>
          }
        >
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1 block">
                  Year
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2025"
                  className={smallNumInput}
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1 block">
                  Month
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="7"
                  className={smallNumInput}
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1 block">
                  Day
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="18"
                  className={smallNumInput}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1 block">
                  Hour
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  placeholder="0"
                  className={smallNumInput}
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1 block">
                  Minute
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder="0"
                  className={smallNumInput}
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1 block">
                  Second
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={second}
                  onChange={(e) => setSecond(e.target.value)}
                  placeholder="0"
                  className={smallNumInput}
                />
              </div>
            </div>

            {dateResult && (
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <DateRow label="Seconds" value={String(dateResult.seconds)} />
                <DateRow label="Milliseconds" value={String(dateResult.millis)} />
                <DateRow label="Relative" value={relativeTime(dateResult.seconds)} />
              </div>
            )}
          </div>
        </ToolPanel>
      </div>
    </ToolShell>
  );
}

function DateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-[var(--border)] last:border-b-0">
      <div className="min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] mr-2">
          {label}
        </span>
        <span className="text-xs font-mono text-[var(--text)] break-all">
          {value}
        </span>
      </div>
      <CopyButton
        text={value}
        className="shrink-0 text-[var(--text-muted)] hover:text-[var(--accent)]"
      />
    </div>
  );
}
