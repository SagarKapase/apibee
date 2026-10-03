import { Highlighted, type Lang } from "@/lib/syntax";

/**
 * Highlighted code with line numbers. The numbers stay put while the code
 * scrolls sideways; the caller sets the height through className.
 */
export function CodeViewer({
  code,
  lang,
  className = "",
}: {
  code: string;
  lang: Lang;
  className?: string;
}) {
  const lines = code.split("\n").length;
  return (
    <div className={`overflow-auto bg-[var(--code-bg)] text-[12px] leading-[1.6] ${className}`}>
      <div className="flex min-w-max py-3">
        {/* A div, not a pre: the global pre color would override the dim number color. */}
        <div
          aria-hidden="true"
          className="sticky left-0 select-none whitespace-pre bg-[var(--code-bg)] pl-3 pr-4 text-right font-mono text-[#4b5157]"
        >
          {Array.from({ length: lines }, (_, i) => i + 1).join("\n")}
        </div>
        <pre className="pr-5">
          <code className="font-mono text-[var(--code-fg)]">
            <Highlighted code={code} lang={lang} />
          </code>
        </pre>
      </div>
    </div>
  );
}
