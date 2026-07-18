import type { Metadata } from "next";
import { TimestampConverter } from "@/components/tools/timestamp-converter";

export const metadata: Metadata = {
  title: "Unix Timestamp Converter — APIBee Tools",
  description: "Convert Unix timestamps to human-readable dates and back. Live clock. Client-side only.",
};

export default function Page() {
  return <TimestampConverter />;
}
