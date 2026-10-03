import type { Metadata } from "next";
import { QrCodeGenerator } from "@/components/tools/qr-code-generator";
import { JsonLd } from "@/components/json-ld";
import { ToolGuide } from "@/components/tools/tool-guide";
import { guide } from "@/lib/tool-guides/qr-code";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

const page = {
  path: "/tools/qr-code",
  title: "QR Code Generator",
  description: "Paste a URL or text, get a QR code. Download as PNG. Client-side only.",
};

export const metadata: Metadata = pageMetadata(page);

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd(page)} />
      <QrCodeGenerator />
      <ToolGuide guide={guide} />
    </>
  );
}
