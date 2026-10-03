import type { Metadata } from "next";
import { JsonFormatter } from "@/components/tools/json-formatter";
import { JsonLd } from "@/components/json-ld";
import { ToolGuide } from "@/components/tools/tool-guide";
import { guide } from "@/lib/tool-guides/json-formatter";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/json-formatter",
  title: "JSON Formatter & Validator",
  description: "Paste messy JSON, get it formatted and validated, with a clear error when it is invalid. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <JsonFormatter />
      <ToolGuide guide={guide} />
    </>
  );
}
