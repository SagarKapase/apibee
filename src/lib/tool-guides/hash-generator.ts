import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "What is a hash?",
  about: [
    "A hash function turns any input into a fixed-length fingerprint. The same input always gives the same hash, a one-character change gives a completely different one, and you cannot work back from the hash to the input. MD5 produces 128 bits, SHA-1 160, SHA-256 256 and SHA-512 512, shown here as hexadecimal strings of 32, 40, 64 and 128 characters.",
    "Developers use hashes to check that data has not changed. A download page lists a SHA-256 checksum so you can confirm the file you received is the one that was published. APIs use hashes as ETags, as idempotency keys and inside request signatures, where the client hashes the body and the server checks that the hash matches.",
    "The algorithms are not equally safe. MD5 and SHA-1 are broken for security: attackers can create two different inputs with the same hash. They are still fine for non-security checks such as spotting duplicate files, but use SHA-256 or SHA-512 for anything an attacker might try to forge.",
    "A plain hash is also the wrong way to store passwords, because fast hashes let attackers try billions of guesses per second. Password storage needs a slow, salted algorithm such as bcrypt, scrypt or Argon2.",
  ],
  steps: [
    "Type or paste text into the Input Text box. The byte count of the text, encoded as UTF-8, appears above it.",
    "Read the MD5, SHA-1, SHA-256 and SHA-512 hashes below. They update shortly after you stop typing.",
    "Copy a single hash with the copy button on its panel, or use Copy All to copy all four hashes as labelled lines.",
    "Use Clear to empty the input and start again.",
  ],
  faq: [
    {
      q: "Is my text sent to a server?",
      a: "No. SHA-1, SHA-256 and SHA-512 are computed by your browser's built-in Web Crypto API, and MD5 by JavaScript on the page. Nothing you type leaves your device.",
    },
    {
      q: "Why doesn't my hash match the one from another tool?",
      a: "Hashes are calculated over exact bytes. A trailing newline, a space, Windows line endings or a different text encoding all change the result. Command-line tools such as `echo` add a newline unless you use `echo -n`.",
    },
    {
      q: "Can I decrypt or reverse a hash?",
      a: "No. Hashing is one-way, so there is nothing to decrypt. Sites that claim to reverse MD5 look the hash up in tables of hashes of common words and passwords, which only works for weak inputs.",
    },
    {
      q: "Which hash algorithm should I use?",
      a: "Use SHA-256 for checksums, signatures and anything security related. SHA-512 is also safe and can be faster on 64-bit hardware. Use MD5 or SHA-1 only when a system you work with requires them.",
    },
    {
      q: "Can I hash a file?",
      a: "Not with this tool. It hashes the text you type, encoded as UTF-8. To hash a file, use `sha256sum` on Linux, `shasum -a 256` on macOS or `Get-FileHash` in PowerShell.",
    },
  ],
  related: [
    { href: "/learn/security-testing", label: "Lesson: Security testing basics" },
    { href: "/learn/headers-caching-cookies", label: "Lesson: Headers, caching and cookies" },
    { href: "/tools/password-generator", label: "Password & Secret Generator" },
    { href: "/tools/base64", label: "Base64 Encoder / Decoder" },
  ],
};
