import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Award, CheckCircle2, XCircle, AlertCircle, HelpCircle, ShieldCheck } from 'lucide-react';
import { requireEnrollment, requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { recordQuizAttemptAction, requestAdditionalQuizAttemptAction } from '@/app/student/progress-actions';
import { getBestQuizAttempt } from '@/lib/curriculum/quiz-progress';

import {
  getQuizQuestions,
  getPublicQuizQuestions,
  formatRelationalQuizQuestions,
  sanitizePublicRelationalQuestions,
} from '@/lib/curriculum/quiz-engine';

type ModuleQuizPageProps = {
  params: Promise<{ courseId: string; moduleId: string }>;
  searchParams?: Promise<{ requested?: string }>;
};

export default async function StudentModuleQuizPage({ params, searchParams }: ModuleQuizPageProps) {
  const [{ courseId, moduleId }, search, student] = await Promise.all([
    params,
    searchParams ? searchParams : Promise.resolve({ requested: undefined }),
    requireStudent(),
  ]);
  const enrollment = await requireEnrollment(student.id, courseId);

  const courseModule = await db.courseModule.findFirst({
    where: {
      id: moduleId,
      week: {
        OR: [
          { courseId },
          { course: { id: courseId } },
          { course: { slug: courseId } },
        ],
      },
    },
    include: {
      week: true,
      quiz: {
        include: {
          questions: {
            include: { options: true },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!courseModule || !courseModule.quiz || courseModule.quiz.status !== 'PUBLISHED') {
    redirect(`/student/courses/${courseId}`);
  }

  const [
    completedLessonProgress,
    completedSummaryProgress,
    passedAttempts,
    assignmentSubmissions,
    studentOverrides,
    override,
    attempts,
  ] = await Promise.all([
    db.lessonProgress.findMany({
      where: { studentId: student.id, isCompleted: true },
      select: { lessonId: true },
    }),
    db.moduleSummaryProgress.findMany({
      where: { studentId: student.id, isCompleted: true },
      select: { moduleSummaryId: true },
    }),
    db.quizAttempt.findMany({
      where: { studentId: student.id, passed: true },
      select: { quizId: true },
    }),
    db.assignmentSubmission.findMany({
      where: { studentId: student.id },
      select: { assignmentId: true },
    }),
    db.quizStudentOverride.findMany({
      where: { studentId: student.id, progressionGranted: true },
      select: { quizId: true },
    }),
    db.quizStudentOverride.findUnique({
      where: { quizId_studentId: { quizId: courseModule.quiz.id, studentId: student.id } },
    }),
    db.quizAttempt.findMany({
      where: { studentId: student.id, quizId: courseModule.quiz.id },
      orderBy: { attemptNumber: 'desc' },
    }),
  ]);

  const { isItemUnlocked } = await import('@/lib/student-course/drip-progression');
  const unlocked = isItemUnlocked(enrollment.course, courseModule.quiz.id, {
    completedLessonIds: completedLessonProgress.map((p) => p.lessonId),
    completedSummaryIds: completedSummaryProgress.map((p) => p.moduleSummaryId),
    passedQuizIds: passedAttempts.map((a) => a.quizId),
    submittedAssignmentIds: assignmentSubmissions.map((a) => a.assignmentId),
    progressionGrantedQuizIds: studentOverrides.map((o) => o.quizId),
  });

  if (!unlocked) {
    redirect(`/student/courses/${courseId}`);
  }

  const quiz = courseModule.quiz;
  const isRelational = quiz.questions && quiz.questions.length > 0;

  const publicRelationalQuestions = isRelational
    ? sanitizePublicRelationalQuestions(
        formatRelationalQuizQuestions(quiz.questions, {
          randomizeQuestions: quiz.randomizeQuestions,
          randomizeOptions: quiz.randomizeOptions,
        })
      )
    : [];

  const legacyQuestions = !isRelational ? getQuizQuestions(quiz) : [];
  const publicLegacyQuestions = !isRelational ? getPublicQuizQuestions(legacyQuestions) : [];

  const bestAttempt = getBestQuizAttempt(attempts);
  const hasPassed = attempts.some((att) => att.passed);

  const isUnlimited = quiz.attemptPolicy === 'UNLIMITED';
  const additionalAttempts = override?.additionalAttempts ?? 0;
  const maxAllowedAttempts = quiz.maxAttempts + additionalAttempts;
  const attemptsUsed = attempts.length;
  const attemptsRemaining = isUnlimited
    ? 'Unlimited'
    : Math.max(0, maxAllowedAttempts - attemptsUsed);

  const canAttempt = !hasPassed && (isUnlimited || attemptsUsed < maxAllowedAttempts);
  const isExhausted = !hasPassed && !isUnlimited && attemptsUsed >= maxAllowedAttempts;
  const progressionGranted = Boolean(override?.progressionGranted);

  return (
    <article className="space-y-6">
      <Link
        href={`/student/courses/${courseId}`}
        className="text-primary inline-flex items-center gap-2 text-sm font-black"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Curriculum
      </Link>

      <header className="rounded-xl border border-amber-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold tracking-wider text-amber-700 uppercase">
            Week {courseModule.week.weekNumber} · {courseModule.title}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            Pass mark: {quiz.passingScore}%
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {isUnlimited ? 'Unlimited attempts' : `Max attempts: ${maxAllowedAttempts}`}
          </span>
          <span className="rounded-full bg-amber-100/70 px-3 py-1 text-xs font-bold text-amber-900">
            Attempts used: {attemptsUsed}
            {!isUnlimited ? `/${maxAllowedAttempts}` : ''}
          </span>
          {bestAttempt && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              Best score: {bestAttempt.score}%
            </span>
          )}
        </div>

        <h1 className="mt-3 text-2xl sm:text-3xl font-black text-slate-950">{quiz.title}</h1>
        {quiz.description && <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>}
      </header>

      {/* Progression granted banner */}
      {progressionGranted && !hasPassed && (
        <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/70 p-5">
          <ShieldCheck className="h-6 w-6 shrink-0 text-indigo-600" />
          <div>
            <h3 className="font-bold text-indigo-950">Progression Granted by Instructor</h3>
            <p className="text-xs text-indigo-800">
              An instructor has authorized your progression to the next module. You can also continue
              retrying this quiz if attempts are available.
            </p>
          </div>
        </div>
      )}

      {/* Status banner */}
      {hasPassed ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <h3 className="font-bold text-emerald-950">Quiz Passed!</h3>
            <p className="text-xs text-emerald-800">
              Congratulations! You achieved a passing score of {bestAttempt?.score}% (required:{' '}
              {quiz.passingScore}%). Subsequent module content is unlocked.
            </p>
          </div>
        </div>
      ) : isExhausted ? (
        <div className="space-y-4 rounded-xl border border-red-200 bg-red-50/70 p-5">
          <div className="flex items-start gap-3">
            <XCircle className="h-6 w-6 shrink-0 text-red-600 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-red-950">Maximum Attempts Reached</h3>
              <p className="text-xs text-red-800">
                You have used all {maxAllowedAttempts} allowed attempts for this quiz. Best score:{' '}
                {bestAttempt ? `${bestAttempt.score}%` : 'N/A'} (required: {quiz.passingScore}%).
                {quiz.allowLearningAfterExhausted
                  ? ' You can continue to review earlier lesson slides and videos in this module.'
                  : ''}
              </p>
            </div>
          </div>

          {/* Request Additional Attempt flow */}
          {quiz.allowAttemptRequests && (
            <div className="mt-3 border-t border-red-200/80 pt-4">
              {override?.isRequestPending || search.requested === 'true' ? (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 font-medium">
                  <strong>Attempt Request Submitted:</strong> Your request for an additional attempt is
                  pending administrator / instructor review.
                </div>
              ) : (
                <form action={requestAdditionalQuizAttemptAction} className="space-y-3">
                  <input type="hidden" name="courseId" value={courseId} />
                  <input type="hidden" name="moduleId" value={moduleId} />
                  <input type="hidden" name="quizId" value={quiz.id} />
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Request Additional Attempt
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5">
                      Need another attempt to demonstrate mastery? Submit a note to your instructor.
                    </p>
                    <input
                      name="note"
                      type="text"
                      placeholder="e.g. Reviewed lecture slides and prepared to retake..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
                  >
                    <HelpCircle className="h-3.5 w-3.5" /> Request Additional Attempt
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      ) : attemptsUsed > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-5">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-amber-600" />
            <div>
              <h3 className="font-bold text-amber-950">Retry Available</h3>
              <p className="text-xs text-amber-800">
                You have used {attemptsUsed} attempt{attemptsUsed !== 1 ? 's' : ''}. Attempts
                remaining: <strong>{attemptsRemaining}</strong>. Score required to pass:{' '}
                {quiz.passingScore}%.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-5">
          <AlertCircle className="h-6 w-6 shrink-0 text-amber-600" />
          <div>
            <h3 className="font-bold text-amber-950">Quiz Instructions</h3>
            <p className="text-xs text-amber-800">
              {quiz.instructions ||
                'Review module concepts before starting. A passing score of at least 70% is required.'}
            </p>
          </div>
        </div>
      )}

      {/* Attempt History */}
      {attempts.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="mb-3 text-base sm:text-lg font-bold text-slate-950">Attempt History</h2>
          <div className="divide-y divide-slate-100">
            {attempts.map((att) => (
              <div key={att.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">Attempt #{att.attemptNumber}</p>
                  <p className="text-xs text-slate-500">
                    {att.completedAt ? new Date(att.completedAt).toLocaleDateString() : 'Completed'}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded px-2.5 py-1 text-xs font-bold ${
                      att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {att.score}% · {att.passed ? 'PASSED' : 'NOT PASSED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quiz Attempt Form (when eligible) */}
      {canAttempt && (
        <section className="space-y-6 rounded-xl border-2 border-amber-300 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
            <Award className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-950">
              Start Attempt #{attemptsUsed + 1}{' '}
              {isUnlimited ? '(Unlimited Attempts)' : `of ${maxAllowedAttempts}`}
            </h3>
          </div>

          <p className="text-sm text-slate-600">
            Answer each question below. When submitted, your assessment will be scored automatically
            on the server. A minimum score of <strong>{quiz.passingScore}%</strong> is required to
            pass.
          </p>

          <form action={recordQuizAttemptAction} className="space-y-6 pt-2">
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="moduleId" value={moduleId} />
            <input type="hidden" name="quizId" value={quiz.id} />

            <div className="space-y-5">
              {isRelational
                ? publicRelationalQuestions.map((q, idx) => (
                    <fieldset
                      key={q.id}
                      className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4"
                    >
                      <legend className="px-1 text-sm font-bold text-slate-900">
                        Question {idx + 1}: {q.questionText}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          ({q.points} pt{q.points !== 1 ? 's' : ''})
                        </span>
                      </legend>
                      {q.hint && (
                        <p className="px-1 text-xs text-slate-500 italic">Hint: {q.hint}</p>
                      )}
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt) => (
                          <label
                            key={opt.id}
                            className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-white p-2.5 text-sm text-slate-800 transition hover:border-amber-300 hover:bg-amber-50/40"
                          >
                            <input
                              type="radio"
                              name={`question_${q.id}`}
                              value={opt.id}
                              required
                              className="mt-0.5 text-amber-600 focus:ring-amber-500"
                            />
                            <span>{opt.optionText}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ))
                : publicLegacyQuestions.map((q, idx) => (
                    <fieldset
                      key={q.id}
                      className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4"
                    >
                      <legend className="px-1 text-sm font-bold text-slate-900">
                        Question {idx + 1}: {q.question}
                      </legend>
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIdx) => (
                          <label
                            key={optIdx}
                            className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-white p-2.5 text-sm text-slate-800 transition hover:border-amber-300 hover:bg-amber-50/40"
                          >
                            <input
                              type="radio"
                              name={`question_${q.id}`}
                              value={optIdx}
                              required
                              className="mt-0.5 text-amber-600 focus:ring-amber-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ))}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="rounded-lg bg-amber-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-amber-700"
              >
                {attemptsUsed > 0 ? 'Retry Knowledge Check & Record Attempt' : 'Submit Knowledge Check & Record Attempt'}
              </button>
            </div>
          </form>
        </section>
      )}
    </article>
  );
}
