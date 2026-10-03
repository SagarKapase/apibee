import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "What is a cURL command?",
  about: [
    "cURL is a command-line program for sending HTTP requests, and a cURL command is the most common way developers share a request. One line holds everything the server receives: the method after `-X`, the URL, each header after `-H` and the body after `-d`.",
    "You meet cURL commands everywhere in API work. API documentation shows examples as cURL, browser developer tools offer \"Copy as cURL\" on any network request, and bug reports often include one so the problem can be repeated exactly.",
    "Long commands are hard to read. Headers, quoted JSON and line continuations run together, and a missing quote or a wrong header is easy to miss. Splitting the command into its parts shows what will actually be sent, which helps when you rebuild the request in Postman, in a test or in code.",
    "Two cURL rules catch people out. A command without `-X` is a GET, but cURL switches to POST as soon as you add a body with `-d`. And cURL does not add `Content-Type: application/json` for you, so a JSON body sent without that header usually reaches the server as form data.",
  ],
  steps: [
    "Paste a cURL command into the cURL Command box. Commands split over several lines with a trailing `\\` work too.",
    "Read the parts underneath: Method, URL, Query Parameters, Headers and Body. A JSON body is pretty-printed.",
    "Check Other Flags for options the parser lists but does not interpret, such as `--compressed` or `-k`.",
    "Copy the URL or the body with the copy buttons, or use Load Example to see a POST request with headers and a JSON body.",
  ],
  faq: [
    {
      q: "Is my command sent anywhere?",
      a: "No. The command is parsed in your browser and no request is made. That matters because copied commands often contain real tokens or cookies.",
    },
    {
      q: "Which cURL options does the parser understand?",
      a: "It reads the method from `-X` or `--request`, headers from `-H` or `--header`, and the body from `-d`, `--data`, `--data-raw` or `--data-binary`. Any other option is listed by name under Other Flags. If such an option takes a value, such as `-u user:pass`, put the URL before it so the value is not mistaken for the URL.",
    },
    {
      q: "Why does it show POST when my command has no -X?",
      a: "cURL sends a POST whenever a command has a body and no explicit method, and the parser follows the same rule. Add `-X GET` or another method to override it.",
    },
    {
      q: "Why do I get \"Could not find a URL in this command\"?",
      a: "The parser found no part of the command that looks like a URL. Check that the URL is present and not swallowed by an unclosed quote earlier in the command.",
    },
    {
      q: "How do I get a cURL command from my browser?",
      a: "Open the developer tools, go to the Network tab, right-click a request and choose Copy, then Copy as cURL. Browsers add many headers, so expect a long list under Headers.",
    },
  ],
  related: [
    { href: "/learn/http-requests", label: "Lesson: Anatomy of a request" },
    { href: "/learn/first-requests", label: "Lesson: Sending requests with curl and Postman" },
    { href: "/docs/echo", label: "API docs: Echo endpoints" },
    { href: "/tools/url-encoder", label: "URL Encoder / Decoder" },
  ],
};
