import type { Metadata } from "next";
import { HashGenerator } from "@/components/tools/hash-generator";

export const metadata: Metadata = {
  title: "Hash Generator",
  description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes from text. Uses Web Crypto API. Client-side only.",
};

export default function Page() {
  return <HashGenerator />;
}
