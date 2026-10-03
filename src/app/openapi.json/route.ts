import { BASE_URL } from "@/lib/api-config";

// Copies the live OpenAPI document into the static build as /openapi.json.
// The API does not send CORS headers for /openapi/v1.json, so a same-origin
// copy is what lets the docs offer a one-click download.
export const dynamic = "force-static";

export async function GET() {
  const res = await fetch(`${BASE_URL}/openapi/v1.json`);
  if (!res.ok) {
    throw new Error(`Fetching the OpenAPI document failed: ${res.status}`);
  }
  return Response.json(await res.json());
}
