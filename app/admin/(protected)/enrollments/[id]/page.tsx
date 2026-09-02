import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusPill } from '@/components/admin/StatusPill';
import { updateEnrollmentStatusAction } from '../actions';
import { getAdminEnrollmentDetail } from '@/lib/enrollments/queries';

type EnrollmentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEnrollmentDetailPage({ params }: EnrollmentDetailPageProps) {
  const { id } = await params;
  const enrollment = await getAdminEnrollmentDetail(id);
  if (!enrollment) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/enrollments" className="text-sm font-black text-primary">Back to Enrollments</Link>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">{enrollment.student.firstName} {enrollment.student.lastName}</h1>
            <p className="mt-1 text-sm text-slate-600">{enrollment.student.email}</p>
            <p className="mt-3 font-bold text-slate-900">{enrollment.course.title}</p>
          </div>
          <StatusPill status={enrollment.status} />
        </div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-4">
          <div><dt className="font-black text-slate-500">Enrolled</dt><dd>{enrollment.enrolledAt.toLocaleDateString()}</dd></div>
          <div><dt className="font-black text-slate-500">Started</dt><dd>{enrollment.startedAt?.toLocaleDateString() ?? 'Not started'}</dd></div>
          <div><dt className="font-black text-slate-500">Completed</dt><dd>{enrollment.completedAt?.toLocaleDateString() ?? 'Not completed'}</dd></div>
          <div><dt className="font-black text-slate-500">Learning Progress</dt><dd className="font-bold text-slate-900">{enrollment.progressSummary.progressPercentage}% ({enrollment.progressSummary.completedCount}/{enrollment.progressSummary.totalCount} lessons)</dd></div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          {['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED'].filter((status) => status !== enrollment.status).map((status) => (
            <form key={status} action={updateEnrollmentStatusAction}>
              <input type="hidden" name="enrollmentId" value={enrollment.id} />
              <input type="hidden" name="status" value={status} />
              <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:border-primary hover:text-primary">
                Set {status}
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
