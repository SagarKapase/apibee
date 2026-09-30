"""Generate src/lib/api-catalog.json from the API reference .docx.

Usage:
    python scripts/generate-api-catalog.py path/to/API-Reference.docx

Requires python-docx (pip install python-docx). The document's structure is
fixed: Heading 1 = category, Heading 2 = group, Heading 3 = endpoint, labelled
sections in bold caps, code in shaded Consolas paragraphs.
"""

import json
import re
import sys
from pathlib import Path

import docx
from docx.table import Table
from docx.text.paragraph import Paragraph

OUT = Path(__file__).resolve().parent.parent / "src" / "lib" / "api-catalog.json"

HTTP_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
LABELS = {
    "DESCRIPTION",
    "PARAMETERS",
    "REQUEST BODY",
    "RESPONSES",
    "EXAMPLE REQUEST",
    "EXAMPLE RESPONSE",
    "EXAMPLE",
    "RESPONSE",
}

CATEGORY_IDS = {
    "Start here": "start-here",
    "HTTP basics": "http-basics",
    "Formats & data": "formats-and-data",
    "Auth & security": "auth-and-security",
    "API patterns": "api-patterns",
    "Resources": "resources",
    "Original snap-test": "original",
}

CATEGORY_TITLES = {"Original snap-test": "Original API"}

# Display names for groups whose document name is a controller name.
GROUP_IDS = {"OAuth": "oauth", "WebSocket": "websocket", "JwtAuth": "jwt"}

# Example URLs the document cuts off mid-URL. The OAuth one uses the PKCE
# sample from RFC 7636 (verifier dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk).
URL_OVERRIDES = {
    "Utils_JwtDecode": "/api/utils/jwt/decode?token={{userJwt}}",
    "OAuth_Authorize": (
        "/api/auth/oauth/authorize?response_type=code&client_id=apibee-public"
        "&redirect_uri=http://localhost:3000/callback&state=xyz"
        "&code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
        "&code_challenge_method=S256"
    ),
}

GROUP_TITLES = {
    "EdgeCases": "Edge cases",
    "AuthSchemes": "Auth schemes",
    "JwtAuth": "JWT",
    "RateLimit": "Rate limit",
    "Soap": "SOAP",
    "User": "Users",
    "UserXML": "Users (XML)",
    "AuthTest": "Basic auth test",
    "FormData": "Form data",
    "WeatherForecast": "Weather forecast",
}


def slug(text):
    text = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", text)
    text = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1-\2", text)
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def clean(text):
    return text.replace("﻿", "").rstrip()


def normalize_host(text):
    """Examples were captured locally; point them at the public host."""
    text = text.replace("ws://localhost:5251", "{{wsBaseUrl}}")
    text = text.replace("http://localhost:5251", "{{baseUrl}}")
    return text.replace("localhost:5251", "{{host}}")


def is_code(p):
    ppr = p._p.pPr
    return ppr is not None and "w:shd" in ppr.xml


def table_rows(tbl):
    rows = []
    for r in tbl.rows:
        rows.append([clean(c.text) for c in r.cells])
    return rows


def iter_blocks(document):
    for el in document.element.body.iterchildren():
        tag = el.tag.split("}")[1]
        if tag == "p":
            p = Paragraph(el, document)
            style = p.style.name if p.style is not None else ""
            yield ("p", style, clean(p.text), is_code(p))
        elif tag == "tbl":
            yield ("table", "", table_rows(Table(el, document)), False)


def parse_heading3(text):
    head, _, rest = text.partition("  ")
    methods = [m.strip() for m in head.split("·")]
    return methods, rest.strip()


def split_sections(blocks):
    """Split an entry's blocks into a preamble and labelled sections."""
    pre, sections, current = [], {}, None
    for b in blocks:
        kind, _, content, code = b
        if kind == "p" and not code and content in LABELS:
            current = content
            sections[current] = []
        elif current is None:
            pre.append(b)
        else:
            sections[current].append(b)
    return pre, sections


def code_text(blocks):
    lines = [c for kind, _, c, code in blocks if kind == "p" and code]
    return normalize_host("\n".join(lines).strip("\n"))


def prose(blocks):
    return [c for kind, _, c, code in blocks if kind == "p" and not code and c.strip()]


def first_table(blocks):
    for kind, _, content, _ in blocks:
        if kind == "table":
            return content
    return None


def parse_params(blocks):
    rows = first_table(blocks)
    if not rows:
        return []
    header = [h.lower() for h in rows[0]]
    out = []
    for r in rows[1:]:
        row = dict(zip(header, r))
        param = {
            "name": row.get("name", ""),
            "in": row.get("in", ""),
            "type": row.get("type", ""),
            "required": row.get("required", "").lower().startswith("y"),
            "description": row.get("description", ""),
        }
        if row.get("default"):
            param["default"] = row["default"]
        out.append(param)
    return out


