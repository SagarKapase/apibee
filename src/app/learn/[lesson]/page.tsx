import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findLesson, lessons } from "@/lib/learn";
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
  return {
    title: `${found.lesson.title}: API testing tutorial`,
    description: found.lesson.summary,
  };
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
      <p className="text-xs text-[var(--text-muted)] mb-3">
        <Link href="/learn" className="hover:text-[var(--text)]">
          Learn
        </Link>
        <span className="mx-1.5">/</span>
        {lesson.level}
        <span className="mx-1.5">/</span>
        Lesson {number} of {lessons.length}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">
        {lesson.title}
      </h1>
      <p className="mt-3 text-[var(--text-muted)] leading-relaxed">{lesson.summary}</p>

      <div className="mt-8 text-[15px] leading-7 text-[var(--text)]">
        <Body />
      </div>

      <nav className="mt-14 pt-6 border-t border-[var(--border)] grid grid-cols-2 gap-4 text-sm">
        {previous ? (
          <Link href={`/learn/${previous.slug}`} className="group">
            <span className="block text-xs text-[var(--text-muted)]">Previous</span>
            <span className="text-[var(--text)] group-hover:underline underline-offset-4">
              {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/learn/${next.slug}`} className="group text-right">
            <span className="block text-xs text-[var(--text-muted)]">Next</span>
            <span className="text-[var(--text)] group-hover:underline underline-offset-4">
              {next.title}
            </span>
          </Link>
        )}
      </nav>
    </article>
  );
}
