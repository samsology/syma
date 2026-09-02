import Link from 'next/link';
import { requireEnrollment, requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { summarizeLessonProgress } from '@/lib/student-course/progress';

type StudentCoursePageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function StudentCoursePage({ params }: StudentCoursePageProps) {
  const [{ courseId }, student] = await Promise.all([params, requireStudent()]);
  const enrollment = await requireEnrollment(student.id, courseId);
  const course = enrollment.course;
  const lessonIds = course.weeks.flatMap((week) =>
    week.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id))
  );
  const completedProgress = lessonIds.length
    ? await db.lessonProgress.findMany({
        where: { studentId: student.id, lessonId: { in: lessonIds }, isCompleted: true },
        select: { lessonId: true },
      })
    : [];
  const completedLessonIds = new Set(completedProgress.map((progress) => progress.lessonId));
  const progress = summarizeLessonProgress(lessonIds, completedLessonIds);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-primary text-sm font-bold tracking-wide uppercase">
          {course.category} · {course.level}
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{course.title}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{course.description}</p>
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
          {progress.nextLessonId ? (
            <Link
              href={`/student/courses/${course.id}/lessons/${progress.nextLessonId}`}
              className="bg-primary mt-4 inline-flex rounded-lg px-4 py-2 text-sm font-black text-white"
            >
              Resume Lesson
            </Link>
          ) : progress.isComplete ? (
            <p className="mt-4 text-sm font-black text-emerald-700">Course completed.</p>
          ) : null}
        </div>
      </header>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Curriculum</h2>
        <div className="mt-5 space-y-6">
          {course.weeks.map((week) => (
            <div
              key={week.id}
              className="border-t border-slate-100 pt-5 first:border-t-0 first:pt-0"
            >
              <h3 className="font-black text-slate-950">
                Week {week.weekNumber}: {week.title}
              </h3>
              <div className="mt-3 space-y-4">
                {week.modules.map((module) => (
                  <div key={module.id}>
                    <p className="text-sm font-black text-slate-700">{module.title}</p>
                    <div className="mt-2 grid gap-2">
                      {module.lessons.length ? (
                        module.lessons.map((lesson) => (
                          <Link
                            key={lesson.id}
                            href={`/student/courses/${course.id}/lessons/${lesson.id}`}
                            className="hover:border-primary hover:text-primary flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                          >
                            <span>{lesson.title}</span>
                            <span
                              className={
                                completedLessonIds.has(lesson.id)
                                  ? 'text-xs font-black tracking-wide text-emerald-700 uppercase'
                                  : 'text-xs font-black tracking-wide text-slate-400 uppercase'
                              }
                            >
                              {completedLessonIds.has(lesson.id) ? 'Complete' : 'Not started'}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No published lessons yet.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
