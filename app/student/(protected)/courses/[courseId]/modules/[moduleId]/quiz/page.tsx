import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Award, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { requireEnrollment, requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { recordQuizAttemptAction } from '@/app/student/progress-actions';
import { getBestQuizAttempt } from '@/lib/curriculum/quiz-progress';

import {
  getQuizQuestions,
  getPublicQuizQuestions,
  formatRelationalQuizQuestions,
  sanitizePublicRelationalQuestions,
} from '@/lib/curriculum/quiz-engine';

type ModuleQuizPageProps = {
  params: Promise<{ courseId: string; moduleId: string }>;
};

export default async function StudentModuleQuizPage({ params }: ModuleQuizPageProps) {
  const [{ courseId, moduleId }, student] = await Promise.all([params, requireStudent()]);
  await requireEnrollment(student.id, courseId);

  const courseModule = await db.courseModule.findFirst({
    where: { id: moduleId, week: { courseId } },
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

  const attempts = await db.quizAttempt.findMany({
    where: { studentId: student.id, quizId: quiz.id },
    orderBy: { attemptNumber: 'desc' },
  });

  const bestAttempt = getBestQuizAttempt(attempts);

  const hasPassed = attempts.some((att) => att.passed);
  const canAttempt = !hasPassed && attempts.length < quiz.maxAttempts;

  return (
    <article className="space-y-6">
      <Link
        href={`/student/courses/${courseId}`}
        className="text-primary inline-flex items-center gap-2 text-sm font-black"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Curriculum
      </Link>

      <header className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold tracking-wider text-amber-700 uppercase">
            Week {courseModule.week.weekNumber} · {courseModule.title}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            Benchmark: {quiz.passingScore}% to pass
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            Max {quiz.maxAttempts} Attempts
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-black text-slate-950">{quiz.title}</h1>
        {quiz.description && <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>}
      </header>

      {/* Status banner */}
      {hasPassed ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <h3 className="font-bold text-emerald-950">Quiz Passed!</h3>
            <p className="text-xs text-emerald-800">
              Congratulations! You achieved a passing score of {bestAttempt?.score}% (required:{' '}
              {quiz.passingScore}%).
            </p>
          </div>
        </div>
      ) : attempts.length >= quiz.maxAttempts ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/70 p-5">
          <XCircle className="h-6 w-6 shrink-0 text-red-600" />
          <div>
            <h3 className="font-bold text-red-950">Maximum Attempts Reached</h3>
            <p className="text-xs text-red-800">
              You have used all {quiz.maxAttempts} allowed attempts for this quiz. Review the module
              lesson materials and contact your instructor.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-5">
          <AlertCircle className="h-6 w-6 shrink-0 text-amber-600" />
          <div>
            <h3 className="font-bold text-amber-950">Quiz Instructions</h3>
            <p className="text-xs text-amber-800">
              {quiz.instructions ||
                'Review module concepts before starting. You need at least 70% to pass.'}
            </p>
          </div>
        </div>
      )}

      {/* Attempt History */}
      {attempts.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-slate-950">Attempt History</h2>
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
        <section className="space-y-6 rounded-xl border-2 border-amber-300 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
            <Award className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-950">
              Start Attempt #{attempts.length + 1} of {quiz.maxAttempts}
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
                Submit Knowledge Check &amp; Record Attempt
              </button>
            </div>
          </form>
        </section>
      )}
    </article>
  );
}
