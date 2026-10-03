import type { Metadata } from "next";
import { TimestampConverter } from "@/components/tools/timestamp-converter";
import { JsonLd } from "@/components/json-ld";
import { ToolGuide } from "@/components/tools/tool-guide";
import { guide } from "@/lib/tool-guides/timestamp";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/timestamp",
  title: "Unix Timestamp Converter",
  description: "Convert Unix timestamps to human-readable dates and back. Live clock. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <TimestampConverter />
      <ToolGuide guide={guide} />
    </>
  );
}
