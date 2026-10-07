import Link from 'next/link';
import { Presentation, Video, Award, BookOpen, Lock } from 'lucide-react';
import { requireEnrollment, requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { summarizeCumulativeQuizScore } from '@/lib/curriculum/quiz-progress';
import { summarizeLessonProgress } from '@/lib/student-course/progress';
import {
  buildCourseItemSequence,
  calculateDripUnlockStatus,
} from '@/lib/student-course/drip-progression';

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
  const quizIds = course.weeks.flatMap((week) =>
    week.modules
      .map((module) => module.quiz)
      .filter((quiz): quiz is NonNullable<typeof quiz> => !!quiz && quiz.status === 'PUBLISHED')
      .map((quiz) => quiz.id)
  );

  const [completedLessonProgress, completedSummaryProgress, quizAttempts, assignmentSubmissions] =
    await Promise.all([
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
        where: { studentId: student.id, quizId: { in: quizIds } },
        orderBy: { createdAt: 'desc' },
      }),
      db.assignmentSubmission.findMany({
        where: { studentId: student.id },
        select: { assignmentId: true, status: true, submittedAt: true },
      }),
    ]);

  const completedLessonIds = new Set(completedLessonProgress.map((p) => p.lessonId));
  const completedSummaryIds = new Set(completedSummaryProgress.map((p) => p.moduleSummaryId));
  const passedQuizIds = new Set(quizAttempts.filter((a) => a.passed).map((a) => a.quizId));
  const submittedAssignmentIds = new Set(assignmentSubmissions.map((a) => a.assignmentId));

  const submissionMap = new Map(assignmentSubmissions.map((s) => [s.assignmentId, s]));

  // Drip Unlock Status Calculation
  const courseSequence = buildCourseItemSequence(course);
  const dripStatusMap = calculateDripUnlockStatus(courseSequence, {
    completedLessonIds,
    completedSummaryIds,
    passedQuizIds,
    submittedAssignmentIds,
  });

  const progress = summarizeLessonProgress(lessonIds, completedLessonIds);
  const quizProgress = summarizeCumulativeQuizScore(quizIds, quizAttempts);

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
        {quizProgress.totalQuizzes > 0 && (
          <div className="mt-5 grid max-w-3xl gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3">
              <p className="text-[10px] font-black tracking-wider text-amber-800 uppercase">
                Cumulative Quiz Score
              </p>
              <p className="mt-1 text-2xl font-black text-amber-950">
                {quizProgress.cumulativeScore}%
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-[10px] font-black tracking-wider text-slate-500 uppercase">
                Quizzes Attempted
              </p>
              <p className="mt-1 text-2xl font-black text-slate-950">
                {quizProgress.attemptedQuizzes}/{quizProgress.totalQuizzes}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3">
              <p className="text-[10px] font-black tracking-wider text-emerald-800 uppercase">
                Quizzes Passed
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-950">
                {quizProgress.passedQuizzes}/{quizProgress.totalQuizzes}
              </p>
            </div>
          </div>
        )}
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black text-slate-950">Curriculum &amp; Learning Flow</h2>
          <p className="mt-1 text-xs text-slate-500">
            Sequential learning path: Lessons unlock automatically as you complete previous topics, review summaries, pass quizzes, and submit assignments.
          </p>
        </div>

        <div className="mt-6 space-y-8">
          {course.weeks.map((week) => (
            <div
              key={week.id}
              className="border-t border-slate-200 pt-6 first:border-t-0 first:pt-0"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-primary text-xs font-black tracking-wider uppercase">
                    Week {week.weekNumber}
                  </span>
                  <h3 className="text-lg font-black text-slate-950">{week.title}</h3>
                  <p className="text-xs text-slate-500">{week.description}</p>
                </div>
              </div>

              <div className="space-y-6 pl-0 sm:pl-3">
                {week.modules.map((module, moduleIdx) => {
                  const visibleQuiz = module.quiz?.status === 'PUBLISHED' ? module.quiz : null;
                  const moduleQuizAttempts = visibleQuiz
                    ? quizAttempts.filter((a) => a.quizId === visibleQuiz.id)
                    : [];
                  const isQuizPassed = moduleQuizAttempts.some((a) => a.passed);
                  const bestQuizAttempt = visibleQuiz
                    ? quizProgress.bestByQuiz.get(visibleQuiz.id)
                    : null;

                  return (
                    <div
                      key={module.id}
                      className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/40 p-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Module {moduleIdx + 1}
                          </span>
                          <p className="text-sm font-black text-slate-800">{module.title}</p>
                        </div>
                      </div>

                      {/* Module Lessons */}
                      <div className="grid gap-2">
                        {module.lessons.length ? (
                          module.lessons.map((lesson) => {
                            const lessonStatus = dripStatusMap.get(lesson.id) ?? {
                              isUnlocked: false,
                              isCompleted: false,
                              isCurrent: false,
                            };

                            if (!lessonStatus.isUnlocked) {
                              return (
                                <div
                                  key={lesson.id}
                                  title={lessonStatus.lockReason || 'Complete previous lesson to unlock'}
                                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-100/70 px-4 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed opacity-75"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span>{lesson.title}</span>
                                  </div>
                                  <span className="inline-flex items-center gap-1 rounded bg-slate-200 px-2 py-0.5 text-[10px] font-black tracking-wide text-slate-600 uppercase">
                                    Locked
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <Link
                                key={lesson.id}
                                href={`/student/courses/${course.id}/lessons/${lesson.id}`}
                                className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                                  lessonStatus.isCurrent
                                    ? 'border-primary/50 bg-primary/5 text-primary shadow-xs'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary'
                                }`}
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
                                      : lessonStatus.isCurrent
                                        ? 'text-xs font-black tracking-wide text-primary uppercase'
                                        : 'text-xs font-black tracking-wide text-slate-400 uppercase'
                                  }
                                >
                                  {completedLessonIds.has(lesson.id)
                                    ? 'Complete'
                                    : lessonStatus.isCurrent
                                      ? 'Up Next'
                                      : 'Unlocked'}
                                </span>
                              </Link>
                            );
                          })
                        ) : (
                          <p className="py-1 text-xs text-slate-500">
                            No published lessons in this module.
                          </p>
                        )}
                      </div>

                      {/* Module Summary */}
                      {module.summary && (() => {
                        const summaryStatus = dripStatusMap.get(module.summary.id) ?? {
                          isUnlocked: false,
                          isCompleted: false,
                          isCurrent: false,
                        };

                        if (!summaryStatus.isUnlocked) {
                          return (
                            <div
                              title={summaryStatus.lockReason || 'Complete module lessons to unlock'}
                              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-100/70 px-4 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed opacity-75"
                            >
                              <div className="flex items-center gap-2.5">
                                <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                                <div>
                                  <span className="block text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                    Module Summary
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">
                                    {module.summary.title}
                                  </span>
                                </div>
                              </div>
                              <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-black tracking-wide text-slate-600 uppercase">
                                Locked
                              </span>
                            </div>
                          );
                        }

                        return (
                          <Link
                            href={`/student/courses/${course.id}/modules/${module.id}/summary`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50/60 px-4 py-2.5 text-sm font-semibold text-indigo-950 transition hover:bg-indigo-100/60"
                          >
                            <div className="flex items-center gap-2.5">
                              {module.summary.resourceType === 'SLIDE' ? (
                                <Presentation className="h-4 w-4 shrink-0 text-indigo-700" />
                              ) : (
                                <Video className="h-4 w-4 shrink-0 text-indigo-700" />
                              )}
                              <div>
                                <span className="block text-[10px] font-black tracking-wider text-indigo-800 uppercase">
                                  Module Summary ·{' '}
                                  {module.summary.resourceType === 'SLIDE'
                                    ? 'Slide Deck'
                                    : 'Video Explainer'}
                                </span>
                                <span className="text-xs font-bold text-indigo-950">
                                  {module.summary.title}
                                </span>
                              </div>
                            </div>
                            <span
                              className={
                                completedSummaryIds.has(module.summary.id)
                                  ? 'text-xs font-black tracking-wide text-emerald-700 uppercase'
                                  : 'text-xs font-black tracking-wide text-indigo-700 uppercase'
                              }
                            >
                              {completedSummaryIds.has(module.summary.id)
                                ? 'Completed'
                                : 'Review Summary'}
                            </span>
                          </Link>
                        );
                      })()}

                      {/* Module Quiz */}
                      {visibleQuiz && (() => {
                        const quizStatus = dripStatusMap.get(visibleQuiz.id) ?? {
                          isUnlocked: false,
                          isCompleted: false,
                          isCurrent: false,
                        };

                        if (!quizStatus.isUnlocked) {
                          return (
                            <div
                              title={quizStatus.lockReason || 'Complete module content to unlock quiz'}
                              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-100/70 px-4 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed opacity-75"
                            >
                              <div className="flex items-center gap-2.5">
                                <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                                <div>
                                  <span className="block text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                    Module Quiz · Pass Mark: {visibleQuiz.passingScore}%
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">
                                    {visibleQuiz.title}
                                  </span>
                                </div>
                              </div>
                              <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-black tracking-wide text-slate-600 uppercase">
                                Locked
                              </span>
                            </div>
                          );
                        }

                        return (
                          <Link
                            href={`/student/courses/${course.id}/modules/${module.id}/quiz`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-2.5 text-sm font-semibold text-amber-950 transition hover:bg-amber-100/60"
                          >
                            <div className="flex items-center gap-2.5">
                              <Award className="h-4 w-4 shrink-0 text-amber-700" />
                              <div>
                                <span className="block text-[10px] font-black tracking-wider text-amber-800 uppercase">
                                  Module Quiz · Pass Mark: {visibleQuiz.passingScore}%
                                </span>
                                <span className="text-xs font-bold text-amber-950">
                                  {visibleQuiz.title}
                                </span>
                                {bestQuizAttempt && (
                                  <span className="mt-0.5 block text-[11px] font-bold text-amber-800">
                                    Best score: {bestQuizAttempt.score}%
                                  </span>
                                )}
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
                                  ? `${moduleQuizAttempts.length}/${visibleQuiz.maxAttempts} Attempts`
                                  : 'Take Quiz'}
                            </span>
                          </Link>
                        );
                      })()}
                    </div>
                  );
                })}

                {/* Weekly Assignment */}
                {week.assignment && (() => {
                  const assignmentStatus = dripStatusMap.get(week.assignment.id) ?? {
                    isUnlocked: false,
                    isCompleted: false,
                    isCurrent: false,
                  };

                  if (!assignmentStatus.isUnlocked) {
                    return (
                      <div
                        title={assignmentStatus.lockReason || 'Complete module quiz to unlock assignment'}
                        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-100/70 p-4 text-sm font-semibold text-slate-400 opacity-75 cursor-not-allowed sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0 rounded-lg bg-slate-300 p-2 text-slate-600">
                            <Lock className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="block text-[10px] font-black tracking-wider text-slate-400 uppercase">
                              Weekly Practical Assignment · Locked
                            </span>
                            <span className="text-sm font-black text-slate-500 sm:text-base">
                              {week.assignment.title}
                            </span>
                            <p className="mt-0.5 text-xs font-normal text-slate-400">
                              {week.assignment.description}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className="inline-block rounded-md bg-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 uppercase">
                            Locked
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      href={`/student/courses/${course.id}/weeks/${week.id}/assignment`}
                      className="flex flex-col gap-3 rounded-xl border-2 border-emerald-300 bg-emerald-50/70 p-4 text-sm font-semibold text-emerald-950 shadow-2xs transition hover:bg-emerald-100/70 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0 rounded-lg bg-emerald-600 p-2 text-white">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="block text-[10px] font-black tracking-wider text-emerald-800 uppercase">
                            Weekly Practical Assignment · Capstone / Lab
                          </span>
                          <span className="text-sm font-black text-slate-950 sm:text-base">
                            {week.assignment.title}
                          </span>
                          <p className="mt-0.5 text-xs font-normal text-slate-600">
                            {week.assignment.description}
                          </p>
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
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
