import type { Metadata } from "next";
import { Base64Codec } from "@/components/tools/base64-codec";

export const metadata: Metadata = {
  title: "Base64 Encoder / Decoder — APIBee Tools",
  description: "Encode text to Base64 or decode Base64 back to text. Handles UTF-8. Client-side only.",
};

export default function Page() {
  return <Base64Codec />;
}
