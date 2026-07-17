"use client";

const quotes = [
  {
    text: "Needed a working API for a take-home interview. This was returning data before I finished reading the docs.",
    name: "Priya S.",
    role: "Frontend developer",
    context: "job hunting",
  },
  {
    text: "I teach 30 students who can barely spell fetch(). Pointed them here and for once nobody asked 'where do I get an API from.'",
    name: "Jake M.",
    role: "Bootcamp instructor",
    context: "teaching React",
  },
  {
    text: "The XML endpoints. Finally. I was this close to writing my own mock server because nobody else does XML anymore.",
    name: "Riya K.",
    role: "QA engineer",
    context: "testing a SOAP wrapper",
  },
  {
    text: "Used the JWT auth to test my Axios interceptor. Worked first try. I don't trust things that work first try but here we are.",
    name: "Sam O.",
    role: "Full-stack dev",
    context: "building auth middleware",
  },
  {
    text: "My professor said 'find a free API.' Spent two hours signing up for ones that wanted a credit card. Then found this.",
    name: "Lin C.",
    role: "CS student",
    context: "university project",
  },
  {
    text: "Replaced a 200-line Express mock server with a URL. The codebase thanks me.",
    name: "Marcelo D.",
    role: "Backend developer",
    context: "cleaning up test fixtures",
  },
];

function Card({ q }: { q: (typeof quotes)[number] }) {
  return (
    <div className="w-[300px] shrink-0 border border-[var(--border)] rounded-xl p-5 bg-[var(--bg)] flex flex-col select-none hover-lift hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--ring)]">
      {/* Context tag */}
      <span className="text-[10px] font-mono text-[var(--accent)] mb-3 opacity-70">
        // {q.context}
      </span>
      {/* Quote */}
      <p className="text-[13px] text-[var(--text)] leading-relaxed flex-1 mb-4">
        {q.text}
      </p>
      {/* Author */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
        <div className="w-6 h-6 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[9px] font-bold text-[var(--accent)]">
          {q.name[0]}
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--text)] leading-tight">
            {q.name}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] leading-tight">
            {q.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const doubled = [...quotes, ...quotes];

  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 pt-14 pb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-1">
          Developers seem to like it
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Or at least they stopped complaining about mock servers.
        </p>
      </div>

      {/* Marquee */}
      <div className="relative pb-14 group/marquee">
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[var(--surface)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--surface)] to-transparent z-10 pointer-events-none" />

        {/* Track */}
        <div
          className="flex gap-4 w-max group-hover/marquee:[animation-play-state:paused]"
          style={{ animation: "marquee 45s linear infinite" }}
        >
          {doubled.map((q, i) => (
            <Card key={`${q.name}-${i}`} q={q} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
