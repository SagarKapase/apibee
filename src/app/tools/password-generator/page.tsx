import type { Metadata } from "next";
import { PasswordGenerator } from "@/components/tools/password-generator";

export const metadata: Metadata = {
  title: "Password & Secret Generator — APIBee Tools",
  description: "Generate secure passwords, API keys, and random secrets. Configurable length and character sets. Client-side only.",
};

export default function Page() {
  return <PasswordGenerator />;
}
