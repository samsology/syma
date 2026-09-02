import { EnrollmentForm } from '@/components/admin/enrollments/EnrollmentForm';
import { getEnrollmentCreateOptions } from '@/lib/enrollments/queries';

type NewEnrollmentPageProps = {
  searchParams: Promise<{ studentId?: string; courseId?: string }>;
};

export default async function NewEnrollmentPage({ searchParams }: NewEnrollmentPageProps) {
  const [params, options] = await Promise.all([searchParams, getEnrollmentCreateOptions()]);

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Enrollments</p>
        <h1 className="text-3xl font-black text-slate-950">Add Enrollment</h1>
      </header>
      <EnrollmentForm {...options} selectedStudentId={params.studentId} selectedCourseId={params.courseId} />
    </div>
  );
}
