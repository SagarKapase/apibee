import type { Metadata } from "next";
import { CurlParser } from "@/components/tools/curl-parser";

export const metadata: Metadata = {
  title: "cURL Parser — APIBee Tools",
  description: "Paste a cURL command. See method, URL, headers, and body broken out. Client-side only.",
};

export default function Page() {
  return <CurlParser />;
}
