import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "JSON, YAML and CSV: what each format is for",
  about: [
    "JSON, YAML and CSV all describe data as text, but they are built for different jobs. JSON is the default format of web APIs: strict, easy for programs to parse and supported by every language. YAML holds the same structures as JSON, objects, lists, strings, numbers and booleans, but uses indentation instead of braces and quotes, which makes it easier for people to read and edit.",
    "CSV is the oldest and simplest of the three. It is a table: a header row of column names followed by one line per record, with values separated by commas. It cannot express nesting, but every spreadsheet program opens it, which is why reports, exports and bulk imports so often use it.",
    "In API work you move between them all the time. Requests and responses are JSON. OpenAPI specs, CI pipelines, Docker Compose and Kubernetes files are usually YAML. Test data often starts life in a spreadsheet as CSV and has to become a JSON array before it can be sent as a request body or used in a data-driven test.",
    "Conversion only works cleanly when the data fits both formats. A list of flat objects maps neatly to CSV rows. Nested objects and arrays have no natural place in a CSV cell, so flatten them before converting to CSV, or keep that data in JSON or YAML.",
  ],
  steps: [
    "Pick the format you have in the From list and the format you want in the To list.",
    "Paste your data into the Input panel, or click Load Example to see a sample in the From format. The output updates as you type.",
    "Click the ⇄ button to swap the two formats. The current output moves into the input, so you can convert back and check the round trip.",
    "Copy the result from the Output panel with the copy button, or click Clear to start again.",
  ],
  faq: [
    {
      q: "Is my data sent to a server?",
      a: "No. Parsing and conversion run in your browser with JavaScript, so nothing you paste leaves your device.",
    },
    {
      q: "Why do I get \"JSON must be an array of objects for CSV conversion\"?",
      a: "A CSV file is a list of rows, so the JSON you convert must be an array such as `[{\"name\": \"Alice\"}, {\"name\": \"Bob\"}]`. A single object or a plain value cannot become a table. Wrap a single object in `[` and `]` to make it a one-row CSV.",
    },
    {
      q: "How are the CSV columns chosen?",
      a: "The column names come from the keys of the first object in the array. Keys that appear only in later objects are not included, so make sure the first object has every field you need. Values that contain commas, quotes or line breaks are wrapped in double quotes.",
    },
    {
      q: "What types does CSV to JSON produce?",
      a: "Every CSV value is text, so the tool guesses: values that look like numbers become numbers, `true` and `false` become booleans and `null` becomes null. Everything else, including empty cells, stays a string. Check the result if you have values such as ZIP codes or IDs with leading zeros that should stay strings.",
    },
    {
      q: "Does it support every YAML feature?",
      a: "No. The tool handles the common subset used for data: mappings, lists, nested indentation, quoted strings, numbers, booleans, null and `#` comments. Anchors and aliases, multi-line block strings and inline `{ }` or `[ ]` collections are not supported, so use a full YAML library for complex configuration files.",
    },
  ],
  related: [
    { href: "/learn/json", label: "Lesson: JSON" },
    { href: "/tools/json-formatter", label: "JSON Formatter & Validator" },
    { href: "/tools/json-xml", label: "JSON and XML Converter" },
    { href: "/docs/formats", label: "API docs: Formats" },
  ],
};
