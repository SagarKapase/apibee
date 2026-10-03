import type { Metadata } from "next";
import { UrlCodec } from "@/components/tools/url-codec";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/url-encoder",
  title: "URL Encoder / Decoder",
  description: "Encode special characters for URLs or decode them back to readable text. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <UrlCodec />
    </>
  );
}
