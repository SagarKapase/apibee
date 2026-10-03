import type { Metadata } from "next";
import { TextDiffChecker } from "@/components/tools/text-diff-checker";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/text-diff",
  title: "Text Diff Checker",
  description: "Paste two texts and see the differences highlighted. Line-by-line comparison. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <TextDiffChecker />
    </>
  );
}
