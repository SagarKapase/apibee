import type { Metadata } from "next";
import { JsonFormatter } from "@/components/tools/json-formatter";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator",
  description: "Paste messy JSON, get it formatted and validated. Shows errors with line numbers. Client-side only.",
};

export default function Page() {
  return <JsonFormatter />;
}
