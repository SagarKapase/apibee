import type { Metadata } from "next";
import { Base64Codec } from "@/components/tools/base64-codec";
import { JsonLd } from "@/components/json-ld";
import { ToolGuide } from "@/components/tools/tool-guide";
import { guide } from "@/lib/tool-guides/base64";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/base64",
  title: "Base64 Encoder / Decoder",
  description: "Encode text to Base64 or decode Base64 back to text. Handles UTF-8. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <Base64Codec />
      <ToolGuide guide={guide} />
    </>
  );
}
