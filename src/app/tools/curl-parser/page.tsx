import type { Metadata } from "next";
import { CurlParser } from "@/components/tools/curl-parser";
import { JsonLd } from "@/components/json-ld";
import { ToolGuide } from "@/components/tools/tool-guide";
import { guide } from "@/lib/tool-guides/curl-parser";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/curl-parser",
  title: "cURL Parser",
  description: "Paste a cURL command. See method, URL, headers, and body broken out. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <CurlParser />
      <ToolGuide guide={guide} />
    </>
  );
}
