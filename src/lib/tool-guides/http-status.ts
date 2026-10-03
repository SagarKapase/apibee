import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "What are HTTP status codes?",
  about: [
    "Every HTTP response starts with a three-digit status code that says what happened to the request. The first digit gives the class: 1xx is informational, 2xx means success, 3xx means redirection, 4xx means the client made a mistake and 5xx means the server failed.",
    "The code is the first thing an API test should check, because the rest of the response depends on it. A 201 Created tells you a POST made a new resource. A 404 Not Found means the resource does not exist. A 500 Internal Server Error means the server failed and the body may be an error page rather than the JSON you expected.",
    "Some pairs are easy to confuse. 401 Unauthorized means the request has no valid credentials, while 403 Forbidden means the credentials are valid but not allowed to do this. 400 Bad Request is a request the server cannot parse, while 422 Unprocessable Entity is well formed but fails validation. 301 and 308 are permanent redirects, 302 and 307 temporary ones, and 307 and 308 keep the original method and body.",
    "Good APIs use specific codes so clients can react without reading the body. A 429 Too Many Requests tells a client to slow down and usually comes with a `Retry-After` header. A 503 Service Unavailable suggests trying again later, while a 4xx error will fail the same way every time until the request changes.",
  ],
  steps: [
    "Scroll the list, grouped from 1xx Informational to 5xx Server Error, to see each code with its name and a short description.",
    "Type in the search box to filter by code number, name or description, for example `404`, `redirect` or `timeout`.",
    "Check the result count on the right of the search box to see how many codes match.",
  ],
  faq: [
    {
      q: "What is the difference between 401 and 403?",
      a: "401 Unauthorized means the server does not know who you are: credentials are missing, expired or wrong. 403 Forbidden means it knows who you are, but that identity is not allowed to do this. Logging in again can fix a 401, not a 403.",
    },
    {
      q: "Should an API return 400 or 422 for invalid input?",
      a: "Both are used. A common convention is 400 for a request the server cannot read at all, such as malformed JSON, and 422 for well-formed data that breaks a rule, such as a missing required field or an invalid email.",
    },
    {
      q: "What is the difference between 502, 503 and 504?",
      a: "All three usually come from a proxy or load balancer in front of the application. 502 Bad Gateway means it got an invalid response from the server behind it, 503 Service Unavailable means the service is overloaded or down for maintenance, and 504 Gateway Timeout means the server behind it did not answer in time.",
    },
    {
      q: "Is 418 I'm a teapot a real status code?",
      a: "It comes from RFC 2324, an April Fools' joke from 1998 about controlling coffee pots, and is not meant for real errors. It stayed reserved because enough software recognises it, and some APIs return it as an easter egg.",
    },
    {
      q: "How can I test how my app handles a specific status code?",
      a: "Call an endpoint that returns the code you ask for. For example, `GET /api/status/503` on testingapis.com responds with a 503 and the headers that status normally carries, so you can check how your client handles errors, redirects and empty responses.",
    },
  ],
  related: [
    { href: "/learn/http-responses", label: "Lesson: Reading a response" },
    { href: "/learn/validation-errors", label: "Lesson: Testing validation and errors" },
    { href: "/docs/status", label: "API docs: Status endpoints" },
    { href: "/docs/redirect", label: "API docs: Redirect endpoints" },
  ],
};
