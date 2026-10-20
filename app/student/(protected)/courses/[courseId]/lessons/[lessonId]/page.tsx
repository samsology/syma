import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { getStudentLesson } from '@/lib/student-course/queries';
import { setLessonProgressAction } from '@/app/student/progress-actions';
import { ResourceStage } from '@/components/resources/ResourceStage';

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
      select: { quizId: true },
    }),
    db.quizAttempt.findMany({
      where: { studentId: student.id },
      select: { quizId: true },
    }),
  ]);

  const { isItemUnlocked } = await import('@/lib/student-course/drip-progression');
  const unlocked = isItemUnlocked(enrollment.course, lessonId, {
    completedLessonIds: completedLessonProgress.map((p: { lessonId: string }) => p.lessonId),
    completedSummaryIds: completedSummaryProgress.map((p: { moduleSummaryId: string }) => p.moduleSummaryId),
    passedQuizIds: passedAttempts.map((a: { quizId: string }) => a.quizId),
    submittedAssignmentIds: assignmentSubmissions.map((a: { assignmentId: string }) => a.assignmentId),
    progressionGrantedQuizIds: studentOverrides.map((o: { quizId: string }) => o.quizId),
    attemptedQuizIds: allQuizAttempts.map((a: { quizId: string }) => a.quizId),
  });

  if (!unlocked) {
    redirect(`/student/courses/${courseId}`);
  }

  return (
    <article className="space-y-4 sm:space-y-5">
      <Link
        href={`/student/courses/${courseId}`}
        className="text-primary inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Curriculum
      </Link>
      <header className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
        <p className="text-primary text-[11px] sm:text-xs font-bold tracking-wide uppercase">
          {enrollment.course.title} · Week {lesson.weekNumber} · {lesson.moduleTitle}
        </p>
        <h1 className="mt-1 text-lg sm:text-xl md:text-2xl font-bold text-slate-950">{lesson.title}</h1>
        <div className="mt-2.5 max-w-sm">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold tracking-wide text-slate-500 uppercase">
            <span>{progress.percentage}% complete</span>
            <span>
              {progress.completedLessons}/{progress.totalLessons} lessons
            </span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
            <div
              className="bg-primary h-1.5 rounded-full"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </header>
      {/* In-Portal Media Stage & Attached Resources */}
      <ResourceStage
        lessonTitle={lesson.title}
        primaryVideoUrl={lesson.videoUrl}
        primarySlideUrl={lesson.slideUrl}
        primaryResourceType={lesson.resourceType}
        resources={lesson.resources}
      />

      {lesson.content && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 leading-relaxed text-slate-700 shadow-xs space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-950">Lesson Notes &amp; Instructions</h2>
          <div className="whitespace-pre-wrap text-xs sm:text-sm">{lesson.content}</div>
        </section>
      )}
      <form
        action={setLessonProgressAction}
        className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs"
      >
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="lessonId" value={lessonId} />
        <input type="hidden" name="isCompleted" value={isCompleted ? 'false' : 'true'} />
        <button
          className={
            isCompleted
              ? 'hover:border-primary hover:text-primary rounded-lg border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700'
              : 'bg-primary hover:bg-primary/90 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold text-white'
          }
        >
          {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
        </button>
      </form>
      <nav
        className="flex flex-col gap-2.5 sm:flex-row sm:justify-between"
        aria-label="Lesson navigation"
      >
        {previousLesson ? (
          <Link
            href={`/student/courses/${courseId}/lessons/${previousLesson.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
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
            className="bg-primary inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-primary/90 transition"
          >
            Next Lesson
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
