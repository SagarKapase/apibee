import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "What is Base64?",
  about: [
    "Base64 is a way of writing any bytes using only 64 safe characters: `A`–`Z`, `a`–`z`, `0`–`9`, `+` and `/`, with `=` used as padding at the end. Every 3 bytes of input become 4 characters of output, so encoded data is about a third larger than the original.",
    "It exists because many systems only handle text reliably. Base64 lets you put binary data, such as an image, a file or a cryptographic key, inside JSON, an email, a URL or an HTTP header without it being corrupted on the way.",
    "In API work you meet it constantly. HTTP Basic authentication sends `username:password` Base64 encoded in the `Authorization` header. The header and payload of a JWT are Base64url encoded. Many APIs return file contents or thumbnails as Base64 strings inside a JSON response.",
    "Base64 is an encoding, not encryption. Anyone can decode it, so never treat a Base64 string as a way of hiding a password or secret.",
  ],
  steps: [
    "Choose Encode to turn plain text into Base64, or Decode to turn a Base64 string back into text.",
    "Paste or type your input in the left panel. The result updates as you type.",
    "Copy the result from the right panel with the copy button.",
    "Use Load Example to see a sample with accented and non-Latin characters, which shows that the tool encodes text as UTF-8.",
  ],
  faq: [
    {
      q: "Is my data sent to a server?",
      a: "No. Encoding and decoding run in your browser with JavaScript. Nothing you paste into this tool leaves your device.",
    },
    {
      q: "Why does decoding fail with an error?",
      a: "The input contains characters outside the Base64 alphabet, or it was cut off part way through. A common cause is Base64url, the variant used in JWTs and URLs, which writes `-` and `_` instead of `+` and `/`. Replace those two characters before decoding, or paste a JWT into the JWT Decoder instead.",
    },
    {
      q: "Why are some encoded strings longer than others for the same number of characters?",
      a: "Base64 encodes bytes, not characters. In UTF-8 an English letter takes 1 byte, an accented letter 2 bytes and many Asian characters 3 bytes, so text in those scripts produces longer Base64.",
    },
    {
      q: "How do I decode a Basic auth header?",
      a: "Take the part after `Basic ` in the `Authorization` header and decode it here. The result is the username and password separated by a colon.",
    },
  ],
  related: [
    { href: "/learn/authentication", label: "Lesson: Authentication" },
    { href: "/tools/jwt-decoder", label: "JWT Decoder" },
    { href: "/tools/url-encoder", label: "URL Encoder / Decoder" },
    { href: "/tools/hash-generator", label: "Hash Generator" },
  ],
};
