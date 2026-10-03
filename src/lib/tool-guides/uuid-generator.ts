import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "What is a UUID?",
  about: [
    "A UUID (universally unique identifier), also called a GUID, is a 128-bit value written as 32 hexadecimal digits in five groups, like `3f2b8c1e-9a4d-4e7b-b5c2-6d1f0a8e9c47`. It is designed so that anyone can create one without asking a central server and still be practically certain no one else will ever create the same value.",
    "There are several versions. Version 4, which this tool generates, is almost entirely random: 122 of its 128 bits come from a random number generator. You can recognise it by the `4` at the start of the third group. Version 7 starts with a timestamp, so its values sort by creation time, and version 1 is based on time and the machine's network address.",
    "APIs use UUIDs as resource IDs, as in `/orders/3f2b8c1e-...`, because they do not reveal how many records exist and cannot be guessed by counting. Clients generate them as idempotency keys and request or correlation IDs, so a retried request can be recognised and a request can be traced across services.",
    "In tests, UUIDs are handy for creating unique names, emails and keys so test runs do not collide with each other or with old data. They are also useful for checking how an API handles a well-formed ID that does not exist, which should return a 404 rather than a 500.",
  ],
  steps: [
    "A random v4 UUID is shown when the page loads. Click Generate for a new one, and use the copy button next to it to copy it.",
    "Use the Format options: Uppercase changes the letters to capitals, and No dashes removes the hyphens to give 32 characters.",
    "To create many at once, enter a number from 1 to 100 next to Bulk Generate and click the Generate button beside it. New UUIDs are added to the top of the list.",
    "Copy a single UUID from the list with its copy button, or copy them all, one per line, with Copy All. Clear empties the list.",
  ],
  faq: [
    {
      q: "Can two UUIDs ever be the same?",
      a: "In theory yes, in practice no. A v4 UUID has 122 random bits, so you would need to generate billions of them per second for decades before a duplicate became likely.",
    },
    {
      q: "Are these UUIDs random enough for security?",
      a: "They come from `crypto.randomUUID()`, which uses your browser's cryptographically secure random generator. Even so, a UUID is an identifier, not a secret: do not use one as a password or access token. Use the Password & Secret Generator for those.",
    },
    {
      q: "What is the difference between a UUID and a GUID?",
      a: "Nothing practical. GUID is the name Microsoft uses for the same 128-bit format. GUIDs are often written in uppercase or inside braces, which the Uppercase option helps with.",
    },
    {
      q: "Should I use UUIDs as database primary keys?",
      a: "They work well in distributed systems and APIs, but random v4 values are inserted in random order, which can slow down large indexes. Many teams use time-ordered v7 UUIDs for primary keys for that reason.",
    },
    {
      q: "Are the UUIDs generated on a server?",
      a: "No. They are generated in your browser and never sent anywhere, so no one else sees them.",
    },
  ],
  related: [
    { href: "/tools/password-generator", label: "Password & Secret Generator" },
    { href: "/tools/mock-data", label: "Mock Data Generator" },
    { href: "/learn/crud-testing", label: "Lesson: Testing a resource end to end" },
    { href: "/learn/reliability", label: "Lesson: Timeouts, retries and rate limits" },
  ],
};
