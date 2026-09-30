import { CopyButton } from "./copy-button";
import { Highlighted, type Lang } from "@/lib/syntax";

export function CodeBlock({
  code,
  lang,
  label,
  meta,
}: {
  code: string;
  lang: Lang;
  label: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-[#161616] border-b border-white/[0.06]">
        <span className="flex items-center gap-2 text-xs font-medium text-[#a8a29e]">
          {label}
          {meta}
        </span>
        <CopyButton
          text={code}
          label={label.toLowerCase()}
          hideLabel
          className="text-[#78716c] hover:text-[#e7e5e4]"
        />
      </div>
      <pre className="bg-[var(--code-bg)] px-4 py-3 overflow-auto max-h-96 text-[12px] leading-[1.6]">
        <code className="font-mono">
          <Highlighted code={code} lang={lang} />
        </code>
      </pre>
    </div>
  );
}
