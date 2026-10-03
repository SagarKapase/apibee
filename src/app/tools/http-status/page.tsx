import type { Metadata } from "next";
import { HttpStatusReference } from "@/components/tools/http-status-reference";
import { JsonLd } from "@/components/json-ld";
import { ToolGuide } from "@/components/tools/tool-guide";
import { guide } from "@/lib/tool-guides/http-status";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/http-status",
  title: "HTTP Status Codes",
  description: "Complete reference of HTTP status codes with descriptions and categories. Searchable. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <HttpStatusReference />
      <ToolGuide guide={guide} />
    </>
  );
}
