// Written guide shown under each tool. Strings may use `backticks` for inline code (see InlineText).
export interface ToolGuide {
  /** Heading for the explainer, e.g. "What is Base64?" */
  aboutTitle: string;
  /** Explainer paragraphs: what the format or concept is and when developers need it. */
  about: string[];
  /** How to use this tool, one action per step. */
  steps: string[];
  /** Questions people search for about this topic, answered in two to four sentences. */
  faq: { q: string; a: string }[];
  /** Related lessons, API docs or tools on this site. */
  related: { href: string; label: string }[];
}
