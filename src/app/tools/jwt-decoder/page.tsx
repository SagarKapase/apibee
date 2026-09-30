import type { Metadata } from "next";
import { JwtDecoder } from "@/components/tools/jwt-decoder";

export const metadata: Metadata = {
  title: "JWT Decoder",
  description: "Decode JWT tokens. See header, payload, signature, and expiry status. Client-side only.",
};

export default function Page() {
  return <JwtDecoder />;
}
