import Link from 'next/link';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminAssignmentsPage() {
  const assignments = await db.weeklyAssignment.findMany({
    orderBy: [{ week: { course: { title: 'asc' } } }, { week: { weekNumber: 'asc' } }],
    include: { week: { include: { course: { select: { id: true, title: true } } } }, _count: { select: { submissions: true } } },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Learning management</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Weekly assignments</h1>
        <p className="mt-2 text-sm text-slate-600">Manage assignments from each course curriculum and review student work here.</p>
      </header>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {assignments.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">No weekly assignments yet. Open a course curriculum to add one.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{assignment.week.course.title} · Week {assignment.week.weekNumber}</p>
                  <h2 className="mt-1 font-bold text-slate-950">{assignment.title}</h2>
                  <p className="mt-1 text-xs text-slate-600">{assignment.status === 'PUBLISHED' ? 'Published' : 'Draft'} · {assignment._count.submissions} submission{assignment._count.submissions === 1 ? '' : 's'}{assignment.dueAt ? ` · Due ${assignment.dueAt.toLocaleDateString()}` : ''}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/courses/${assignment.week.course.id}/curriculum`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Edit assignment</Link>
                  <Link href={`/admin/assignments/${assignment.id}`} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-secondary">Review work</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
