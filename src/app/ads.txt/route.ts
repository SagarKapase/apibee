import { ADSENSE_PUBLISHER_ID } from "@/lib/ads";

// Generated once at build time: the site is a static export (next.config.ts output: "export").
export const dynamic = "force-static";

// Lists who may sell ads on this site (https://iabtechlab.com/ads-txt/). f08c47fec0942fa0 is Google's
// certification authority ID, the same for every AdSense publisher.
export function GET() {
  const body = ADSENSE_PUBLISHER_ID
    ? `google.com, ${ADSENSE_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0\n`
    : "# No ad sellers are authorized yet.\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
