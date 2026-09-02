import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusPill } from '@/components/admin/StatusPill';
import { db } from '@/lib/db';

type CourseStudentsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseStudentsPage({ params }: CourseStudentsPageProps) {
  const { id } = await params;
  const course = await db.course.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      enrollments: {
        orderBy: { enrolledAt: 'desc' },
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, email: true, status: true },
          },
        },
      },
    },
  });

  if (!course) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <header>
          <Link href={`/admin/courses/${course.id}`} className="text-sm font-black text-primary">Back to Course</Link>
          <h1 className="mt-2 text-3xl font-black text-slate-950">{course.title}</h1>
          <p className="mt-1 text-sm text-slate-600">Students enrolled in this course</p>
        </header>
        <Link href={`/admin/enrollments/new?courseId=${course.id}`} className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-white">Add Student</Link>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {course.enrollments.map((enrollment) => (
            <div key={enrollment.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href={`/admin/students/${enrollment.student.id}`} className="font-black text-slate-950 hover:text-primary">
                  {enrollment.student.firstName} {enrollment.student.lastName}
                </Link>
                <p className="text-sm text-slate-500">{enrollment.student.email}</p>
                <p className="text-xs text-slate-500">Enrolled {enrollment.enrolledAt.toLocaleDateString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill status={enrollment.student.status} />
                <StatusPill status={enrollment.status} />
              </div>
            </div>
          ))}
          {!course.enrollments.length ? (
            <div className="p-8 text-center">
              <p className="font-semibold text-slate-500">No students are enrolled in this course yet.</p>
              <Link href={`/admin/enrollments/new?courseId=${course.id}`} className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-black text-white">Add Student</Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
