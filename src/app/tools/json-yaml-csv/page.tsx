import type { Metadata } from "next";
import { JsonYamlCsvConverter } from "@/components/tools/json-yaml-csv-converter";

export const metadata: Metadata = {
  title: "JSON ↔ YAML / CSV Converter — APIBee Tools",
  description: "Convert between JSON, YAML, and CSV formats. Client-side only.",
};

export default function Page() {
  return <JsonYamlCsvConverter />;
}
