import type { Metadata } from "next";
import { UuidGenerator } from "@/components/tools/uuid-generator";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/uuid-generator",
  title: "UUID Generator",
  description: "Generate v4 UUIDs instantly. Bulk generate, copy one-click. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <UuidGenerator />
    </>
  );
}
