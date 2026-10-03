import type { Metadata } from "next";
import { RegexTester } from "@/components/tools/regex-tester";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/regex-tester",
  title: "Regex Tester",
  description: "Test regular expressions with live highlighting and match groups. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <RegexTester />
    </>
  );
}
