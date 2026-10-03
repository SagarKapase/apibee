import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "What is a regular expression?",
  about: [
    "A regular expression, or regex, is a pattern that describes a set of strings. `\\d{3}` means three digits, `[a-z]+` means one or more lowercase letters, and `^` and `$` anchor a match to the start and end of the text. Programs use these patterns to find, extract, validate and replace text.",
    "Parts of a pattern wrapped in parentheses are capture groups. They let you pull out pieces of a match: in `(\\d{4})-(\\d{2})` matched against `2025-07`, group 1 is `2025` and group 2 is `07`. Flags change how the whole pattern behaves, for example `i` ignores case and `g` finds every match instead of only the first.",
    "In API work regexes show up everywhere. Test suites use them to assert that an ID, a date or a token in a response has the right shape without caring about its exact value. Servers use them to validate request fields like emails and phone numbers, and API gateways use them to route paths. Log searches and data cleanup scripts rely on them too.",
    "Regex syntax differs slightly between languages. This tester uses the JavaScript engine built into your browser, so a pattern that works here will work in JavaScript and TypeScript. Most simple patterns also behave the same in Python, Java, Go and PCRE, but features such as lookbehind, named groups and Unicode classes vary.",
  ],
  steps: [
    "Type a pattern in the Pattern field, without the surrounding slashes. Or pick a preset: Email, URL, IP Address or Phone.",
    "Toggle the flags under the pattern: `g` (global), `i` (case-insensitive), `m` (multiline) and `s` (dotAll). You can also type flags directly in the box after the closing slash.",
    "Paste the text you want to search into the Test String panel. Matches are highlighted in the Highlighted panel as you type, with a match count at the top.",
    "Check Match Details for each match's start and end position and the value of every capture group (`$1`, `$2` and so on). Use the copy button next to a match to copy it.",
    "If the pattern is invalid, the error message from the regex engine appears under the pattern. Use Clear to start again.",
  ],
  faq: [
    {
      q: "Why does it only find one match?",
      a: "The `g` (global) flag is off. Without it a regex stops after the first match. Turn `g` on to find every match in the text.",
    },
    {
      q: "What is the difference between the m and s flags?",
      a: "`m` (multiline) makes `^` and `$` match at the start and end of each line instead of the whole text. `s` (dotAll) makes `.` match line breaks too; without it, `.` matches any character except a newline.",
    },
    {
      q: "Do I need to escape special characters?",
      a: "Yes. Characters such as `.`, `?`, `+`, `*`, `(`, `)`, `[`, `{` and `\\` have special meanings. To match one literally, put a backslash before it, so `\\.` matches a real dot. Inside this tester you type a single backslash, not the double backslash you would need inside a string in code.",
    },
    {
      q: "Is the Email preset a complete email validator?",
      a: "No. It matches the common `name@domain.tld` shape and is fine for finding emails in text, but the full email address standard is far more permissive. For validation, check the basic shape with a regex and then confirm the address by sending an email to it.",
    },
    {
      q: "Is my text sent to a server?",
      a: "No. The pattern and test text are processed by your browser's own regex engine. Nothing is uploaded.",
    },
  ],
  related: [
    { href: "/learn/validation-errors", label: "Lesson: Testing validation and errors" },
    { href: "/learn/schemas-contracts", label: "Lesson: Schemas and contract testing" },
    { href: "/tools/text-diff", label: "Text Diff Checker" },
    { href: "/docs/validation", label: "API docs: Validation" },
  ],
};
