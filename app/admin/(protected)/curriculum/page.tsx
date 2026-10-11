import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpen, ArrowRight, Layers } from 'lucide-react';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCurriculumHubPage() {
  const courses = await db.course.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      level: true,
      category: true,
      _count: {
        select: {
          weeks: true,
          enrollments: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // If there is only one active course, redirect directly to its curriculum builder
  if (courses.length === 1) {
    redirect(`/admin/courses/${courses[0].id}/curriculum`);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Curriculum Management</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
          Manage Course Curricula
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Select a course below to build modules, manage lessons, and organize instructional resources.
        </p>
      </header>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Layers className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-base font-bold text-slate-900">No Courses Available</h3>
          <p className="mt-1 text-xs text-slate-500">
            Create a course first before building its curriculum.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/courses/new"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-secondary transition"
            >
              Create Course
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 uppercase">
                    {course.category}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      course.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">{course.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{course.level}</p>

                <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-3">
                  <span className="flex items-center gap-1.5 text-primary">
                    <BookOpen className="h-4 w-4" />
                    {course._count.weeks} Weeks Configured
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href={`/admin/courses/${course.id}/curriculum`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-secondary transition"
                >
                  <span>Open Curriculum Builder</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
