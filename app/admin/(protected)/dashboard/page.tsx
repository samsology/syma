import {
  Archive,
  Banknote,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  PencilLine,
  Users,
} from 'lucide-react';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/authorization';
import { StatsCard } from '@/components/admin/StatsCard';
import { RecentCourses } from '@/components/admin/RecentCourses';

export const metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const [
    totalCourses,
    publishedCourses,
    draftCourses,
    archivedCourses,
    totalWeeks,
    totalModules,
    totalLessons,
    totalStudents,
    activeEnrollments,
    completedEnrollments,
    totalRevenue,
    paidOrders,
    pendingOrders,
    failedPayments,
    recentCourses,
    recentEnrollments,
  ] = await Promise.all([
    db.course.count(),
    db.course.count({ where: { status: 'PUBLISHED' } }),
    db.course.count({ where: { status: 'DRAFT' } }),
    db.course.count({ where: { status: 'ARCHIVED' } }),
    db.courseWeek.count(),
    db.courseModule.count(),
    db.lesson.count(),
    db.student.count(),
    db.enrollment.count({ where: { status: 'ACTIVE' } }),
    db.enrollment.count({ where: { status: 'COMPLETED' } }),
    db.order.aggregate({ where: { status: 'PAID' }, _sum: { amountMinor: true } }),
    db.order.count({ where: { status: 'PAID' } }),
    db.order.count({ where: { status: 'PENDING' } }),
    db.payment.count({ where: { status: 'FAILED' } }),
    db.course.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
    }),
    db.enrollment.findMany({
      orderBy: { enrolledAt: 'desc' },
      take: 5,
      include: {
        student: { select: { firstName: true, lastName: true } },
        course: { select: { title: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold text-slate-500">Welcome back, {admin.name}</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">Admin dashboard</h2>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Course statistics">
        <StatsCard label="Total Courses" value={totalCourses} icon={BookOpen} />
        <StatsCard label="Published" value={publishedCourses} icon={CheckCircle2} />
        <StatsCard label="Drafts" value={draftCourses} icon={PencilLine} />
        <StatsCard label="Archived" value={archivedCourses} icon={Archive} />
        <StatsCard label="Total Weeks" value={totalWeeks} icon={FileText} />
        <StatsCard label="Total Modules" value={totalModules} icon={FileText} />
        <StatsCard label="Total Lessons" value={totalLessons} icon={FileText} />
        <StatsCard label="Students" value={totalStudents} icon={Users} />
        <StatsCard label="Active Enrollments" value={activeEnrollments} icon={ClipboardList} />
        <StatsCard label="Completed" value={completedEnrollments} icon={CheckCircle2} />
        <StatsCard
          label="Revenue (USD)"
          value={(totalRevenue._sum.amountMinor ?? 0) / 100}
          icon={Banknote}
        />
        <StatsCard label="Paid Orders" value={paidOrders} icon={CheckCircle2} />
        <StatsCard label="Pending Orders" value={pendingOrders} icon={ClipboardList} />
        <StatsCard label="Failed Payments" value={failedPayments} icon={Archive} />
      </section>

      <RecentCourses courses={recentCourses} />
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Recent Enrollments</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {recentEnrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="font-semibold text-slate-900">
                {enrollment.student.firstName} {enrollment.student.lastName}
              </p>
              <p className="text-sm text-slate-500">
                {enrollment.course.title} · {enrollment.status}
              </p>
            </div>
          ))}
          {!recentEnrollments.length ? (
            <p className="py-4 text-sm font-semibold text-slate-500">No enrollments yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
