import type { Metadata } from "next";
import { TextDiffChecker } from "@/components/tools/text-diff-checker";

export const metadata: Metadata = {
  title: "Text Diff Checker — APIBee Tools",
  description: "Paste two texts and see the differences highlighted. Line-by-line comparison. Client-side only.",
};

export default function Page() {
  return <TextDiffChecker />;
}
