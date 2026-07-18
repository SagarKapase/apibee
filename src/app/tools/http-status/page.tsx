import type { Metadata } from "next";
import { HttpStatusReference } from "@/components/tools/http-status-reference";

export const metadata: Metadata = {
  title: "HTTP Status Codes — APIBee Tools",
  description: "Complete reference of HTTP status codes with descriptions and categories. Searchable. Client-side only.",
};

export default function Page() {
  return <HttpStatusReference />;
}
