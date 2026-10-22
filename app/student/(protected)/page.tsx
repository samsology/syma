import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileCheck2,
  HelpCircle,
  PlayCircle,
  Presentation,
  Sparkles,
  Trophy,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import { requireStudent } from '@/lib/auth/student-authorization';
import { getStudentDashboard } from '@/lib/student-course/queries';
import { db } from '@/lib/db';
import { formatMoney } from '@/lib/payments/rules';

export default async function StudentDashboardPage() {
  const student = await requireStudent();
  const enrollments = await getStudentDashboard(student.id);
  const enrolledCourseIds = enrollments.map((e) => e.course.id);

  // 1. Identify primary active learning focus
  const activeEnrollment =
    enrollments.find((e) => !e.progress.isComplete && e.progress.nextLessonId) ||
    enrollments[0] ||
    null;

  let activeLessonDetails: {
    id: string;
    title: string;
    duration: number | null;
    lessonType: string;
    resourceType: string | null;
    module: {
      title: string;
      week: {
        weekNumber: number;
        title: string;
      };
    };
  } | null = null;

  if (activeEnrollment?.progress.nextLessonId) {
    activeLessonDetails = await db.lesson.findUnique({
      where: { id: activeEnrollment.progress.nextLessonId },
      select: {
        id: true,
        title: true,
        duration: true,
        lessonType: true,
        resourceType: true,
        module: {
          select: {
            title: true,
            week: {
              select: {
                weekNumber: true,
                title: true,
              },
            },
          },
        },
      },
    });
  }

  // 2. Query upcoming assessments and recent activity
  const [
    assignments,
    quizzes,
    recentLessonProgress,
    recentQuizAttempts,
    availableCatalog,
    pendingOrders,
  ] = await Promise.all([
    enrolledCourseIds.length
      ? db.weeklyAssignment.findMany({
          where: {
            week: { courseId: { in: enrolledCourseIds } },
            status: 'PUBLISHED',
          },
          include: {
            week: {
              select: {
                courseId: true,
                weekNumber: true,
                title: true,
                course: { select: { title: true } },
              },
            },
            submissions: {
              where: { studentId: student.id },
              orderBy: { attemptNumber: 'desc' },
              take: 1,
              select: { id: true, status: true, score: true, submittedAt: true },
            },
          },
          orderBy: { week: { weekNumber: 'asc' } },
          take: 4,
        })
      : [],
    enrolledCourseIds.length
      ? db.moduleQuiz.findMany({
          where: {
            module: { week: { courseId: { in: enrolledCourseIds } } },
            status: 'PUBLISHED',
          },
          include: {
            module: {
              select: {
                title: true,
                week: {
                  select: {
                    courseId: true,
                    weekNumber: true,
                    course: { select: { title: true } },
                  },
                },
              },
            },
            attempts: {
              where: { studentId: student.id },
              orderBy: { attemptNumber: 'desc' },
              take: 1,
              select: { id: true, passed: true, score: true, percentage: true, completedAt: true },
            },
          },
          orderBy: { module: { sortOrder: 'asc' } },
          take: 4,
        })
      : [],
    db.lessonProgress.findMany({
      where: { studentId: student.id, isCompleted: true },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                title: true,
                week: {
                  select: {
                    courseId: true,
                    weekNumber: true,
                    course: { select: { title: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 4,
    }),
    db.quizAttempt.findMany({
      where: { studentId: student.id, completedAt: { not: null } },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            module: {
              select: {
                week: {
                  select: {
                    courseId: true,
                    course: { select: { title: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 3,
    }),
    db.course.findMany({
      where: {
        status: 'PUBLISHED',
        ...(enrolledCourseIds.length ? { id: { notIn: enrolledCourseIds } } : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        priceMinor: true,
        currency: true,
        isFree: true,
        level: true,
        duration: true,
      },
      orderBy: { sortOrder: 'asc' },
      take: 3,
    }),
    db.order.findMany({
      where: { studentId: student.id, status: 'PENDING' },
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  // Aggregate metrics
  const totalCompletedLessons = enrollments.reduce(
    (sum, e) => sum + e.progress.completedLessons,
    0
  );
  const totalCourseLessons = enrollments.reduce(
    (sum, e) => sum + e.progress.totalLessons,
    0
  );
  const overallPercentage =
    totalCourseLessons > 0 ? Math.round((totalCompletedLessons / totalCourseLessons) * 100) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header & Quick KPI Stat Strip */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-cerulean/10 px-3 py-1 text-xs font-bold text-brand-navy">
              <Sparkles className="h-3.5 w-3.5 text-brand-cerulean" />
              Student Learning Command Center
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-950 font-heading">
              Welcome back, {student.firstName} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Pick up where you left off in your healthcare &amp; data intelligence curriculum.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <BookOpen className="h-4 w-4 text-brand-cerulean" />
              Browse Programs
            </Link>
          </div>
        </div>

        {/* High-level metrics strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Active Courses
              </span>
              <BookOpen className="h-4 w-4 text-brand-cerulean" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{enrollments.length}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Enrolled programs</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Lessons Mastered
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {totalCompletedLessons}{' '}
              <span className="text-xs font-bold text-slate-400">/ {totalCourseLessons}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">{overallPercentage}% overall complete</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Assignments
              </span>
              <FileCheck2 className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{assignments.length}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Weekly milestones</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Assessments
              </span>
              <Trophy className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {recentQuizAttempts.filter((q) => q.passed).length}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">Quizzes passed</p>
          </div>
        </div>
      </section>

      {/* 2. Solvely-Inspired "Continue Learning" Primary Hero Banner */}
      {activeEnrollment && (
        <section className="relative overflow-hidden rounded-3xl border border-brand-cerulean/20 bg-gradient-to-br from-brand-navy via-[#072444] to-[#04162a] p-6 sm:p-8 text-white shadow-lg">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-cerulean/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-yellow px-3 py-1 text-[11px] font-black tracking-wider text-slate-950 uppercase">
                  Continue Learning
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {activeEnrollment.course.title}
                </span>
                {activeLessonDetails && (
                  <span className="text-xs text-brand-cerulean font-bold">
                    · Week {activeLessonDetails.module.week.weekNumber}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-heading">
                {activeLessonDetails?.title || activeEnrollment.course.title}
              </h2>

              <p className="text-sm text-slate-300 line-clamp-2">
                {activeLessonDetails
                  ? `Topic in ${activeLessonDetails.module.title}. Continue your sequential coursework and access interactive slides, video walkthroughs, and practice datasets.`
                  : activeEnrollment.course.shortDescription}
              </p>

              {/* Course completion progress bar */}
              <div className="pt-2 max-w-md">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Course Progress: {activeEnrollment.progress.percentage}%</span>
                  <span>
                    {activeEnrollment.progress.completedLessons} of{' '}
                    {activeEnrollment.progress.totalLessons} lessons
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-cerulean transition-all duration-500"
                    style={{ width: `${activeEnrollment.progress.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                href={
                  activeEnrollment.progress.nextLessonId
                    ? `/student/courses/${activeEnrollment.course.id}/lessons/${activeEnrollment.progress.nextLessonId}`
                    : `/student/courses/${activeEnrollment.course.id}`
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-yellow px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-md hover:bg-brand-yellow/90 hover:shadow-yellow-glow transition"
              >
                {activeEnrollment.progress.isComplete ? 'Review Course' : 'Resume Lesson'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/student/courses/${activeEnrollment.course.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition"
              >
                Curriculum
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. Pending Payments Banner (if any) */}
      {pendingOrders.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-extrabold">Pending Course Enrollments</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingOrders.map((order) => (
              <Link
                key={order.id}
                href={`/checkout/${order.orderNumber}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 transition hover:border-amber-300 hover:bg-amber-50"
              >
                <div>
                  <p className="text-sm font-bold text-slate-950">{order.course.title}</p>
                  <p className="text-xs text-amber-800">
                    Awaiting payment: {formatMoney(order.amountMinor, order.currency)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white">
                  Finish Checkout
                  <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. My Enrolled Courses */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 font-heading">My Courses</h2>
            <p className="text-xs text-slate-500">Your registered health analytics programs</p>
          </div>
          <Link
            href="/programs"
            className="text-primary hover:text-secondary inline-flex items-center gap-1 text-xs font-bold"
          >
            Explore All Programs
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {enrollments.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {enrollments.map((enrollment) => {
              const continueHref = enrollment.progress.nextLessonId
                ? `/student/courses/${enrollment.course.id}/lessons/${enrollment.progress.nextLessonId}`
                : `/student/courses/${enrollment.course.id}`;

              return (
                <article
                  key={enrollment.id}
                  className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-brand-cerulean/40 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black tracking-wider text-slate-600 uppercase">
                        {enrollment.course.level || 'Program'}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        {enrollment.status === 'COMPLETED' ? 'Completed' : 'Active'}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-950 font-heading group-hover:text-primary transition-colors">
                      {enrollment.course.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {enrollment.course.shortDescription}
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    {/* Progress tracking */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>{enrollment.progress.percentage}% Complete</span>
                        <span>
                          {enrollment.progress.completedLessons}/{enrollment.progress.totalLessons}{' '}
                          Lessons
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{ width: `${enrollment.progress.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <Link
                        href={continueHref}
                        className="bg-primary hover:bg-secondary flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white transition shadow-xs"
                      >
                        {enrollment.progress.isComplete ? 'Review Course' : 'Continue'}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/student/courses/${enrollment.course.id}`}
                        className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        title="View full curriculum outline"
                      >
                        Curriculum
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
            <GraduationCap className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-3 text-lg font-bold text-slate-950">You are not enrolled in any programs yet</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Explore our project-based curriculum in health intelligence, biostatistics, and clinical data systems.
            </p>
            <Link
              href="/programs"
              className="bg-primary hover:bg-secondary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition"
            >
              Browse Programs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* 5. Two-Column Task Grid: Upcoming Work & Recent Activity */}
      {enrolledCourseIds.length > 0 && (
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Work & Weekly Milestones */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 font-heading">
                  Upcoming Work &amp; Capstones
                </h3>
                <p className="text-xs text-slate-500">Real weekly assignments and module quizzes</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                {assignments.length + quizzes.length} Total
              </span>
            </div>

            <div className="space-y-3">
              {assignments.length === 0 && quizzes.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No pending assignments or assessments.
                </p>
              ) : (
                <>
                  {assignments.map((assignment) => {
                    const submission = assignment.submissions[0];
                    const isSubmitted = !!submission;
                    const isUnderReview = submission?.status === 'SUBMITTED';
                    const isNeedsRevision = submission?.status === 'NEEDS_REVISION';
                    const isApproved = submission?.status === 'APPROVED';

                    return (
                      <div
                        key={assignment.id}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:bg-slate-50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-xl bg-indigo-50 p-2 text-indigo-600">
                            <FileCheck2 className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Week {assignment.week.weekNumber} Capstone
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                              {assignment.title}
                            </h4>
                            <p className="text-xs text-slate-500">{assignment.week.course.title}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {isApproved ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                              Approved
                            </span>
                          ) : isNeedsRevision ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                              Revision Needed
                            </span>
                          ) : isUnderReview ? (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-800">
                              In Review
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                              Pending
                            </span>
                          )}

                          <Link
                            href={`/student/courses/${assignment.week.courseId}/weeks/${assignment.weekId}/assignment`}
                            className="text-primary hover:text-secondary text-xs font-bold inline-flex items-center gap-0.5"
                          >
                            {isSubmitted ? 'View Submission' : 'Submit'}
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                  {quizzes.map((quiz) => {
                    const attempt = quiz.attempts[0];
                    const hasPassed = attempt?.passed;

                    return (
                      <div
                        key={quiz.id}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:bg-slate-50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-xl bg-amber-50 p-2 text-amber-600">
                            <HelpCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Module Quiz · {quiz.passingScore}% to pass
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                              {quiz.title}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {quiz.module.week.course.title}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {hasPassed ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                              Passed ({attempt.score}%)
                            </span>
                          ) : attempt ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                              Retake ({attempt.score}%)
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                              Not Attempted
                            </span>
                          )}

                          <Link
                            href={`/student/courses/${quiz.module.week.courseId}/modules/${quiz.moduleId}/quiz`}
                            className="text-primary hover:text-secondary text-xs font-bold inline-flex items-center gap-0.5"
                          >
                            {hasPassed ? 'Review' : 'Take Quiz'}
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Recent Milestones & Activity */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 font-heading">
                  Recent Learning Activity
                </h3>
                <p className="text-xs text-slate-500">Verified progress and completed topics</p>
              </div>
              <Trophy className="h-4 w-4 text-brand-yellow" />
            </div>

            <div className="space-y-3">
              {recentLessonProgress.length === 0 && recentQuizAttempts.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Clock className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="text-xs text-slate-500">
                    Your recent study activity will appear here as you complete lessons and quizzes.
                  </p>
                </div>
              ) : (
                <>
                  {recentLessonProgress.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-emerald-100 p-1.5 text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                            {item.lesson.title}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {item.lesson.module.week.course.title} · Week {item.lesson.module.week.weekNumber}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-slate-400 shrink-0">
                        {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Completed'}
                      </span>
                    </div>
                  ))}

                  {recentQuizAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-full p-1.5 ${
                            attempt.passed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <Trophy className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                            {attempt.quiz.title}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Score: {attempt.score}% · {attempt.passed ? 'Passed' : 'Needs Practice'}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-slate-400 shrink-0">
                        {attempt.completedAt
                          ? new Date(attempt.completedAt).toLocaleDateString()
                          : 'Recorded'}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 6. Explore Additional Programs in the Academy */}
      {availableCatalog.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-950 font-heading">
                Expand Your Healthcare Data Skills
              </h2>
              <p className="text-xs text-slate-500">
                Other specialized tracks in the Practical Analytics Academy
              </p>
            </div>
            <Link
              href="/programs"
              className="text-primary hover:text-secondary text-xs font-bold inline-flex items-center gap-1"
            >
              All Programs
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {availableCatalog.map((course) => (
              <article
                key={course.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black tracking-wider text-slate-600 uppercase">
                      {course.level || 'Program'}
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {course.isFree ? 'Free' : formatMoney(course.priceMinor, course.currency)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-slate-950">{course.title}</h3>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                    {course.shortDescription}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {course.duration || 'Flexible pace'}
                  </span>
                  <Link
                    href={`/student/enroll?courseId=${encodeURIComponent(course.id)}`}
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:underline"
                  >
                    Enroll Now
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
