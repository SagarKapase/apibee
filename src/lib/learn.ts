// Lesson order and titles for the API testing tutorial. The lesson bodies
// live in src/app/learn/_lessons. This file stays small so the sidebar (a
// client component) can import it.

export type Level = "Beginner" | "Intermediate" | "Advanced";

export interface Lesson {
  slug: string;
  title: string;
  summary: string;
  level: Level;
}

export const levels: { level: Level; description: string }[] = [
  {
    level: "Beginner",
    description: "What an API is, how HTTP works, and how to send a request and read what comes back.",
  },
  {
    level: "Intermediate",
    description: "Testing real endpoints properly: CRUD, validation, auth, headers, and tests written as code.",
  },
  {
    level: "Advanced",
    description: "The failures that only show up in production: timeouts, async work, security holes and load.",
  },
];

export const lessons: Lesson[] = [
  {
    slug: "what-is-an-api",
    title: "What an API is",
    summary: "Clients, servers, and the request you already sent without noticing.",
    level: "Beginner",
  },
  {
    slug: "http-requests",
    title: "Anatomy of a request",
    summary: "Method, URL, headers and body, and what the server actually receives.",
    level: "Beginner",
  },
  {
    slug: "http-responses",
    title: "Reading a response",
    summary: "Status codes, response headers and the body.",
    level: "Beginner",
  },
  {
    slug: "http-methods",
    title: "HTTP methods",
    summary: "GET, POST, PUT, PATCH and DELETE, and which of them are safe to repeat.",
    level: "Beginner",
  },
  {
    slug: "json",
    title: "Reading JSON",
    summary: "The six JSON types and the values that trip up tests.",
    level: "Beginner",
  },
  {
    slug: "first-requests",
    title: "Sending requests with curl and Postman",
    summary: "The two tools you will use every day, and when to pick which.",
    level: "Beginner",
  },
  {
    slug: "test-cases",
    title: "Writing your first test cases",
    summary: "Expected results, negative tests, boundary values and equivalence classes.",
    level: "Beginner",
  },
  {
    slug: "crud-testing",
    title: "Testing a resource end to end",
    summary: "Create, read, update and delete, and checking that each one really happened.",
    level: "Intermediate",
  },
  {
    slug: "validation-errors",
    title: "Testing validation and errors",
    summary: "Bad input, missing fields, wrong types, and what a good error looks like.",
    level: "Intermediate",
  },
  {
    slug: "query-parameters",
    title: "Filtering, sorting and pagination",
    summary: "The list endpoint bugs that nobody notices until page 3.",
    level: "Intermediate",
  },
  {
    slug: "authentication",
    title: "Authentication and authorization",
    summary: "Basic auth, API keys, bearer tokens and JWTs, and the difference between 401 and 403.",
    level: "Intermediate",
  },
  {
    slug: "headers-caching-cookies",
    title: "Headers, caching and cookies",
    summary: "Content negotiation, ETags, 304 responses and session cookies.",
    level: "Intermediate",
  },
  {
    slug: "automation",
    title: "Automating tests with code",
    summary: "Turning manual checks into tests with JavaScript or Python.",
    level: "Intermediate",
  },
  {
    slug: "schemas-contracts",
    title: "Schemas and contract testing",
    summary: "Checking the shape of a response, and using an OpenAPI document as the source of truth.",
    level: "Intermediate",
  },
  {
    slug: "reliability",
    title: "Timeouts, retries and rate limits",
    summary: "Flaky servers, idempotency keys, 429 responses and how clients should behave.",
    level: "Advanced",
  },
  {
    slug: "async-apis",
    title: "Async jobs, webhooks and streams",
    summary: "Testing work that finishes later, requests the server sends to you, and open connections.",
    level: "Advanced",
  },
  {
    slug: "security-testing",
    title: "Security testing basics",
    summary: "Broken object access, auth bypasses, mass assignment and injection.",
    level: "Advanced",
  },
  {
    slug: "performance",
    title: "Performance testing",
    summary: "Measuring latency, reading percentiles and running a small load test.",
    level: "Advanced",
  },
  {
    slug: "ci-strategy",
    title: "Running tests in CI",
    summary: "Test data, flaky tests, pipelines and deciding what to test at all.",
    level: "Advanced",
  },
];

export function findLesson(slug: string) {
  const index = lessons.findIndex((l) => l.slug === slug);
  if (index === -1) return null;
  return {
    lesson: lessons[index],
    number: index + 1,
    previous: lessons[index - 1] ?? null,
    next: lessons[index + 1] ?? null,
  };
}
