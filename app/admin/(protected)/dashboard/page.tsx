import { Archive, BookOpen, CheckCircle2, FileText, PencilLine } from 'lucide-react';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/authorization';
import { StatsCard } from '@/components/admin/StatsCard';
import { RecentCourses } from '@/components/admin/RecentCourses';

export const metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const [totalCourses, publishedCourses, draftCourses, archivedCourses, totalWeeks, totalModules, totalLessons, recentCourses] = await Promise.all([
    db.course.count(),
    db.course.count({ where: { status: 'PUBLISHED' } }),
    db.course.count({ where: { status: 'DRAFT' } }),
    db.course.count({ where: { status: 'ARCHIVED' } }),
    db.courseWeek.count(),
    db.courseModule.count(),
    db.lesson.count(),
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
      </section>

      <RecentCourses courses={recentCourses} />
    </div>
  );
}
