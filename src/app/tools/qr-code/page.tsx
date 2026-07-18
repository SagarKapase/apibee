import type { Metadata } from "next";
import { QrCodeGenerator } from "@/components/tools/qr-code-generator";

export const metadata: Metadata = {
  title: "QR Code Generator — APIBee Tools",
  description: "Paste a URL or text, get a QR code. Download as PNG. Client-side only.",
};

export default function Page() {
  return <QrCodeGenerator />;
}
