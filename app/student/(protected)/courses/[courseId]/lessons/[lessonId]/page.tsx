import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { requireStudent } from '@/lib/auth/student-authorization';
import { getStudentLesson } from '@/lib/student-course/queries';

type StudentLessonPageProps = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

export default async function StudentLessonPage({ params }: StudentLessonPageProps) {
  const [{ courseId, lessonId }, student] = await Promise.all([params, requireStudent()]);
  const result = await getStudentLesson(student.id, courseId, lessonId);

  if (!result) redirect(`/student/courses/${courseId}`);

  const { enrollment, lesson, previousLesson, nextLesson } = result;

  return (
    <article className="space-y-6">
      <Link href={`/student/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm font-black text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Curriculum
      </Link>
      <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          {enrollment.course.title} · Week {lesson.weekNumber} · {lesson.moduleTitle}
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{lesson.title}</h1>
      </header>
      <section className="rounded-lg border border-slate-200 bg-white p-6 leading-7 text-slate-700 shadow-sm">
        <div className="whitespace-pre-wrap">{lesson.content}</div>
        {lesson.videoUrl ? <a className="mt-6 inline-flex font-black text-primary" href={lesson.videoUrl}>Open lesson video</a> : null}
      </section>
      <nav className="flex flex-col gap-3 sm:flex-row sm:justify-between" aria-label="Lesson navigation">
        {previousLesson ? (
          <Link href={`/student/courses/${courseId}/lessons/${previousLesson.id}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Previous Lesson
          </Link>
        ) : <span />}
        {nextLesson ? (
          <Link href={`/student/courses/${courseId}/lessons/${nextLesson.id}`} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-black text-white">
            Next Lesson
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
