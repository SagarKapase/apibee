import type { Metadata } from "next";
import { JwtDecoder } from "@/components/tools/jwt-decoder";
import { JsonLd } from "@/components/json-ld";
import { ToolGuide } from "@/components/tools/tool-guide";
import { guide } from "@/lib/tool-guides/jwt-decoder";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/jwt-decoder",
  title: "JWT Decoder",
  description: "Decode JWT tokens. See header, payload, signature, and expiry status. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <JwtDecoder />
      <ToolGuide guide={guide} />
    </>
  );
}
