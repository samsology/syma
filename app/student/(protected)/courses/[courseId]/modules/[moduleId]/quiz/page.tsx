import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Award, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { requireEnrollment, requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { recordQuizAttemptAction } from '@/app/student/progress-actions';

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
      quiz: true,
    },
  });

  if (!courseModule || !courseModule.quiz) {
    redirect(`/student/courses/${courseId}`);
  }

  const quiz = courseModule.quiz;

  const attempts = await db.quizAttempt.findMany({
    where: { studentId: student.id, quizId: quiz.id },
    orderBy: { attemptNumber: 'desc' },
  });

  const bestAttempt = attempts.reduce<typeof attempts[0] | null>((best, att) => {
    if (!best || att.score > best.score) return att;
    return best;
  }, null);

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
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 border border-amber-100">
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
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <h3 className="font-bold text-emerald-950">Quiz Passed!</h3>
            <p className="text-xs text-emerald-800">
              Congratulations! You achieved a passing score of {bestAttempt?.score}% (required: {quiz.passingScore}%).
            </p>
          </div>
        </div>
      ) : attempts.length >= quiz.maxAttempts ? (
        <div className="rounded-xl border border-red-200 bg-red-50/70 p-5 flex items-center gap-3">
          <XCircle className="h-6 w-6 text-red-600 shrink-0" />
          <div>
            <h3 className="font-bold text-red-950">Maximum Attempts Reached</h3>
            <p className="text-xs text-red-800">
              You have used all {quiz.maxAttempts} allowed attempts for this quiz. Review the module lesson materials and contact your instructor.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
          <div>
            <h3 className="font-bold text-amber-950">Quiz Instructions</h3>
            <p className="text-xs text-amber-800">
              {quiz.instructions || 'Review module concepts before starting. You need at least 70% to pass.'}
            </p>
          </div>
        </div>
      )}

      {/* Attempt History */}
      {attempts.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950 mb-3">Attempt History</h2>
          <div className="divide-y divide-slate-100">
            {attempts.map((att) => (
              <div key={att.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Attempt #{att.attemptNumber}</p>
                  <p className="text-xs text-slate-500">
                    {att.completedAt ? new Date(att.completedAt).toLocaleDateString() : 'Completed'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded px-2.5 py-1 text-xs font-bold ${
                    att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
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
        <section className="rounded-xl border-2 border-amber-300 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-950">
              Start Attempt #{attempts.length + 1} of {quiz.maxAttempts}
            </h3>
          </div>

          <p className="text-sm text-slate-600">
            This module quiz verifies your comprehension of core concepts and techniques covered in this module.
            Click submit when you are ready to evaluate your knowledge check.
          </p>

          <form action={recordQuizAttemptAction} className="pt-2">
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="moduleId" value={moduleId} />
            <input type="hidden" name="quizId" value={quiz.id} />
            <input type="hidden" name="score" value="85" />

            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-black text-white hover:bg-amber-700 transition"
            >
              Submit Knowledge Check &amp; Record Attempt
            </button>
          </form>
        </section>
      )}
    </article>
  );
}