def repair_example(text):
    """Close strings and tags that the document truncated with an ellipsis."""
    if "…" not in text:
        return text
    if text.lstrip().startswith("<"):
        body = text.rstrip("…")
        body = body[: body.rfind("<")] if body.rfind("<") > body.rfind(">") else body
        stack = []
        for closing, name, self_closing in re.findall(r"<(/?)([\w:.-]+)[^>]*?(/?)>", body):
            if closing:
                if stack and stack[-1] == name:
                    stack.pop()
            elif not self_closing:
                stack.append(name)
        return body + "".join(f"</{name}>" for name in reversed(stack))
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if "…" in line and len(re.findall(r'(?<!\\)"', line)) % 2 == 1:
            following = next((l.strip() for l in lines[i + 1 :] if l.strip()), "")
            lines[i] = line + '"' + ("" if following[:1] in "}]" else ",")
    repaired = "\n".join(lines)
    try:
        json.loads(repaired)
    except ValueError:
        return text
    return repaired


def parse_request_body(blocks):
    if not blocks:
        return None
    text = prose(blocks)
    first = text[0] if text else ""
    required = first.lower().startswith("required")
    content_types = ""
    m = re.search(r"Content type:\s*(.*?)\.?$", first)
    if m:
        content_types = m.group(1)
    body = {
        "required": required,
        "contentTypes": content_types,
        "note": first if not m else first[: m.start()].strip().rstrip(".") or None,
        "description": " ".join(text[1:]) or None,
        "example": repair_example(code_text(blocks)) or None,
    }
    return {k: v for k, v in body.items() if v not in (None, "")} | {"required": required}


def parse_responses(blocks):
    rows = first_table(blocks) or []
    return [{"code": r[0], "description": r[1] if len(r) > 1 else ""} for r in rows[1:]]


CURL_START = re.compile(r'^curl -X (\w+) "([^"]+)"')


def parse_example_request(operation_id, blocks, request_body):
    curl = code_text(blocks)
    if operation_id in URL_OVERRIDES:
        url = "{{baseUrl}}" + URL_OVERRIDES[operation_id]
        curl = re.sub(r'^curl -X (\w+) "[^\n]*', lambda m: f'curl -X {m.group(1)} "{url}"', curl, count=1)
    # The document nests double quotes in SOAPAction headers.
    curl = re.sub(r'-H "SOAPAction: "([^"]*)""', r"""-H 'SOAPAction: "\1"'""", curl)
    m = CURL_START.match(curl)
    method, url = (m.group(1), m.group(2)) if m else ("GET", "")
    path = url.replace("{{baseUrl}}", "")
    # Long bodies are cut off with an ellipsis in the document; rebuild them
    # from the request body example so the command still works.
    if "…" in curl and request_body and request_body.get("example"):
        compact = request_body["example"]
        try:
            compact = json.dumps(json.loads(compact), ensure_ascii=False)
        except ValueError:
            compact = "".join(line.strip() for line in compact.splitlines())
        data = "  -d '" + compact.replace("'", "'\\''") + "'"
        curl = re.sub(r"^  (?:-d |--data-urlencode )[^\n]*…[^\n]*$", lambda _: data, curl, flags=re.M)
    return {"method": method, "path": path, "curl": curl}


HEADER_LINE = re.compile(r"^[A-Za-z][A-Za-z0-9-]*: ")


def parse_example_response(blocks):
    text = code_text(blocks)
    lines = text.split("\n")
    status = lines[0].replace("HTTP ", "", 1) if lines and lines[0].startswith("HTTP ") else ""
    rest = lines[1:] if status else lines
    headers = []
    while rest and HEADER_LINE.match(rest[0]):
        name, _, value = rest.pop(0).partition(": ")
        headers.append([name, value])
    return {"status": status, "headers": headers, "body": "\n".join(rest).strip("\n")}


def parse_endpoint(heading, blocks):
    methods, path = parse_heading3(heading)
    pre, sec = split_sections(blocks)
    lines = prose(pre)
    summary = lines[0] if lines else ""
    operation_id, auth = "", None
    for line in lines[1:]:
        if line.startswith("Operation ID:"):
            operation_id = line.split(":", 1)[1].split("·")[0].strip()
        elif line.startswith("Auth:"):
            auth = line.split(":", 1)[1].strip()
    request_body = parse_request_body(sec.get("REQUEST BODY"))
    endpoint = {
        "id": operation_id,
        "methods": methods,
        "path": path,
        "summary": summary,
        "auth": auth,
        "description": "\n\n".join(prose(sec.get("DESCRIPTION", []))) or None,
        "params": parse_params(sec.get("PARAMETERS", [])),
        "requestBody": request_body,
        "responses": parse_responses(sec.get("RESPONSES", [])),
        "exampleRequest": parse_example_request(operation_id, sec.get("EXAMPLE REQUEST", []), request_body),
        "exampleResponse": parse_example_response(sec.get("EXAMPLE RESPONSE", [])),
    }
    return {k: v for k, v in endpoint.items() if v is not None}


