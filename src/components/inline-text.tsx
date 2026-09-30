import { withHost } from "@/lib/api-config";

/** Renders reference text, turning `code` and ``code`` spans into <code>. */
export function InlineText({ text }: { text: string }) {
  const parts = withHost(text).split(/``(.+?)``|`([^`]+)`/g);
  // split() with capture groups yields [text, code1, code2, text, ...].
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) nodes.push(parts[i]);
    const code = parts[i + 1] ?? parts[i + 2];
    if (code) {
      nodes.push(
        <code key={i} className="font-mono text-[0.9em] text-[var(--text)] break-words">
          {code}
        </code>
      );
    }
  }
  return <>{nodes}</>;
}
