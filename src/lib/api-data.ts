// The full API reference. Import this only from server components: it is
// large, and client components should receive just the fields they need.
//
// api-catalog.json is generated from the API reference document:
//   python scripts/generate-api-catalog.py path/to/API-Reference.docx

import catalog from "./api-catalog.json";
import { BASE_URL, type Category, type Group } from "./api-config";

export interface GraphQLOperation {
  kind: "query" | "mutation";
  name: string;
  returns: string;
  arguments: string;
  example: string;
  response: string;
}

export interface GraphQLDoc {
  intro: { code: boolean; text: string }[];
  operations: GraphQLOperation[];
  types: { name: string; fields: string }[];
}

export interface Model {
  name: string;
  fields: { name: string; type: string; required: boolean; description: string }[];
}

export const categories = catalog.categories as unknown as Category[];
export const graphql = catalog.graphql as unknown as GraphQLDoc;
export const models = catalog.models as unknown as Model[];

export const groups: (Group & { category: Category })[] = categories.flatMap(
  (category) => category.groups.map((group) => ({ ...group, category }))
);

export const endpointCount = groups.reduce(
  (n, g) => n + g.endpoints.length,
  0
);

export function findGroup(id: string) {
  const index = groups.findIndex((g) => g.id === id);
  if (index === -1) return null;
  return {
    group: groups[index],
    previous: groups[index - 1] ?? null,
    next: groups[index + 1] ?? null,
  };
}

export const endpoints = groups.flatMap((group) =>
  group.endpoints.map((endpoint) => ({ group, endpoint }))
);

export const endpointHref = (groupId: string, slug: string) => `/docs/${groupId}/${slug}`;

export function findEndpoint(groupId: string, slug: string) {
  const index = endpoints.findIndex(
    (e) => e.group.id === groupId && e.endpoint.slug === slug
  );
  if (index === -1) return null;
  return {
    ...endpoints[index],
    previous: endpoints[index - 1] ?? null,
    next: endpoints[index + 1] ?? null,
  };
}

export const codeExamples: Record<string, string> = {
  JavaScript: `fetch('${BASE_URL}/api/Products?limit=5')
  .then(res => res.json())
  .then(data => console.log(data))`,

  Python: `import requests

res = requests.get('${BASE_URL}/api/Products', params={'limit': 5})
print(res.json())`,

  cURL: `curl "${BASE_URL}/api/Products?limit=5"`,

  Java: `HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${BASE_URL}/api/Products?limit=5"))
    .build();

HttpResponse<String> response =
    client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`,

  PHP: `$response = file_get_contents(
  '${BASE_URL}/api/Products?limit=5'
);
$products = json_decode($response, true);
print_r($products);`,
};

export const sampleResponse = `[
  {
    "id": 1,
    "title": "Wireless Noise-Cancelling Headphones",
    "price": 249.99,
    "description": "Over-ear headphones with 30hr battery life and active noise cancellation.",
    "category": "electronics",
    "image": "https://picsum.photos/seed/prod1/400/400",
    "rating": { "rate": 4.3, "count": 127 },
    "inStock": true,
    "createdAt": "2025-06-12T10:30:00Z"
  },
  ...
]`;
