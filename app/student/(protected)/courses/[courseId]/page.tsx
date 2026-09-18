import Link from 'next/link';
import { Presentation, Video, Award, BookOpen } from 'lucide-react';
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

  const [completedLessonProgress, completedSummaryProgress, quizAttempts, assignmentSubmissions] = await Promise.all([
    lessonIds.length
      ? db.lessonProgress.findMany({
          where: { studentId: student.id, lessonId: { in: lessonIds }, isCompleted: true },
          select: { lessonId: true },
        })
      : [],
    db.moduleSummaryProgress.findMany({
      where: { studentId: student.id, isCompleted: true },
      select: { moduleSummaryId: true },
    }),
    db.quizAttempt.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    }),
    db.assignmentSubmission.findMany({
      where: { studentId: student.id },
      select: { assignmentId: true, status: true, submittedAt: true },
    }),
  ]);

  const completedLessonIds = new Set(completedLessonProgress.map((p) => p.lessonId));
  const completedSummaryIds = new Set(completedSummaryProgress.map((p) => p.moduleSummaryId));
  const submissionMap = new Map(assignmentSubmissions.map((s) => [s.assignmentId, s]));

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

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black text-slate-950">Curriculum &amp; Learning Flow</h2>
          <p className="text-xs text-slate-500 mt-1">
            Progress through lessons, review module summaries, test mastery with quizzes, and complete weekly practical assignments.
          </p>
        </div>

        <div className="mt-6 space-y-8">
          {course.weeks.map((week) => (
            <div
              key={week.id}
              className="border-t border-slate-200 pt-6 first:border-t-0 first:pt-0"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-primary">Week {week.weekNumber}</span>
                  <h3 className="text-lg font-black text-slate-950">{week.title}</h3>
                  <p className="text-xs text-slate-500">{week.description}</p>
                </div>
              </div>

              <div className="space-y-6 pl-0 sm:pl-3">
                {week.modules.map((module, moduleIdx) => {
                  const moduleQuizAttempts = module.quiz
                    ? quizAttempts.filter((a) => a.quizId === module.quiz!.id)
                    : [];
                  const isQuizPassed = moduleQuizAttempts.some((a) => a.passed);

                  return (
                    <div key={module.id} className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400">Module {moduleIdx + 1}</span>
                          <p className="text-sm font-black text-slate-800">{module.title}</p>
                        </div>
                      </div>

                      {/* Module Lessons */}
                      <div className="grid gap-2">
                        {module.lessons.length ? (
                          module.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/student/courses/${course.id}/lessons/${lesson.id}`}
                              className="hover:border-primary hover:text-primary flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition"
                            >
                              <div className="flex items-center gap-2.5">
                                {lesson.resourceType === 'SLIDE' ? (
                                  <span className="text-indigo-600" title="Slide Lesson">
                                    <Presentation className="h-4 w-4" />
                                  </span>
                                ) : (
                                  <span className="text-sky-600" title="Video Lesson">
                                    <Video className="h-4 w-4" />
                                  </span>
                                )}
                                <span>{lesson.title}</span>
                              </div>
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
                          <p className="text-xs text-slate-500 py-1">No published lessons in this module.</p>
                        )}
                      </div>

                      {/* Module Summary */}
                      {module.summary && (
                        <Link
                          href={`/student/courses/${course.id}/modules/${module.id}/summary`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50/60 px-4 py-2.5 text-sm font-semibold text-indigo-950 hover:bg-indigo-100/60 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            {module.summary.resourceType === 'SLIDE' ? (
                              <Presentation className="h-4 w-4 text-indigo-700 shrink-0" />
                            ) : (
                              <Video className="h-4 w-4 text-indigo-700 shrink-0" />
                            )}
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 block">
                                Module Summary · {module.summary.resourceType === 'SLIDE' ? 'Slide Deck' : 'Video Explainer'}
                              </span>
                              <span className="text-xs text-indigo-950 font-bold">{module.summary.title}</span>
                            </div>
                          </div>
                          <span
                            className={
                              completedSummaryIds.has(module.summary.id)
                                ? 'text-xs font-black tracking-wide text-emerald-700 uppercase'
                                : 'text-xs font-black tracking-wide text-indigo-700 uppercase'
                            }
                          >
                            {completedSummaryIds.has(module.summary.id) ? 'Completed' : 'Review Summary'}
                          </span>
                        </Link>
                      )}

                      {/* Module Quiz */}
                      {module.quiz && (
                        <Link
                          href={`/student/courses/${course.id}/modules/${module.id}/quiz`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-2.5 text-sm font-semibold text-amber-950 hover:bg-amber-100/60 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <Award className="h-4 w-4 text-amber-700 shrink-0" />
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                                Module Quiz · Pass Mark: {module.quiz.passingScore}%
                              </span>
                              <span className="text-xs text-amber-950 font-bold">{module.quiz.title}</span>
                            </div>
                          </div>
                          <span
                            className={
                              isQuizPassed
                                ? 'text-xs font-black tracking-wide text-emerald-700 uppercase'
                                : moduleQuizAttempts.length > 0
                                ? 'text-xs font-black tracking-wide text-amber-800 uppercase'
                                : 'text-xs font-black tracking-wide text-amber-700 uppercase'
                            }
                          >
                            {isQuizPassed
                              ? 'Passed'
                              : moduleQuizAttempts.length > 0
                              ? `${moduleQuizAttempts.length}/${module.quiz.maxAttempts} Attempts`
                              : 'Take Quiz'}
                          </span>
                        </Link>
                      )}
                    </div>
                  );
                })}

                {/* Weekly Assignment */}
                {week.assignment && (
                  <Link
                    href={`/student/courses/${course.id}/weeks/${week.id}/assignment`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border-2 border-emerald-300 bg-emerald-50/70 p-4 text-sm font-semibold text-emerald-950 hover:bg-emerald-100/70 transition shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-emerald-600 p-2 text-white shrink-0 mt-0.5">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                          Weekly Practical Assignment · Capstone / Lab
                        </span>
                        <span className="font-black text-slate-950 text-sm sm:text-base">{week.assignment.title}</span>
                        <p className="text-xs text-slate-600 font-normal mt-0.5">{week.assignment.description}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span
                        className={
                          submissionMap.has(week.assignment.id)
                            ? 'inline-block rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-black text-white uppercase'
                            : 'inline-block rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-black text-white uppercase'
                        }
                      >
                        {submissionMap.has(week.assignment.id) ? 'Submitted' : 'Start Assignment'}
                      </span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
