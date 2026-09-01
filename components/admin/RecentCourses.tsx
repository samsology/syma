import Link from 'next/link';
import type { CourseStatus } from '@prisma/client';

type RecentCourse = {
  id: string;
  title: string;
  status: CourseStatus;
  updatedAt: Date;
};

type RecentCoursesProps = {
  courses: RecentCourse[];
};

const statusLabels: Record<CourseStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export function RecentCourses({ courses }: RecentCoursesProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-slate-950">No courses yet.</h2>
        <p className="mt-2 text-sm text-slate-500">Create your first course to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-slate-950">Recent Courses</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-5 py-3 text-left font-semibold text-slate-600">
                Course
              </th>
              <th scope="col" className="px-5 py-3 text-left font-semibold text-slate-600">
                Status
              </th>
              <th scope="col" className="px-5 py-3 text-left font-semibold text-slate-600">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{course.title}</td>
                <td className="whitespace-nowrap px-5 py-4">
                  <span className="rounded-full bg-surface-light px-2.5 py-1 text-xs font-bold text-primary">
                    {statusLabels[course.status]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                  {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(course.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-200 px-5 py-4">
        <Link className="text-sm font-semibold text-primary hover:text-secondary" href="/admin/courses">
          View courses
        </Link>
      </div>
    </div>
  );
}
