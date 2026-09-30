import type { Metadata } from "next";
import { RegexTester } from "@/components/tools/regex-tester";

export const metadata: Metadata = {
  title: "Regex Tester",
  description: "Test regular expressions with live highlighting and match groups. Client-side only.",
};

export default function Page() {
  return <RegexTester />;
}