def parse_graphql_op(heading, blocks):
    kind, _, name = heading.partition("  ")
    pre, sec = split_sections(blocks)
    lines = prose(pre)
    returns, args = "", ""
    if lines:
        m = re.match(r"Returns (.*?)\. Arguments: (.*?)\.?$", lines[0])
        if m:
            returns, args = m.group(1), m.group(2)
    return {
        "kind": kind.lower(),
        "name": name.strip(),
        "returns": returns,
        "arguments": args,
        "example": code_text(sec.get("EXAMPLE", [])),
        "response": code_text(sec.get("RESPONSE", [])),
    }


def main(path):
    document = docx.Document(path)
    blocks = list(iter_blocks(document))

    categories, graphql, models = [], {"intro": [], "operations": [], "types": []}, []
    mode = None  # "api" | "graphql" | "models"
    category = group = None
    entry_heading, entry_blocks = None, []
    group_intro_open = False

    def flush_entry():
        nonlocal entry_heading, entry_blocks
        if entry_heading is None:
            return
        if mode == "api":
            group["endpoints"].append(parse_endpoint(entry_heading, entry_blocks))
        elif mode == "graphql":
            graphql["operations"].append(parse_graphql_op(entry_heading, entry_blocks))
        elif mode == "models":
            rows = first_table(entry_blocks) or []
            models.append({
                "name": entry_heading,
                "fields": [
                    {"name": r[0], "type": r[1], "required": r[2].lower().startswith("y"), "description": r[3]}
                    for r in rows[1:]
                ],
            })
        entry_heading, entry_blocks = None, []

    for b in blocks:
        kind, style, content, code = b
        if kind == "p" and style == "Heading 1":
            flush_entry()
            title = re.sub(r"^(\d+\.|Appendix [A-Z]\.)\s*", "", content)
            if title in CATEGORY_IDS:
                mode = "api"
                category = {
                    "id": CATEGORY_IDS[title],
                    "title": CATEGORY_TITLES.get(title, title),
                    "groups": [],
                }
                categories.append(category)
            elif title == "GraphQL":
                mode = "graphql"
            elif title == "Data models":
                mode = "models"
            else:
                mode = None
            continue
        if mode is None:
            continue
        if kind == "p" and style == "Heading 2":
            flush_entry()
            title = re.sub(r"^\d+\.\d+\s*", "", content)
            if mode == "api":
                group = {
                    "id": GROUP_IDS.get(title, slug(title)),
                    "name": title,
                    "title": GROUP_TITLES.get(title, title),
                    "description": "",
                    "endpoints": [],
                }
                category["groups"].append(group)
                group_intro_open = True
            continue
        if kind == "p" and style == "Heading 3":
            flush_entry()
            group_intro_open = False
            entry_heading = content
            continue
        if entry_heading is not None:
            entry_blocks.append(b)
        elif mode == "api" and group_intro_open and kind == "p" and content.strip() and not code:
            group["description"] = (group["description"] + " " + content).strip()
        elif mode == "graphql":
            if kind == "p" and content.strip():
                graphql["intro"].append({"code": code, "text": normalize_host(content)})
            elif kind == "table" and content and content[0][:2] == ["Type", "Fields"]:
                graphql["types"] = [{"name": r[0], "fields": r[1]} for r in content[1:]]
    flush_entry()

    # Merge consecutive intro code lines into single code blocks.
    merged = []
    for item in graphql["intro"]:
        if item["code"] and merged and merged[-1]["code"]:
            merged[-1]["text"] += "\n" + item["text"]
        else:
            merged.append(dict(item))
    graphql["intro"] = merged

    # Keep the document's path order, but list methods on the same path in
    # the usual reading order instead of alphabetically.
    rank = {m: i for i, m in enumerate(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])}
    for c in categories:
        for g in c["groups"]:
            first_seen = {}
            for i, e in enumerate(g["endpoints"]):
                first_seen.setdefault(e["path"], i)
            g["endpoints"].sort(key=lambda e: (first_seen[e["path"]], rank.get(e["methods"][0], 9)))

    # Operation IDs are not unique (the same action can serve two paths).
    seen = {}
    for c in categories:
        for g in c["groups"]:
            for e in g["endpoints"]:
                base = slug(e["id"] or (e["methods"][0] + e["path"]))
                n = seen.get(base, 0) + 1
                seen[base] = n
                e["anchor"] = base if n == 1 else f"{base}-{n}"

    catalog = {"categories": categories, "graphql": graphql, "models": models}
    OUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=1), encoding="utf-8")

    endpoints = sum(len(g["endpoints"]) for c in categories for g in c["groups"])
    groups = sum(len(c["groups"]) for c in categories)
    print(
        f"{len(categories)} categories, {groups} groups, {endpoints} endpoints, "
        f"{len(graphql['operations'])} GraphQL operations, {len(models)} models -> {OUT}"
    )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
