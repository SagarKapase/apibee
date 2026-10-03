import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "What is a text diff?",
  about: [
    "A diff shows how two versions of a text differ. Instead of reading both side by side and hunting for changes, you get a list of lines marked as added, removed or unchanged. It is the same idea behind `git diff`, code review tools and the \"compare\" feature in most editors.",
    "Diff tools work by finding the longest sequence of lines the two texts have in common, then reporting everything else as a change. A line that was edited shows up as the old line removed and the new line added, because the comparison is done line by line rather than word by word.",
    "For API developers a diff answers questions like: what changed in this response since yesterday, why does staging return something different from production, and which fields did the new API version add or drop. Comparing two pretty-printed JSON responses is one of the quickest ways to spot a breaking change.",
    "To get a useful diff of JSON, format both sides the same way first. If one response is minified and the other is indented, every line will look different. Run both through a JSON formatter, then compare.",
  ],
  steps: [
    "Paste the older version into the Original panel and the newer version into the Modified panel. Use Load Example to see two versions of a JSON document.",
    "Read the Diff Output panel. Added lines are green and marked `+`, removed lines are red and marked `-`, and unchanged lines are grey.",
    "Use the two line-number columns to find each line in the original (left number) and the modified text (right number).",
    "Check the summary above the output for the number of additions, deletions and unchanged lines. Use Clear to empty both panels.",
  ],
  faq: [
    {
      q: "Why is a changed line shown as one removal and one addition?",
      a: "The tool compares whole lines. If any character on a line changes, the old line no longer matches, so it is shown as removed and the new line as added, next to each other.",
    },
    {
      q: "Does it ignore whitespace or letter case?",
      a: "No. Lines must match exactly, so a trailing space, a tab instead of spaces or a change of case counts as a difference. Normalise both texts first if you want to ignore those.",
    },
    {
      q: "How do I compare two JSON API responses?",
      a: "Format both responses with the same indentation, for example in the JSON Formatter, then paste them here. Consistent formatting means only real changes in keys and values show up in the diff.",
    },
    {
      q: "Is my text uploaded anywhere?",
      a: "No. The comparison runs in your browser. Neither version of your text is sent to a server.",
    },
  ],
  related: [
    { href: "/tools/json-formatter", label: "JSON Formatter & Validator" },
    { href: "/learn/schemas-contracts", label: "Lesson: Schemas and contract testing" },
    { href: "/docs/versioning", label: "API docs: Versioning" },
    { href: "/tools/regex-tester", label: "Regex Tester" },
  ],
};
