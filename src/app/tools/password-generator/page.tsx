import type { Metadata } from "next";
import { PasswordGenerator } from "@/components/tools/password-generator";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/password-generator",
  title: "Password & Secret Generator",
  description: "Generate secure passwords, API keys, and random secrets. Configurable length and character sets. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <PasswordGenerator />
    </>
  );
}
