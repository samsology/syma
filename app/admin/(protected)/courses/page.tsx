import Link from 'next/link';
import { Plus } from 'lucide-react';
import { CourseFilters } from '@/components/admin/courses/CourseFilters';
import { CourseTable } from '@/components/admin/courses/CourseTable';
import { getAdminCourses } from '@/lib/courses/queries';
import type { CourseSort } from '@/lib/courses/options';

export const metadata = {
  title: 'Admin Courses',
};

type AdminCoursesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCoursesPage({ searchParams }: AdminCoursesPageProps) {
  const params = await searchParams;
  const currentParams = {
    q: getParam(params, 'q'),
    status: getParam(params, 'status'),
    category: getParam(params, 'category'),
    level: getParam(params, 'level'),
    sort: getParam(params, 'sort'),
    page: getParam(params, 'page'),
  };

  const page = Number(currentParams.page ?? '1');
  const hasFilters = Boolean(currentParams.q || (currentParams.status && currentParams.status !== 'ALL') || (currentParams.category && currentParams.category !== 'ALL') || (currentParams.level && currentParams.level !== 'ALL'));
  const { courses, totalCount, totalPages } = await getAdminCourses({
    search: currentParams.q,
    status: currentParams.status,
    category: currentParams.category,
    level: currentParams.level,
    sort: currentParams.sort as CourseSort,
    page,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Courses</h2>
          <p className="mt-2 text-sm text-slate-500">Manage your Syma Tech courses.</p>
        </div>
        <Link href="/admin/courses/new" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-secondary">
          <Plus className="h-4 w-4" />
          Add Course
        </Link>
      </div>

      <CourseFilters searchParams={currentParams} />
      <CourseTable courses={courses} hasFilters={hasFilters} />

      <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {courses.length} of {totalCount} courses
        </p>
        <div className="flex gap-2">
          <Link
            href={`/admin/courses?page=${Math.max(page - 1, 1)}`}
            aria-disabled={page <= 1}
            className={`rounded-lg border border-slate-300 px-3 py-2 font-semibold ${page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-slate-50'}`}
          >
            Previous
          </Link>
          <span className="rounded-lg bg-white px-3 py-2 font-semibold text-slate-700">
            Page {page} of {totalPages}
          </span>
          <Link
            href={`/admin/courses?page=${Math.min(page + 1, totalPages)}`}
            aria-disabled={page >= totalPages}
            className={`rounded-lg border border-slate-300 px-3 py-2 font-semibold ${page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-slate-50'}`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
