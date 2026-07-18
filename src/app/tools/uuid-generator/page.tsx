import type { Metadata } from "next";
import { UuidGenerator } from "@/components/tools/uuid-generator";

export const metadata: Metadata = {
  title: "UUID Generator — APIBee Tools",
  description: "Generate v4 UUIDs instantly. Bulk generate, copy one-click. Client-side only.",
};

export default function Page() {
  return <UuidGenerator />;
}
