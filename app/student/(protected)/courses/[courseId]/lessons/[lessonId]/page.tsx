import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { requireStudent } from '@/lib/auth/student-authorization';
import { getStudentLesson } from '@/lib/student-course/queries';
import { setLessonProgressAction } from '@/app/student/progress-actions';

type StudentLessonPageProps = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

export default async function StudentLessonPage({ params }: StudentLessonPageProps) {
  const [{ courseId, lessonId }, student] = await Promise.all([params, requireStudent()]);
  const result = await getStudentLesson(student.id, courseId, lessonId);

  if (!result) redirect(`/student/courses/${courseId}`);

  const { enrollment, lesson, previousLesson, nextLesson, isCompleted, progress } = result;

  return (
    <article className="space-y-6">
      <Link
        href={`/student/courses/${courseId}`}
        className="text-primary inline-flex items-center gap-2 text-sm font-black"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Curriculum
      </Link>
      <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-primary text-sm font-bold tracking-wide uppercase">
          {enrollment.course.title} · Week {lesson.weekNumber} · {lesson.moduleTitle}
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{lesson.title}</h1>
        <div className="mt-5 max-w-xl">
          <div className="flex items-center justify-between text-xs font-black tracking-wide text-slate-500 uppercase">
            <span>{progress.percentage}% complete</span>
            <span>
              {progress.completedLessons}/{progress.totalLessons} lessons
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </header>
      <section className="rounded-lg border border-slate-200 bg-white p-6 leading-7 text-slate-700 shadow-sm">
        <div className="whitespace-pre-wrap">{lesson.content}</div>
        {lesson.videoUrl ? (
          <a className="text-primary mt-6 inline-flex font-black" href={lesson.videoUrl}>
            Open lesson video
          </a>
        ) : null}
      </section>
      <form
        action={setLessonProgressAction}
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="lessonId" value={lessonId} />
        <input type="hidden" name="isCompleted" value={isCompleted ? 'false' : 'true'} />
        <button
          className={
            isCompleted
              ? 'hover:border-primary hover:text-primary rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-slate-700'
              : 'bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-black text-white'
          }
        >
          {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
        </button>
      </form>
      <nav
        className="flex flex-col gap-3 sm:flex-row sm:justify-between"
        aria-label="Lesson navigation"
      >
        {previousLesson ? (
          <Link
            href={`/student/courses/${courseId}/lessons/${previousLesson.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Previous Lesson
          </Link>
        ) : (
          <span />
        )}
        {nextLesson ? (
          <Link
            href={`/student/courses/${courseId}/lessons/${nextLesson.id}`}
            className="bg-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black text-white"
          >
            Next Lesson
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
