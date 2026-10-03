import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "What is URL encoding?",
  about: [
    "URL encoding, also called percent-encoding, replaces characters that are not allowed or have a special meaning in a URL with a `%` followed by two hexadecimal digits. A space becomes `%20`, `&` becomes `%26` and `/` becomes `%2F`. Non-ASCII characters are first converted to UTF-8 bytes, so `é` becomes `%C3%A9`.",
    "It matters because some characters structure the URL itself. `?` starts the query string, `&` separates parameters, `=` separates a name from its value and `#` starts the fragment. If a search term contains `&`, it has to be encoded, or the server will read it as the start of a new parameter.",
    "In API work you encode query parameter values, path segments that contain user input, redirect URLs passed as parameters in OAuth flows, and form bodies sent as `application/x-www-form-urlencoded`. A common bug is an unencoded `+` or `&` in a value, which silently changes what the server receives.",
    "Encode each value separately, not the whole URL at once. Encoding a complete URL with component encoding also encodes its `://`, `/` and `?`, which breaks it. The Full URL option keeps those structure characters for cases where you only need to fix spaces and other unsafe characters.",
  ],
  steps: [
    "Choose Encode or Decode.",
    "In Encode mode, choose Component to encode a single value such as a query parameter (it uses `encodeURIComponent` and encodes `: / ? # & =`). Choose Full URL to encode a complete URL while keeping its structure (it uses `encodeURI`).",
    "Paste your text into the left panel. The result appears on the right as you type. Use Load Example to try a sample URL.",
    "Copy the result with the copy button. Below the panels you can see the input and output lengths and how many characters were encoded.",
    "If decoding fails, the tool shows \"Invalid percent-encoding\". Look for a `%` that is not followed by two hexadecimal digits.",
  ],
  faq: [
    {
      q: "What is the difference between encodeURI and encodeURIComponent?",
      a: "`encodeURIComponent` encodes everything except letters, digits and `- _ . ! ~ * ' ( )`, so it is right for a single value. `encodeURI` leaves characters that structure a URL, such as `: / ? # & =`, untouched, so it is right for a whole URL that only needs unsafe characters fixed.",
    },
    {
      q: "Should a space be %20 or +?",
      a: "In a URL path and in most APIs, use `%20`. A `+` means space only in `application/x-www-form-urlencoded` data, such as HTML form submissions. This tool encodes spaces as `%20`, and when decoding it leaves `+` as a plus sign.",
    },
    {
      q: "Why do I get \"Invalid percent-encoding\" when decoding?",
      a: "The input contains a `%` that is not followed by two valid hexadecimal digits, such as `100%` or `%ZZ`, or a sequence that is not valid UTF-8. Fix or remove that part, or encode the text first if it was never encoded.",
    },
    {
      q: "Why does my URL break when I encode it?",
      a: "You probably encoded the whole URL in Component mode, which also encodes `:` and `/`. Either switch to Full URL, or encode only the parameter values and then join them into the URL.",
    },
    {
      q: "Is my input sent to a server?",
      a: "No. Encoding and decoding use your browser's built-in functions, and nothing you paste leaves your device.",
    },
  ],
  related: [
    { href: "/learn/query-parameters", label: "Lesson: Filtering, sorting and pagination" },
    { href: "/tools/base64", label: "Base64 Encoder / Decoder" },
    { href: "/tools/curl-parser", label: "cURL Parser" },
    { href: "/docs/oauth", label: "API docs: OAuth" },
  ],
};
