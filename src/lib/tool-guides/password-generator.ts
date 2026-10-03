import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "What makes a password or secret strong?",
  about: [
    "A password's strength comes from how many possibilities an attacker would have to try to guess it. That is measured in bits of entropy: length multiplied by the base-2 logarithm of the number of characters you could have used. A 16-character password drawn from the 91 letters, digits and symbols this tool offers has about 104 bits; a 6-digit PIN has about 20.",
    "Length matters more than anything else. Each extra character multiplies the number of possibilities, while adding a character set only increases the base a little. That is why long random strings beat short clever ones, and why a password manager is the best place to keep them.",
    "The same idea applies to the secrets you handle in API work: API keys, client secrets, webhook signing secrets, session tokens and encryption keys. These are never typed by a person, so they should be long and fully random. 128 bits is a common minimum for a key, which is 32 hex characters or about 22 characters of mixed letters and digits.",
    "Randomness has to come from a cryptographically secure source. `Math.random()` is predictable and must never be used for secrets. This tool uses the browser's `crypto.getRandomValues()`, the same secure generator that web applications use for keys.",
  ],
  steps: [
    "Drag the Length slider to set the length, from 4 to 128 characters.",
    "Choose the Character Sets to include, A-Z, a-z, 0-9 and !@#$ symbols, and type any extra characters in the Custom characters box. A new value is generated whenever you change a setting.",
    "Or pick a preset: Password (16 characters), API Key (40 characters), Hex Token (64 hex characters) or PIN (6 digits).",
    "Check the strength meter, which shows the entropy in bits, then click Regenerate for a new value or copy it with the copy button.",
    "To create several at once, enter a number from 1 to 20 next to Bulk Generate, click Generate, and use Copy All to copy the list.",
  ],
  faq: [
    {
      q: "Are the generated passwords sent or stored anywhere?",
      a: "No. They are generated in your browser and are not sent to a server or saved. Once you leave the page they are gone, so store any you need in a password manager or secret store.",
    },
    {
      q: "How long should a password be?",
      a: "For a password you store in a password manager, 16 or more random characters with all character sets is plenty. For API keys and tokens, aim for at least 128 bits on the strength meter. Longer is always safer and costs almost nothing.",
    },
    {
      q: "What do Weak, Fair, Good and Strong mean?",
      a: "They are bands of entropy: Weak is under 28 bits, Fair under 60, Good under 120 and Strong 120 bits or more. They assume the value is fully random, which is true here but not for passwords people invent.",
    },
    {
      q: "Some systems reject symbols. What should I do?",
      a: "Turn off the !@#$ set, or type only the symbols the system accepts into the Custom characters box. Then increase the length to make up for the smaller character set.",
    },
  ],
  related: [
    { href: "/learn/security-testing", label: "Lesson: Security testing" },
    { href: "/learn/authentication", label: "Lesson: Authentication" },
    { href: "/tools/hash-generator", label: "Hash Generator" },
    { href: "/tools/uuid-generator", label: "UUID Generator" },
  ],
};
