import type { ToolGuide } from "./types";

export const guide: ToolGuide = {
  aboutTitle: "What is a Unix timestamp?",
  about: [
    "A Unix timestamp is the number of seconds that have passed since 00:00:00 UTC on 1 January 1970, a moment known as the Unix epoch. `0` is the epoch itself, `1700000000` is 14 November 2023, and negative numbers are dates before 1970.",
    "Timestamps are popular because they are a single number with no time zone attached. Two systems on opposite sides of the world agree on what `1721234567` means, and comparing or sorting times is just comparing numbers. Converting to a local date and time only happens when a person needs to read it.",
    "You meet them all over APIs. JWTs store expiry and issue times in the `exp` and `iat` claims as seconds. Rate limit headers often give the reset time as a timestamp. Webhooks, logs and database records use them for creation and update times. Many APIs return ISO 8601 strings such as `2024-07-17T16:42:47Z` instead, so you often need to convert between the two.",
    "Watch the unit. Unix tools and most backends use seconds, but JavaScript's `Date.now()` and many Java and JavaScript APIs use milliseconds. A seconds value has 10 digits for current dates, a milliseconds value has 13. Reading one as the other gives a date in 1970 or tens of thousands of years in the future.",
  ],
  steps: [
    "The Current Time panel shows the current Unix timestamp in seconds, updated every second, with your local date and time below it. Use Copy to copy it.",
    "To read a timestamp, paste it into the Timestamp → Date panel. Turn on `ms` if the value is in milliseconds, or click Now to fill in the current time.",
    "Read the result as ISO 8601, UTC, your local time and a relative time such as \"3 days ago\". Each row has its own copy button.",
    "To create a timestamp, fill in Year, Month and Day in the Date → Timestamp panel, and optionally Hour, Minute and Second. Turn on UTC to treat the date as UTC instead of your local time zone.",
    "Copy the result in seconds or milliseconds.",
  ],
  faq: [
    {
      q: "How do I know if a timestamp is in seconds or milliseconds?",
      a: "Count the digits. Dates between 2001 and 2286 have 10 digits in seconds and 13 in milliseconds. If converting gives a date around January 1970, the value is probably milliseconds read as seconds; turn on `ms`.",
    },
    {
      q: "Do Unix timestamps have a time zone?",
      a: "No. A timestamp always counts from the epoch in UTC, so it identifies the same instant everywhere. Time zones only matter when you turn it into a date and time on a clock, which is why this tool shows UTC and local time separately.",
    },
    {
      q: "Why does the Date → Timestamp result change when I toggle UTC?",
      a: "With UTC off, the date and time you enter are read in your browser's time zone. With UTC on, they are read as UTC. The same wall-clock time in two time zones is two different instants, so the timestamps differ by your UTC offset.",
    },
    {
      q: "What is the year 2038 problem?",
      a: "Systems that store timestamps as signed 32-bit integers can only count up to `2147483647`, which is 03:14:07 UTC on 19 January 2038. After that the value overflows. Modern systems use 64-bit integers, which avoids the problem.",
    },
    {
      q: "How do I check when a JWT expires?",
      a: "Decode the token and copy the `exp` claim, which is in seconds, into the Timestamp → Date panel. The relative time tells you whether it has already expired.",
    },
  ],
  related: [
    { href: "/tools/jwt-decoder", label: "JWT Decoder" },
    { href: "/learn/headers-caching-cookies", label: "Lesson: Headers, caching and cookies" },
    { href: "/docs/rate-limit", label: "API docs: Rate limit" },
    { href: "/docs/jwt", label: "API docs: JWT" },
  ],
};
