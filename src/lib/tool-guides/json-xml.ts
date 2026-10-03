import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "JSON and XML in APIs",
  about: [
    "JSON and XML both describe structured data as text. JSON uses objects, arrays and typed values such as numbers and booleans. XML uses nested elements with opening and closing tags, and everything inside an element is text unless a schema says otherwise.",
    "Most new APIs use JSON, but XML is still common. SOAP web services, RSS and Atom feeds, many banking, payment and government systems, and older enterprise APIs all send and expect XML. When a JSON-based app has to talk to one of these, you need to move data between the two formats.",
    "The formats do not map one to one, so every converter makes choices. XML has attributes and needs a single root element, while JSON has neither. JSON has arrays, while XML repeats an element with the same name. XML text has no types, so the converter has to guess whether `42` is a number or a string.",
    "Knowing these choices matters when you test an API that offers both formats. The same resource requested with `Accept: application/json` and `Accept: application/xml` should contain the same data, and a conversion is a quick way to compare them.",
  ],
  steps: [
    "Choose JSON → XML or XML → JSON at the top. Switching direction clears the panels.",
    "Paste your data into the Input panel, or use Load Example to try a sample.",
    "Read the converted result in the Output panel. It updates as you type.",
    "If the input is invalid, read the error message under the panels and fix the input.",
    "Copy the result with the copy button in the Output panel.",
  ],
  faq: [
    {
      q: "How are JSON arrays converted to XML?",
      a: "Each item becomes an element with the array's key as its name, repeated once per item. For example `\"users\": [1, 2]` becomes `<users>1</users><users>2</users>`. A top-level array is wrapped in `<root>` with one `<item>` element per entry.",
    },
    {
      q: "Why is everything wrapped in a root element?",
      a: "An XML document must have exactly one root element, while a JSON object can have many top-level keys. The converter puts the output inside `<root>`. When converting XML to JSON, the root element itself is dropped and its children become the top-level keys.",
    },
    {
      q: "What happens to XML attributes and data types?",
      a: "XML to JSON reads elements and their text only, so attributes are not included. Text that looks like a number becomes a JSON number, `true` and `false` become booleans, empty elements become `null`, and an element that appears more than once becomes an array.",
    },
    {
      q: "Is the conversion done on a server?",
      a: "No. JSON is parsed and XML is built in your browser, and XML is read with the browser's built-in parser. Nothing you paste is uploaded.",
    },
    {
      q: "Why is the XML output invalid for some JSON?",
      a: "XML element names cannot contain spaces or start with a digit, but JSON keys can. A key such as `first name` or `2fa` produces an element that XML parsers reject, so rename those keys before converting.",
    },
  ],
  related: [
    { href: "/docs/formats", label: "API docs: Formats endpoints" },
    { href: "/docs/user-xml", label: "API docs: Users (XML)" },
    { href: "/docs/soap", label: "API docs: SOAP services" },
    { href: "/tools/json-formatter", label: "JSON Formatter & Validator" },
  ],
};
