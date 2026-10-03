import type { Metadata } from "next";
import { JsonFormatter } from "@/components/tools/json-formatter";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/json-formatter",
  title: "JSON Formatter & Validator",
  description: "Paste messy JSON, get it formatted and validated. Shows errors with line numbers. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <JsonFormatter />
    </>
  );
}
