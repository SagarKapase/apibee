import type { Metadata } from "next";
import { MockDataGenerator } from "@/components/tools/mock-data-generator";

export const metadata: Metadata = {
  title: "Mock Data Generator",
  description: "Generate fake names, emails, addresses, and more. Configurable, bulk-ready. Client-side only.",
};

export default function Page() {
  return <MockDataGenerator />;
}
