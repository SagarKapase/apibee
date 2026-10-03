import type { Metadata } from "next";
import { MockDataGenerator } from "@/components/tools/mock-data-generator";
import { JsonLd } from "@/components/json-ld";
import { ToolGuide } from "@/components/tools/tool-guide";
import { guide } from "@/lib/tool-guides/mock-data";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/mock-data",
  title: "Mock Data Generator",
  description: "Generate fake names, emails, addresses, and more. Configurable, bulk-ready. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <MockDataGenerator />
      <ToolGuide guide={guide} />
    </>
  );
}
