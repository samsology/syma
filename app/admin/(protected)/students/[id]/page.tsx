import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusPill } from '@/components/admin/StatusPill';
import { updateStudentStatusAction } from '../actions';
import { getAdminStudentDetail } from '@/lib/students/queries';

type StudentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminStudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;
  const student = await getAdminStudentDetail(id);
  if (!student) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/students" className="text-primary text-sm font-black">
        Back to Students
      </Link>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">
              {student.firstName} {student.lastName}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{student.email}</p>
            <p className="mt-1 text-sm text-slate-600">{student.phone || 'No phone number'}</p>
          </div>
          <StatusPill status={student.status} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {['ACTIVE', 'INACTIVE', 'SUSPENDED']
            .filter((status) => status !== student.status)
            .map((status) => (
              <form key={status} action={updateStudentStatusAction}>
                <input type="hidden" name="studentId" value={student.id} />
                <input type="hidden" name="status" value={status} />
                <button className="hover:border-primary hover:text-primary rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-slate-700">
                  Set {status}
                </button>
              </form>
            ))}
          <Link
            href={`/admin/enrollments/new?studentId=${student.id}`}
            className="bg-primary rounded-lg px-4 py-2 text-sm font-black text-white"
          >
            Enroll in Course
          </Link>
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Enrollments</h2>
        <div className="mt-4 grid gap-3">
          {student.enrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={`/admin/enrollments/${enrollment.id}`}
              className="hover:border-primary rounded-lg border border-slate-200 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-slate-950">{enrollment.course.title}</p>
                  <p className="text-sm text-slate-500">
                    Enrolled {enrollment.enrolledAt.toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {(() => {
                      const lessons = enrollment.course.weeks.flatMap((week) =>
                        week.modules.flatMap((module) => module.lessons)
                      );
                      const completed = lessons.filter(
                        (lesson) => lesson.progress.length > 0
                      ).length;
                      const percentage =
                        lessons.length === 0 ? 0 : Math.round((completed / lessons.length) * 100);
                      return `${percentage}% complete (${completed}/${lessons.length} lessons)`;
                    })()}
                  </p>
                </div>
                <StatusPill status={enrollment.status} />
              </div>
            </Link>
          ))}
          {!student.enrollments.length ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center font-semibold text-slate-500">
              No enrollments yet.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
