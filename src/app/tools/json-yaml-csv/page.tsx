import type { Metadata } from "next";
import { JsonYamlCsvConverter } from "@/components/tools/json-yaml-csv-converter";
import { JsonLd } from "@/components/json-ld";
import { ToolGuide } from "@/components/tools/tool-guide";
import { guide } from "@/lib/tool-guides/json-yaml-csv";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/json-yaml-csv",
  title: "JSON, YAML and CSV Converter",
  description: "Convert between JSON, YAML, and CSV formats. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <JsonYamlCsvConverter />
      <ToolGuide guide={guide} />
    </>
  );
}
