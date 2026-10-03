import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "What is JSON formatting?",
  about: [
    "JSON (JavaScript Object Notation) is the format most web APIs use for request and response bodies. It is built from objects in curly braces, arrays in square brackets, and strings, numbers, `true`, `false` and `null`.",
    "APIs usually send JSON minified, with every space and line break removed to save bytes. That is efficient for machines but almost unreadable for people. Formatting, also called pretty-printing or beautifying, adds indentation and line breaks so you can see the structure: which keys belong to which object and how deeply the data is nested.",
    "Formatting also validates. To format JSON the tool has to parse it, and parsing fails on anything that is not valid JSON. The usual mistakes are a trailing comma after the last item, keys or strings in single quotes instead of double quotes, keys without quotes, comments, and values such as `undefined` or `NaN` that JSON does not allow.",
    "In API testing you format JSON to read a response before writing assertions against it, to check a request body before sending it, and to find out why a server answers 400 Bad Request to a body you thought was fine.",
  ],
  steps: [
    "Paste JSON into the Input panel, or use Load Example to try a sample.",
    "Read the formatted result in the Output panel. It updates as you type and is syntax highlighted.",
    "Choose 2sp or 4sp for the indentation, or Min to minify the JSON onto a single line.",
    "If the JSON is invalid, read the error message under the panels. When it is valid, the same line shows the number of keys, values, nesting depth and size in bytes.",
    "Copy the result with the copy button in the Output panel.",
  ],
  faq: [
    {
      q: "Is my JSON uploaded anywhere?",
      a: "No. Parsing and formatting run in your browser, so you can paste API responses that contain personal data or tokens without sending them to a server.",
    },
    {
      q: "Why is my JSON invalid?",
      a: "Check for a comma after the last item in an object or array, single quotes instead of double quotes, unquoted keys and comments. These are allowed in JavaScript but not in JSON. The error message comes from your browser's JSON parser and usually says where it stopped.",
    },
    {
      q: "Does formatting change my data?",
      a: "It changes whitespace, and keys and values stay the same. A few things follow JavaScript rules: keys that are whole numbers, such as `\"10\"`, move to the front of their object in ascending order, a key that appears twice keeps only its last value, and integers longer than about 15 digits lose precision.",
    },
    {
      q: "What is the difference between formatting and minifying JSON?",
      a: "Formatting adds indentation and line breaks to make JSON readable. Minifying removes all whitespace that is not inside a string to make it as small as possible. Both describe exactly the same data.",
    },
  ],
  related: [
    { href: "/learn/json", label: "Lesson: Reading JSON" },
    { href: "/learn/schemas-contracts", label: "Lesson: Schemas and contract testing" },
    { href: "/tools/json-yaml-csv", label: "JSON, YAML and CSV Converter" },
    { href: "/tools/json-xml", label: "JSON and XML Converter" },
  ],
};
