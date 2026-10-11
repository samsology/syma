import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { getCourseWithCurriculum } from '@/lib/curriculum/queries';
import { CurriculumBuilder } from '@/components/admin/curriculum/CurriculumBuilder';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type CurriculumPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CurriculumPage({ params }: CurriculumPageProps) {
  const { id } = await params;

  let course = null;
  let fetchError: string | null = null;
  try {
    course = await getCourseWithCurriculum(id);
  } catch (error) {
    console.error(`[CurriculumPage] Error querying course ${id}:`, error);
    fetchError = (error as Error).message || 'Failed to query database';
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-lg mx-auto">
          <div className="flex justify-center text-red-500 mb-3">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Course Not Found</h2>
          <p className="mt-2 text-sm text-slate-600">
            {fetchError
              ? `A database error occurred: ${fetchError}`
              : `Unable to locate course with identifier "${id}". It may have been archived or deleted.`}
          </p>
          <div className="mt-5">
            <Link
              href="/admin/courses"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary"
            >
              Return to Course Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500" aria-label="Breadcrumb">
        <Link href="/admin/courses" className="hover:text-primary">Courses</Link>
        <span>/</span>
        <Link href={`/admin/courses/${course.id}`} className="hover:text-primary">{course.title}</Link>
        <span>/</span>
        <span className="text-slate-900">Curriculum</span>
      </nav>
      <Link href={`/admin/courses/${course.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">
        <ArrowLeft className="h-4 w-4" />
        Back to Course
      </Link>
      <CurriculumBuilder course={course} />
    </div>
  );
}
