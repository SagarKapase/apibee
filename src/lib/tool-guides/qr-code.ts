import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "How QR codes work",
  about: [
    "A QR code is a two-dimensional barcode: a square grid of dark and light modules that a phone camera can read in a fraction of a second. The three large squares in the corners tell the scanner where the code is and which way up it is, and the rest of the grid holds the data, most often a URL.",
    "QR codes include error correction, extra data that lets a scanner rebuild the content even if part of the code is dirty, damaged or covered. The more data you put in, the more modules the code needs, so short URLs give smaller, simpler codes that scan more reliably from further away.",
    "Developers use them to move a link from a screen to a phone: opening a staging site or a mobile deep link on a test device, sharing Wi-Fi details at an event, pairing apps, or setting up two-factor authentication, where an authenticator app scans a QR code that contains an `otpauth://` URL.",
  ],
  steps: [
    "Type or paste a URL or any text into the Text / URL box, or click Load Example.",
    "Adjust Size with the slider, from 150 to 600 pixels, and pick Foreground and Background colours if you want.",
    "Scan the code shown in the QR Code panel with your phone to check it works.",
    "Click Download PNG to save it as `qrcode.png`, or use the Data URL button to copy it as a `data:image/png` URL you can paste into HTML or CSS.",
  ],
  faq: [
    {
      q: "Is my text sent to a server?",
      a: "No. The QR code is encoded and drawn in your browser, so the text you enter is not uploaded anywhere.",
    },
    {
      q: "Why does it say the text is too long?",
      a: "This tool supports up to about 130 bytes of text, which covers most URLs. Characters outside basic English take more than one byte each in UTF-8, so the limit is lower for them. Shorten the URL or remove tracking parameters to make it fit.",
    },
    {
      q: "Do the QR codes expire?",
      a: "No. The content is stored in the image itself, not on a server, so the code works for as long as the URL or text in it is valid.",
    },
    {
      q: "Which colours scan best?",
      a: "Dark modules on a light background with strong contrast, such as the default black on white. Many scanners cannot read light-on-dark (inverted) codes or low-contrast colour pairs, so test any custom colours with more than one phone.",
    },
  ],
  related: [
    { href: "/tools/url-encoder", label: "URL Encoder / Decoder" },
    { href: "/tools/base64", label: "Base64 Encoder / Decoder" },
    { href: "/learn/what-is-an-api", label: "Lesson: What an API is" },
  ],
};
