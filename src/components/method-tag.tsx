import type { Method } from "@/lib/api-config";

const styles: Record<Method, string> = {
  GET: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  POST: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  PUT: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400",
  PATCH: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  HEAD: "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  OPTIONS: "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
};

export function MethodTag({ method }: { method: Method }) {
  return (
    <span
      className={`inline-block px-1.5 py-0.5 rounded text-[11px] leading-4 font-semibold font-mono ${styles[method] ?? styles.HEAD}`}
    >
      {method}
    </span>
  );
}
