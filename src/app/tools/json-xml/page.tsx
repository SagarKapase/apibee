import type { Metadata } from "next";
import { JsonXmlConverter } from "@/components/tools/json-xml-converter";
import { JsonLd } from "@/components/json-ld";
import { ToolGuide } from "@/components/tools/tool-guide";
import { guide } from "@/lib/tool-guides/json-xml";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/json-xml",
  title: "JSON and XML Converter",
  description: "Convert between JSON and XML formats. Handles nested objects and arrays. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <JsonXmlConverter />
      <ToolGuide guide={guide} />
    </>
  );
}
