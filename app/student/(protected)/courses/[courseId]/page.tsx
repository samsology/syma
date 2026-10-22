import Link from 'next/link';
import { requireEnrollment, requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { summarizeCumulativeQuizScore } from '@/lib/curriculum/quiz-progress';
import { summarizeLessonProgress } from '@/lib/student-course/progress';
import {
  buildCourseItemSequence,
  calculateDripUnlockStatus,
} from '@/lib/student-course/drip-progression';
import { WeeklyCurriculum } from '@/components/student/WeeklyCurriculum';

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

  const [
    completedLessonProgress,
    completedSummaryProgress,
    quizAttempts,
    assignmentSubmissions,
    studentOverrides,
  ] = await Promise.all([
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
      orderBy: { attemptNumber: 'desc' },
      select: { assignmentId: true, status: true, submittedAt: true },
    }),
    db.quizStudentOverride.findMany({
      where: { studentId: student.id, quizId: { in: quizIds } },
    }),
  ]);

  const completedLessonIds = new Set(completedLessonProgress.map((p) => p.lessonId));
  const completedSummaryIds = new Set(completedSummaryProgress.map((p) => p.moduleSummaryId));
  const passedQuizIds = new Set(quizAttempts.filter((a) => a.passed).map((a) => a.quizId));
  const submittedAssignmentIds = new Set(assignmentSubmissions.map((a) => a.assignmentId));
  const progressionGrantedQuizIds = new Set(
    studentOverrides.filter((o) => o.progressionGranted).map((o) => o.quizId)
  );
  const attemptedQuizIds = new Set(quizAttempts.map((a) => a.quizId));

  const overrideMap = new Map<string, (typeof studentOverrides)[number]>();
  for (const ov of studentOverrides) {
    overrideMap.set(ov.quizId, ov);
  }

  const submissionMap = new Map<string, (typeof assignmentSubmissions)[number]>();
  for (const submission of assignmentSubmissions) {
    if (!submissionMap.has(submission.assignmentId)) submissionMap.set(submission.assignmentId, submission);
  }

  // Drip Unlock Status Calculation
  const courseSequence = buildCourseItemSequence(course);
  const dripStatusMap = calculateDripUnlockStatus(courseSequence, {
    completedLessonIds,
    completedSummaryIds,
    passedQuizIds,
    submittedAssignmentIds,
    progressionGrantedQuizIds,
    attemptedQuizIds,
  });

  const progress = summarizeLessonProgress(lessonIds, completedLessonIds);
  const quizProgress = summarizeCumulativeQuizScore(quizIds, quizAttempts);

  // Convert dripStatusMap to a plain record for client-side serialization
  const dripStatusRecord: Record<
    string,
    { isUnlocked: boolean; isCompleted: boolean; isCurrent: boolean; lockReason?: string }
  > = {};
  for (const [key, value] of dripStatusMap.entries()) {
    dripStatusRecord[key] = value;
  }

  // Convert quiz best score map to a plain record
  const quizBestScores: Record<string, number> = {};
  for (const [key, value] of quizProgress.bestByQuiz.entries()) {
    quizBestScores[key] = value.score;
  }

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

        <div className="mt-6">
          <WeeklyCurriculum
            courseId={course.id}
            weeks={course.weeks}
            completedLessonIds={Array.from(completedLessonIds)}
            completedSummaryIds={Array.from(completedSummaryIds)}
            submittedAssignmentIds={Array.from(submittedAssignmentIds)}
            dripStatusRecord={dripStatusRecord}
            currentLessonId={progress.nextLessonId}
            quizAttempts={quizAttempts.map((a) => ({
              quizId: a.quizId,
              passed: a.passed,
              score: a.score,
            }))}
            quizBestScores={quizBestScores}
            quizOverrides={studentOverrides.map((o) => ({
              quizId: o.quizId,
              additionalAttempts: o.additionalAttempts,
              progressionGranted: o.progressionGranted,
            }))}
          />
        </div>
      </section>
    </div>
  );
}
