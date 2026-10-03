import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "What is a JWT?",
  about: [
    "A JSON Web Token (JWT) is a compact, signed way of passing claims between two parties, most often from an authentication server to an API. It looks like three Base64url strings joined by dots: `header.payload.signature`. Most APIs expect it in the `Authorization: Bearer <token>` header.",
    "The header says how the token is signed, for example `\"alg\": \"HS256\"` for an HMAC with a shared secret or `RS256` for an RSA key pair. The payload holds the claims: standard ones such as `sub` (who the token is about), `iat` (when it was issued) and `exp` (when it expires), plus any custom claims the issuer adds, such as a role or scopes.",
    "The signature is what makes the token trustworthy. The server computes it over the header and payload with its key, so if anyone changes a single character of the payload the signature no longer matches and the token is rejected. Without the key you can read a token but not forge one.",
    "That is also the most important thing to understand about JWTs: the payload is encoded, not encrypted. Anyone who has the token can read every claim in it, so never put passwords or other secrets in a JWT, and treat the token itself like a password, because whoever holds it can use it until it expires.",
  ],
  steps: [
    "Paste a token into the Token box, or click Load sample token to try one.",
    "Read the decoded Header and Payload panels. The badges under the header show the signing algorithm (`alg`) and type (`typ`).",
    "Check the Claims list under the payload for the subject, issue time and expiry. The badge on the Payload panel shows EXPIRED, VALID or NO EXPIRY based on the `exp` claim and your device clock.",
    "Use the copy buttons to copy the token or its signature.",
  ],
  faq: [
    {
      q: "Is it safe to paste a real token here?",
      a: "The token is decoded in your browser and is not sent anywhere. Even so, a live token grants access until it expires, so prefer test tokens or tokens that have already expired, and never share live tokens in tickets or chat.",
    },
    {
      q: "Does this tool verify the signature?",
      a: "No. Verifying a signature needs the secret or public key that signed the token, and this tool only decodes. VALID on the Payload panel means only that the `exp` time has not passed yet. It does not mean the token is genuine. Your API must always verify the signature on the server.",
    },
    {
      q: "Why does it say \"Expected 3 parts separated by dots\"?",
      a: "A signed JWT always has exactly three parts. You may have copied only part of the token, included the `Bearer ` prefix with extra text, or pasted an encrypted JWE token, which has five parts and cannot be read without the key.",
    },
    {
      q: "What format are the iat and exp times in?",
      a: "They are Unix timestamps: the number of seconds since 1 January 1970 UTC. The tool converts them into a readable date and shows how long ago the token was issued and how long until it expires.",
    },
    {
      q: "Why is my token rejected when the decoder shows it as valid?",
      a: "Common causes are a signature made with a different key, a wrong `aud` (audience) or `iss` (issuer) claim, a token used before its `nbf` (not before) time, or a clock difference between servers. Look at the API's error response and check those claims in the payload.",
    },
  ],
  related: [
    { href: "/learn/authentication", label: "Lesson: Authentication" },
    { href: "/docs/jwt", label: "API docs: JWT endpoints" },
    { href: "/tools/base64", label: "Base64 Encoder / Decoder" },
    { href: "/tools/timestamp", label: "Unix Timestamp Converter" },
  ],
};
