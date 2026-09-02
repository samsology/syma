import Link from 'next/link';
import { StatusPill } from '@/components/admin/StatusPill';
import { getAdminStudents, type StudentSort } from '@/lib/students/queries';

type StudentsPageProps = {
  searchParams: Promise<{ search?: string; status?: string; sort?: StudentSort; page?: string }>;
};

export default async function AdminStudentsPage({ searchParams }: StudentsPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? '1');
  const { students, totalCount, totalPages } = await getAdminStudents({ ...params, page });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Learning</p>
        <h1 className="text-3xl font-black text-slate-950">Students</h1>
      </header>
      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_180px_auto]">
        <input name="search" defaultValue={params.search ?? ''} placeholder="Search students..." className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <select name="status" defaultValue={params.status ?? 'ALL'} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED'].map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select name="sort" defaultValue={params.sort ?? 'newest'} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-white">Filter</button>
      </form>
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Courses</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-3 font-bold text-slate-900">{student.firstName} {student.lastName}</td>
                  <td className="px-4 py-3 text-slate-600">{student.email}</td>
                  <td className="px-4 py-3"><StatusPill status={student.status} /></td>
                  <td className="px-4 py-3 text-slate-600">{student._count.enrollments} courses</td>
                  <td className="px-4 py-3 text-slate-600">{student.createdAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3"><Link className="font-black text-primary" href={`/admin/students/${student.id}`}>View</Link></td>
                </tr>
              ))}
              {!students.length ? <tr><td colSpan={6} className="px-4 py-10 text-center font-semibold text-slate-500">No students found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
      <p className="text-sm font-semibold text-slate-500">Showing page {page} of {totalPages} · {totalCount} students</p>
    </div>
  );
}
