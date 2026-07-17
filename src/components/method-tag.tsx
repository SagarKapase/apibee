import type { Method } from "@/lib/api-data";

const styles: Record<Method, string> = {
  GET: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  POST: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  PUT: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export function MethodTag({ method }: { method: Method }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono tracking-wide ${styles[method]}`}
    >
      {method}
    </span>
  );
}
