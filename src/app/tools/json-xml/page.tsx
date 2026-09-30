import type { Metadata } from "next";
import { JsonXmlConverter } from "@/components/tools/json-xml-converter";

export const metadata: Metadata = {
  title: "JSON and XML Converter",
  description: "Convert between JSON and XML formats. Handles nested objects and arrays. Client-side only.",
};

export default function Page() {
  return <JsonXmlConverter />;
}
