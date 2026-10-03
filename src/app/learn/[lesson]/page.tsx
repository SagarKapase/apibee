import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { findLesson, lessons } from "@/lib/learn";
import { absoluteUrl, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { lessonContent } from "../_lessons";

export const dynamicParams = false;

export function generateStaticParams() {
  return lessons.map((l) => ({ lesson: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lesson: string }>;
}): Promise<Metadata> {
  const { lesson: slug } = await params;
  const found = findLesson(slug);
  if (!found) return {};
  return pageMetadata({
    path: `/learn/${found.lesson.slug}`,
    title: `${found.lesson.title}: API testing tutorial`,
    description: found.lesson.summary,
  });
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lesson: string }>;
}) {
  const { lesson: slug } = await params;
  const found = findLesson(slug);
  if (!found) notFound();
  const { lesson, number, previous, next } = found;
  const Body = lessonContent[lesson.slug];

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: lesson.title,
          description: lesson.summary,
          url: absoluteUrl(`/learn/${lesson.slug}`),
          proficiencyLevel: lesson.level,
          isAccessibleForFree: true,
          isPartOf: {
            "@type": "Course",
            name: "Learn API testing",
            url: absoluteUrl("/learn"),
          },
          publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        }}
      />
      <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        <Link href="/learn" className="hover:text-[var(--text)]">
          Learn
        </Link>
        <span className="mx-2" aria-hidden="true">/</span>
        {lesson.level}
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="text-[var(--accent)]">
          Lesson {number} of {lessons.length}
        </span>
      </p>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[var(--text)]">
        {lesson.title}
      </h1>
      <p className="mt-3 text-[15px] text-[var(--text-muted)] leading-relaxed">{lesson.summary}</p>

      <div className="mt-8 text-[15px] leading-7 text-[var(--text)]">
        <Body />
      </div>

      <nav aria-label="Lessons" className="mt-14 grid gap-3 sm:grid-cols-2">
        {previous ? (
          <Link href={`/learn/${previous.slug}`} className="group rounded-[9px] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors duration-150 hover:border-[var(--text-muted)]/40">
            <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Previous</span>
            <span className="mt-1 block text-sm font-semibold text-[var(--text)]">{previous.title}</span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next && (
          <Link href={`/learn/${next.slug}`} className="group rounded-[9px] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors duration-150 hover:border-[var(--text-muted)]/40 text-right">
            <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Next</span>
            <span className="mt-1 block text-sm font-semibold text-[var(--text)]">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
