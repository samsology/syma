import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Eye, Pencil, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { CourseStatusBadge } from '@/components/admin/courses/CourseStatusBadge';
import { CourseActionForm } from '@/components/admin/courses/CourseActionForm';
import { archiveCourseAction, publishCourseAction, restoreCourseAction, unpublishCourseAction } from '../actions';

type CourseDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function successMessage(value?: string | string[]) {
  const key = Array.isArray(value) ? value[0] : value;
  const messages: Record<string, string> = {
    created: 'Course created successfully.',
    updated: 'Course updated successfully.',
    published: 'Course published successfully.',
    draft: 'Course moved to draft.',
    restored: 'Course restored successfully.',
  };
  return key ? messages[key] : undefined;
}

export default async function CourseDetailPage({ params, searchParams }: CourseDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const course = await db.course.findUnique({
    where: { id },
    include: {
      instructor: { select: { name: true, email: true } },
      _count: { select: { weeks: true, enrollments: true } },
    },
  });

  if (!course) notFound();
  const message = successMessage(query.success);

  return (
    <div className="space-y-6">
      <Link href="/admin/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </Link>

      {message && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</div>}
      {query.error === 'publish-invalid' && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-error">Complete the required course fields before publishing.</div>}
      {query.error === 'curriculum-required' && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-error">Add at least one week, one module, and one lesson before publishing.</div>}
      {query.error === 'publish-failed' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-error">
          <p className="font-bold">Cannot publish course. Please resolve the following curriculum issues:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1 font-medium text-xs">
            {String(query.details ?? '')
              .split(';')
              .map((err, idx) => (
                <li key={idx}>{err.trim()}</li>
              ))}
          </ul>
        </div>
      )}
      {query.error === 'delete-restricted' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-error">
          Cannot delete course with existing student enrollments or orders. Please archive the course instead to preserve student records.
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CourseStatusBadge status={course.status} />
            <h2 className="mt-4 text-3xl font-bold text-slate-950">{course.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{course.shortDescription}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/courses/${course.id}/edit`} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <Link href={`/admin/courses/${course.id}/curriculum`} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-secondary">
              <BookOpen className="h-4 w-4" />
              Manage Curriculum
            </Link>
            <Link href={`/admin/courses/${course.id}/students`} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              <Users className="h-4 w-4" />
              Manage Students
            </Link>
            <Link href={`/admin/courses/${course.id}/preview`} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              <Eye className="h-4 w-4" />
              Preview
            </Link>
            {course.status === 'DRAFT' && <CourseActionForm action={publishCourseAction} courseId={course.id} label="Publish" variant="primary" confirmMessage="Publish Course? This course will become visible on the public Syma Tech website." />}
            {course.status === 'PUBLISHED' && <CourseActionForm action={unpublishCourseAction} courseId={course.id} label="Move to Draft" confirmMessage="Move this published course back to draft?" />}
            {course.status !== 'ARCHIVED' && <CourseActionForm action={archiveCourseAction} courseId={course.id} label="Archive" variant="danger" confirmMessage="Archive Course? This course will be removed from active public course listings but retained in the database." />}
            {course.status === 'ARCHIVED' && <CourseActionForm action={restoreCourseAction} courseId={course.id} label="Restore" confirmMessage="Restore this course to draft?" />}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">Description</h3>
            <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{course.description}</div>
          </section>

          {course.benefits && course.benefits.length > 0 && (
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-950">Key Benefits</h3>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                {course.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">Course Information</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="font-semibold text-slate-500">Price</dt><dd className="mt-1 font-bold text-slate-900">${(course.priceMinor / 100).toFixed(2)} {course.currency}</dd></div>
              <div><dt className="font-semibold text-slate-500">CTA Label</dt><dd className="mt-1 text-slate-900">{course.cta || 'Apply Today'}</dd></div>
              <div><dt className="font-semibold text-slate-500">Programme Order</dt><dd className="mt-1 text-slate-900">{course.sortOrder}</dd></div>
              <div><dt className="font-semibold text-slate-500">Category</dt><dd className="mt-1 text-slate-900">{course.category}</dd></div>
              <div><dt className="font-semibold text-slate-500">Level</dt><dd className="mt-1 text-slate-900">{course.level}</dd></div>
              <div><dt className="font-semibold text-slate-500">Duration</dt><dd className="mt-1 text-slate-900">{course.duration}</dd></div>
              <div><dt className="font-semibold text-slate-500">Slug</dt><dd className="mt-1 break-all text-slate-900">{course.slug}</dd></div>
              <div><dt className="font-semibold text-slate-500">Instructor</dt><dd className="mt-1 text-slate-900">{course.instructor?.name ?? 'Not assigned'}</dd></div>
            </dl>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">Curriculum</h3>
            <p className="mt-2 text-sm text-slate-500">Build weeks, modules, lessons, and resource metadata in the Curriculum Builder.</p>
            <p className="mt-3 text-sm font-semibold text-slate-700">{course._count.weeks} weeks currently attached.</p>
            <Link href={`/admin/courses/${course.id}/curriculum`} className="mt-4 inline-flex rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-secondary">
              Manage Curriculum
            </Link>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">Students</h3>
            <p className="mt-2 text-sm text-slate-500">Review enrolled students and add learners to this course.</p>
            <p className="mt-3 text-sm font-semibold text-slate-700">{course._count.enrollments} students enrolled.</p>
            <Link href={`/admin/courses/${course.id}/students`} className="mt-4 inline-flex rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-secondary">
              Manage Students
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
