import type { Metadata } from "next";
import { UrlCodec } from "@/components/tools/url-codec";

export const metadata: Metadata = {
  title: "URL Encoder / Decoder — APIBee Tools",
  description: "Encode special characters for URLs or decode them back to readable text. Client-side only.",
};

export default function Page() {
  return <UrlCodec />;
}
