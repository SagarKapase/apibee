import React from "react";

export type Lang =
  | "json"
  | "javascript"
  | "python"
  | "curl"
  | "java"
  | "php"
  | "xml"
  | "graphql"
  | "text";

const C = {
  keyword: "#8ab4f8",
  string: "#a5d6a7",
  number: "#f2b872",
  comment: "#6b6560",
  punct: "#8a837d",
  text: "#d6d3d1",
  fn: "#f2b872",
  url: "#a8a29e",
} as const;

function s(text: string, color: string, key: number | string) {
  return (
    <span key={key} style={{ color }}>
      {text}
    </span>
  );
}

function highlightJSON(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Regex to match: strings (keys or values), numbers, booleans, null, punctuation, whitespace
  const re =
    /("(?:[^"\\]|\\.)*")\s*(:)|("(?:[^"\\]|\\.)*")|(true|false|null)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\]:,])|(\s+)|([^\s"{}[\]:,]+)/g;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = re.exec(code)) !== null) {
    // m[1] = key string, m[2] = colon after key
    // m[3] = value string
    // m[4] = boolean/null
    // m[5] = number
    // m[6] = punctuation
    // m[7] = whitespace
    // m[8] = other text
    if (m[1] && m[2]) {
      nodes.push(s(m[1], C.keyword, i++));
      nodes.push(s(m[2], C.punct, i++));
    } else if (m[3]) {
      nodes.push(s(m[3], C.string, i++));
    } else if (m[4]) {
      nodes.push(s(m[4], C.keyword, i++));
    } else if (m[5]) {
      nodes.push(s(m[5], C.number, i++));
    } else if (m[6]) {
      nodes.push(s(m[6], C.punct, i++));
    } else if (m[7]) {
      nodes.push(<span key={i++}>{m[7]}</span>);
    } else if (m[8]) {
      nodes.push(s(m[8], C.text, i++));
    }
  }
  return nodes;
}

function highlightGeneric(
  code: string,
  keywords: string[],
  fns: string[] = []
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const kwSet = new Set(keywords);
  const fnSet = new Set(fns);

  // Match strings, single-line comments, keywords/identifiers, URLs, $-variables, numbers, or other chars
  const re =
    /(\/\/[^\n]*|#[^\n]*)|(["'`])(?:(?!\2|\\).|\\.)*\2|(https?:\/\/[^\s"'`,;)]+)|(\$\w+)|([a-zA-Z_]\w*)|(-?\d+(?:\.\d+)?)|(\s+)|(.)/g;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = re.exec(code)) !== null) {
    const [full] = m;
    if (m[1]) {
      nodes.push(s(full, C.comment, i++));
    } else if (m[2]) {
      nodes.push(s(full, C.string, i++));
    } else if (m[3]) {
      nodes.push(s(full, C.url, i++));
    } else if (m[4]) {
      nodes.push(s(full, C.keyword, i++));
    } else if (m[5]) {
      if (kwSet.has(full)) {
        nodes.push(s(full, C.keyword, i++));
      } else if (fnSet.has(full)) {
        nodes.push(s(full, C.fn, i++));
      } else {
        nodes.push(s(full, C.text, i++));
      }
    } else if (m[6]) {
      nodes.push(s(full, C.number, i++));
    } else if (m[7]) {
      nodes.push(<span key={i++}>{full}</span>);
    } else {
      nodes.push(s(full, C.punct, i++));
    }
  }
  return nodes;
}

function highlightXML(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re =
    /(<\/?)([a-zA-Z][\w.-]*)([^>]*?)(\/?>)|([^<]+)/g;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = re.exec(code)) !== null) {
    if (m[1]) {
      nodes.push(s(m[1], C.punct, i++));
      nodes.push(s(m[2], C.keyword, i++));
      if (m[3]) {
        // Highlight attributes inside
        const attrRe = /(\s+)([a-zA-Z][\w.-]*)(=)("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')?/g;
        let a: RegExpExecArray | null;
        let lastIdx = 0;
        const attrStr = m[3];
        while ((a = attrRe.exec(attrStr)) !== null) {
          if (a.index > lastIdx) {
            nodes.push(s(attrStr.slice(lastIdx, a.index), C.text, i++));
          }
          nodes.push(<span key={i++}>{a[1]}</span>);
          nodes.push(s(a[2], C.fn, i++));
          nodes.push(s(a[3], C.punct, i++));
          if (a[4]) nodes.push(s(a[4], C.string, i++));
          lastIdx = a.index + a[0].length;
        }
        if (lastIdx < attrStr.length) {
          nodes.push(s(attrStr.slice(lastIdx), C.text, i++));
        }
      }
      nodes.push(s(m[4], C.punct, i++));
    } else if (m[5]) {
      nodes.push(s(m[5], C.text, i++));
    }
  }
  return nodes;
}

const LANG_KEYWORDS: Record<string, { kw: string[]; fn: string[] }> = {
  javascript: {
    kw: [
      "fetch", "then", "const", "let", "var", "return", "function", "async",
      "await", "import", "from", "export", "default", "new", "if", "else",
      "class", "extends", "this", "true", "false", "null", "undefined",
    ],
    fn: ["console", "log", "json", "stringify", "parse", "res"],
  },
  python: {
    kw: [
      "import", "from", "def", "return", "class", "if", "else", "elif",
      "for", "in", "while", "True", "False", "None", "as", "with", "try",
      "except", "raise", "pass", "and", "or", "not", "is",
    ],
    fn: ["print", "requests", "get", "post", "json", "response"],
  },
  curl: {
    kw: ["curl"],
    fn: [],
  },
  graphql: {
    kw: ["query", "mutation", "fragment", "on", "true", "false", "null"],
    fn: [],
  },
  java: {
    kw: [
      "public", "private", "protected", "static", "final", "void", "class",
      "interface", "extends", "implements", "new", "return", "if", "else",
      "for", "while", "try", "catch", "throw", "throws", "import", "var",
    ],
    fn: [
      "HttpClient", "HttpRequest", "HttpResponse", "URI", "String",
      "System", "out", "println", "newBuilder", "uri", "create", "build",
      "send", "newHttpClient", "body", "BodyHandlers", "ofString",
    ],
  },
  php: {
    kw: [
      "function", "return", "if", "else", "foreach", "echo", "class",
      "new", "public", "private", "protected", "true", "false", "null",
    ],
    fn: [
      "file_get_contents", "json_decode", "print_r", "array", "strlen",
      "isset", "empty",
    ],
  },
};

export function Highlighted({
  code,
  lang,
}: {
  code: string;
  lang: Lang;
}) {
  let nodes: React.ReactNode[];
  if (lang === "text") {
    return <span style={{ color: C.text }}>{code}</span>;
  } else if (lang === "json") {
    nodes = highlightJSON(code);
  } else if (lang === "xml") {
    nodes = highlightXML(code);
  } else {
    const cfg = LANG_KEYWORDS[lang] ?? { kw: [], fn: [] };
    nodes = highlightGeneric(code, cfg.kw, cfg.fn);
  }
  return <>{nodes}</>;
}
