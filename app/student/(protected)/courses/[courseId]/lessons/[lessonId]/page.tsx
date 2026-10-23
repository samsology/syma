import { redirect } from 'next/navigation';
import { requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { getStudentLesson } from '@/lib/student-course/queries';
import { setLessonProgressAction } from '@/app/student/progress-actions';
import {
  buildCourseItemSequence,
  calculateDripUnlockStatus,
  isItemUnlocked,
} from '@/lib/student-course/drip-progression';
import { summarizeCumulativeQuizScore } from '@/lib/curriculum/quiz-progress';
import { LessonWorkspace } from '@/components/student/LessonWorkspace';
import type { ItemDripStatus } from '@/components/student/WeeklyCurriculum';

type StudentLessonPageProps = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

export default async function StudentLessonPage({ params }: StudentLessonPageProps) {
  const [{ courseId, lessonId }, student] = await Promise.all([params, requireStudent()]);
  const result = await getStudentLesson(student.id, courseId, lessonId);

  if (!result) redirect(`/student/courses/${courseId}`);

  const { enrollment, lesson, previousLesson, nextLesson, isCompleted, progress } = result;

  const [
    completedLessonProgress,
    completedSummaryProgress,
    passedAttempts,
    assignmentSubmissions,
    studentOverrides,
    allQuizAttempts,
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
      select: { quizId: true, additionalAttempts: true, progressionGranted: true },
    }),
    db.quizAttempt.findMany({
      where: { studentId: student.id },
      select: { quizId: true, passed: true, score: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const completedLessonIds = new Set(completedLessonProgress.map((p) => p.lessonId));
  const completedSummaryIds = new Set(completedSummaryProgress.map((p) => p.moduleSummaryId));
  const passedQuizIds = new Set(passedAttempts.map((a) => a.quizId));
  const submittedAssignmentIds = new Set(assignmentSubmissions.map((a) => a.assignmentId));
  const progressionGrantedQuizIds = new Set(studentOverrides.map((o) => o.quizId));
  const attemptedQuizIds = new Set(allQuizAttempts.map((a) => a.quizId));

  // Check if current lesson is unlocked by drip progression
  const unlocked = isItemUnlocked(enrollment.course, lessonId, {
    completedLessonIds: Array.from(completedLessonIds),
    completedSummaryIds: Array.from(completedSummaryIds),
    passedQuizIds: Array.from(passedQuizIds),
    submittedAssignmentIds: Array.from(submittedAssignmentIds),
    progressionGrantedQuizIds: Array.from(progressionGrantedQuizIds),
    attemptedQuizIds: Array.from(attemptedQuizIds),
  });

  if (!unlocked) {
    redirect(`/student/courses/${courseId}`);
  }

  // Calculate full drip progression status for the weekly outline
  const courseSequence = buildCourseItemSequence(enrollment.course);
  const dripStatusMap = calculateDripUnlockStatus(courseSequence, {
    completedLessonIds,
    completedSummaryIds,
    passedQuizIds,
    submittedAssignmentIds,
    progressionGrantedQuizIds,
    attemptedQuizIds,
  });

  const dripStatusRecord: Record<string, ItemDripStatus> = {};
  for (const [key, value] of dripStatusMap.entries()) {
    dripStatusRecord[key] = value;
  }

  // Calculate quiz best scores
  const quizIds = enrollment.course.weeks.flatMap((w) =>
    w.modules
      .map((m) => m.quiz)
      .filter((q): q is NonNullable<typeof q> => !!q && q.status === 'PUBLISHED')
      .map((q) => q.id)
  );
  const quizProgress = summarizeCumulativeQuizScore(quizIds, allQuizAttempts as any);
  const quizBestScores: Record<string, number> = {};
  for (const [key, value] of quizProgress.bestByQuiz.entries()) {
    quizBestScores[key] = value.score;
  }

  return (
    <LessonWorkspace
      cacheScope={student.id}
      courseId={courseId}
      courseTitle={enrollment.course.title}
      lesson={lesson}
      weeks={enrollment.course.weeks as any}
      previousLesson={previousLesson ? { id: previousLesson.id, title: previousLesson.title } : null}
      nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null}
      isCompleted={isCompleted}
      progress={progress}
      completedLessonIds={Array.from(completedLessonIds)}
      completedSummaryIds={Array.from(completedSummaryIds)}
      submittedAssignmentIds={Array.from(submittedAssignmentIds)}
      dripStatusRecord={dripStatusRecord}
      quizAttempts={allQuizAttempts.map((a) => ({
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
      setLessonProgressAction={setLessonProgressAction}
    />
  );
}
