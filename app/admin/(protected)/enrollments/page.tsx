import Link from 'next/link';
import { StatusPill } from '@/components/admin/StatusPill';
import { getAdminEnrollments, type EnrollmentSort } from '@/lib/enrollments/queries';

type EnrollmentsPageProps = {
  searchParams: Promise<{ search?: string; status?: string; sort?: EnrollmentSort; page?: string }>;
};

export default async function AdminEnrollmentsPage({ searchParams }: EnrollmentsPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? '1');
  const { enrollments, totalCount, totalPages } = await getAdminEnrollments({ ...params, page });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <header>
          <p className="text-sm font-bold uppercase tracking-wide text-primary">Learning</p>
          <h1 className="text-3xl font-black text-slate-950">Enrollments</h1>
        </header>
        <Link href="/admin/enrollments/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-white">Add Enrollment</Link>
      </div>
      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_180px_auto]">
        <input name="search" defaultValue={params.search ?? ''} placeholder="Search enrollments..." className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <select name="status" defaultValue={params.status ?? 'ALL'} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {['ALL', 'PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED'].map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select name="sort" defaultValue={params.sort ?? 'newest'} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="student-asc">Student A-Z</option>
          <option value="course-asc">Course A-Z</option>
        </select>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-white">Filter</button>
      </form>
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Enrolled</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td className="px-4 py-3"><p className="font-bold text-slate-900">{enrollment.student.firstName} {enrollment.student.lastName}</p><p className="text-xs text-slate-500">{enrollment.student.email}</p></td>
                  <td className="px-4 py-3 text-slate-700">{enrollment.course.title}</td>
                  <td className="px-4 py-3"><StatusPill status={enrollment.status} /></td>
                  <td className="px-4 py-3 text-slate-600">{enrollment.enrolledAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3"><Link className="font-black text-primary" href={`/admin/enrollments/${enrollment.id}`}>View</Link></td>
                </tr>
              ))}
              {!enrollments.length ? <tr><td colSpan={5} className="px-4 py-10 text-center font-semibold text-slate-500">No enrollments found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
      <p className="text-sm font-semibold text-slate-500">Showing page {page} of {totalPages} · {totalCount} enrollments</p>
    </div>
  );
}
