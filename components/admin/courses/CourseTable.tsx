import Image from 'next/image';
import Link from 'next/link';
import type { Course, Admin } from '@prisma/client';
import { Eye, Pencil, Plus } from 'lucide-react';
import { CourseStatusBadge } from './CourseStatusBadge';
import { CourseActionForm } from './CourseActionForm';
import { archiveCourseAction, publishCourseAction, restoreCourseAction, unpublishCourseAction } from '@/app/admin/(protected)/courses/actions';

type CourseRow = Course & {
  instructor: Pick<Admin, 'id' | 'name' | 'email'> | null;
  _count?: {
    weeks: number;
    enrollments?: number;
  };
};

type CourseTableProps = {
  courses: CourseRow[];
  hasFilters: boolean;
};

export function CourseTable({ courses, hasFilters }: CourseTableProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-slate-950">{hasFilters ? 'No courses match your search or filters.' : 'No courses found.'}</h2>
        <p className="mt-2 text-sm text-slate-500">{hasFilters ? 'Try changing the search terms or clear filters.' : 'Create your first course to get started.'}</p>
        <div className="mt-5 flex justify-center gap-3">
          {hasFilters && (
            <Link href="/admin/courses" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Clear Filters
            </Link>
          )}
          <Link href="/admin/courses/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary">
            <Plus className="h-4 w-4" />
            Add Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {['Thumbnail', 'Course', 'Category', 'Level', 'Duration', 'Status', 'Last Updated', 'Actions'].map((heading) => (
                <th key={heading} scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.map((course) => (
              <tr key={course.id} className="align-top">
                <td className="px-4 py-4">
                  <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-surface-light">
                    {course.thumbnailUrl ? (
                      <Image src={course.thumbnailUrl} alt="" fill sizes="64px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-primary">SYMA</div>
                    )}
                  </div>
                </td>
                <td className="min-w-64 px-4 py-4">
                  <Link href={`/admin/courses/${course.id}`} className="font-bold text-slate-950 hover:text-primary">
                    {course.title}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">{course.slug}</p>
                  <p className="mt-1 text-xs font-semibold text-primary">Curriculum: {course._count?.weeks ?? 0} weeks</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Students: {course._count?.enrollments ?? 0}</p>
                  {course.instructor && <p className="mt-1 text-xs text-slate-400">Instructor: {course.instructor.name}</p>}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">{course.category}</td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">{course.level}</td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                  <div>{course.duration}</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">${(course.priceMinor / 100).toFixed(2)} USD</div>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <CourseStatusBadge status={course.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-500">{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(course.updatedAt)}</td>
                <td className="px-4 py-4">
                  <div className="flex min-w-72 flex-wrap gap-2">
                    <Link href={`/admin/courses/${course.id}`} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                    <Link href={`/admin/courses/${course.id}/edit`} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                    <Link href={`/admin/courses/${course.id}/preview`} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                      Preview
                    </Link>
                    <Link href={`/admin/courses/${course.id}/students`} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                      Students
                    </Link>
                    {course.status === 'DRAFT' && (
                      <CourseActionForm action={publishCourseAction} courseId={course.id} label="Publish" variant="primary" confirmMessage="Publish Course? This course will become visible on the public Syma Tech website." />
                    )}
                    {course.status === 'PUBLISHED' && (
                      <CourseActionForm action={unpublishCourseAction} courseId={course.id} label="Move to Draft" confirmMessage="Move this published course back to draft?" />
                    )}
                    {course.status !== 'ARCHIVED' && (
                      <CourseActionForm action={archiveCourseAction} courseId={course.id} label="Archive" variant="danger" confirmMessage="Archive Course? This course will be removed from active public course listings but retained in the database." />
                    )}
                    {course.status === 'ARCHIVED' && (
                      <CourseActionForm action={restoreCourseAction} courseId={course.id} label="Restore" confirmMessage="Restore this course to draft?" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
