import type { Metadata } from "next";
import { HashGenerator } from "@/components/tools/hash-generator";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/hash-generator",
  title: "Hash Generator",
  description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes from text. Uses Web Crypto API. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <HashGenerator />
    </>
  );
}
