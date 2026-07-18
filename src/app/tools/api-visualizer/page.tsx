import type { Metadata } from "next";
import { ApiVisualizer } from "@/components/tools/api-visualizer";

export const metadata: Metadata = {
  title: "API Visualizer — APIBee Tools",
  description:
    "Paste a Postman Collection, OpenAPI spec, or custom JSON. See your endpoints visualized as a tree with stats, search, and details.",
};

export default function Page() {
  return <ApiVisualizer />;
}
