import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { requireStudent } from '@/lib/auth/student-authorization';
import { getStudentDashboard } from '@/lib/student-course/queries';
import { db } from '@/lib/db';
import { formatMoney } from '@/lib/payments/rules';

export default async function StudentDashboardPage() {
  const student = await requireStudent();
  const enrollments = await getStudentDashboard(student.id);
  const [courses, pendingOrders] = await Promise.all([
    db.course.findMany({ where: { status: 'PUBLISHED' }, select: { id: true, title: true, shortDescription: true, priceMinor: true, currency: true, isFree: true }, orderBy: { sortOrder: 'asc' }, take: 12 }),
    db.order.findMany({ where: { studentId: student.id, status: 'PENDING' }, include: { course: { select: { title: true } } }, orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-primary text-sm font-bold tracking-wide uppercase">Student Dashboard</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Welcome back, {student.firstName}.
        </h1>
      </header>
      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-black text-slate-950">My Courses</h2>
          <Link href="/programs" className="text-primary text-sm font-black">
            Explore Courses
          </Link>
        </div>
        {enrollments.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {enrollments.map((enrollment) => {
              const continueHref = enrollment.progress.nextLessonId
                ? `/student/courses/${enrollment.course.id}/lessons/${enrollment.progress.nextLessonId}`
                : `/student/courses/${enrollment.course.id}`;

              return (
                <article
                  key={enrollment.id}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <BookOpen className="text-primary h-5 w-5" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-black text-slate-950">
                    {enrollment.course.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {enrollment.course.shortDescription}
                  </p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-black tracking-wide text-slate-500 uppercase">
                      <span>{enrollment.progress.percentage}% complete</span>
                      <span>
                        {enrollment.progress.completedLessons}/{enrollment.progress.totalLessons}{' '}
                        lessons
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${enrollment.progress.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
                    <span>{enrollment.course.level}</span>
                    <span>{enrollment.status} Enrollment</span>
                  </div>
                  <Link
                    href={continueHref}
                    className="bg-primary hover:bg-primary/90 mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black text-white"
                  >
                    {enrollment.progress.isComplete ? 'Review Course' : 'Continue Learning'}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-lg font-black text-slate-950">
              You are not enrolled in any courses yet.
            </p>
            <Link
              href="/programs"
              className="bg-primary mt-4 inline-flex rounded-lg px-4 py-2 text-sm font-black text-white"
            >
              Explore Courses
            </Link>
          </div>
        )}
      </section>
      {pendingOrders.length ? <section className="space-y-3"><h2 className="text-xl font-black text-slate-950">Payments to finish</h2>{pendingOrders.map((order) => <Link key={order.id} href={`/checkout/${order.orderNumber}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4"><span className="font-bold">{order.course.title} · {formatMoney(order.amountMinor, order.currency)}</span><span className="text-sm font-black text-primary">Continue checkout</span></Link>)}</section> : null}
      <section className="space-y-4"><h2 className="text-xl font-black text-slate-950">Available Courses</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{courses.map((course) => <article key={course.id} className="rounded-lg border border-slate-200 bg-white p-5"><h3 className="font-black text-slate-950">{course.title}</h3><p className="mt-2 text-sm text-slate-600">{course.shortDescription}</p><p className="mt-3 font-bold text-primary">{course.isFree ? 'Free' : formatMoney(course.priceMinor, course.currency)}</p><Link href={`/student/enroll?courseId=${encodeURIComponent(course.id)}`} className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-black text-white">{course.isFree ? 'Enroll' : 'View checkout'}</Link></article>)}</div></section>
    </div>
  );
}
