import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "What is mock data?",
  about: [
    "Mock data is realistic-looking but made-up data that you use in place of real records while building and testing software. Instead of copying customer data from production, which is risky and often illegal under privacy laws, you generate names, emails and addresses that have the right shape but belong to nobody.",
    "Developers reach for it at every stage. Frontend developers need something to render before the backend exists. Testers need many varied records to check lists, search, sorting and pagination. API tests need request bodies for create and update calls, and demos and screenshots look far more convincing with plausible names than with `test1`, `test2` and `test3`.",
    "Good mock data matches the format your system expects: valid-looking email addresses, phone numbers in a consistent pattern and a unique ID on every record. It should also be easy to throw away and regenerate, so each test run can start from a known state.",
  ],
  steps: [
    "Set Count to the number of records you need, from 1 to 100.",
    "Click the field buttons to choose what each record contains: Name, Email, Phone, Job, City, Address, Company and Avatar URL. Highlighted fields are included.",
    "Click Generate. Every record also gets a numeric `id` starting at 1.",
    "Copy the JSON with the copy button, or click Download JSON to save it as `mock-data.json`.",
  ],
  faq: [
    {
      q: "Is the data generated on a server?",
      a: "No. Records are generated in your browser with JavaScript each time you click Generate, so you get a different random set every time.",
    },
    {
      q: "Are the people and phone numbers real?",
      a: "No. Names are random combinations of common first and last names, and phone numbers use the `555` prefix that is reserved for fictional use in North America. The email domains come from a list of company names, some of which are real companies, so never send email to these addresses.",
    },
    {
      q: "Where do the avatar images come from?",
      a: "The Avatar URL field points to `i.pravatar.cc`, a free placeholder avatar service. The image is loaded from that service only when something displays the URL.",
    },
    {
      q: "How do I use the output in an API test?",
      a: "Send each record as the body of a `POST` request to create it, then read it back with `GET` and compare the fields. The testingapis.com API accepts create, update and delete requests on its resource endpoints, so you can try this without building a backend.",
    },
  ],
  related: [
    { href: "/learn/crud-testing", label: "Lesson: CRUD testing" },
    { href: "/docs/people", label: "API docs: People" },
    { href: "/tools/uuid-generator", label: "UUID Generator" },
    { href: "/tools/json-yaml-csv", label: "JSON, YAML and CSV Converter" },
  ],
};
