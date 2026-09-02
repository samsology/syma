import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import { db } from '@/lib/db';
import { CourseStatusBadge } from '@/components/admin/courses/CourseStatusBadge';

type PreviewCoursePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PreviewCoursePage({ params }: PreviewCoursePageProps) {
  const { id } = await params;
  const course = await db.course.findUnique({
    where: { id },
    include: { instructor: { select: { name: true } } },
  });

  if (!course) notFound();

  return (
    <div className="space-y-6">
      <Link href={`/admin/courses/${course.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">
        <ArrowLeft className="h-4 w-4" />
        Back to Course
      </Link>
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
        Admin-only preview. Draft and archived courses are not exposed through public routes.
      </div>
      <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="relative min-h-72 bg-slate-900 px-6 py-16 text-white sm:px-10">
          {course.thumbnailUrl && <Image src={course.thumbnailUrl} alt="" fill sizes="100vw" className="object-cover opacity-30" />}
          <div className="relative max-w-3xl">
            <CourseStatusBadge status={course.status} />
            <h1 className="mt-5 text-4xl font-extrabold leading-tight">{course.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/85">{course.shortDescription}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-white/85">
              <span>{course.category}</span>
              <span>{course.level}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{course.duration}</span>
            </div>
          </div>
        </div>
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">About this course</h2>
              <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{course.description}</div>
            </div>

            {course.benefits && course.benefits.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-slate-950">What you&apos;ll gain</h3>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                  {course.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <aside className="rounded-lg bg-neutral-light p-5 space-y-4">
            <h3 className="font-bold text-slate-950">Course Details</h3>
            <div className="border-b border-slate-200 pb-3">
              <span className="text-2xl font-black text-slate-900">${(course.priceMinor / 100).toFixed(2)}</span>
              <span className="text-xs font-semibold text-slate-500 ml-1.5">{course.currency}</span>
            </div>
            <dl className="space-y-3 text-sm">
              <div><dt className="font-semibold text-slate-500">Instructor</dt><dd>{course.instructor?.name ?? 'Syma Tech Faculty'}</dd></div>
              <div><dt className="font-semibold text-slate-500">Duration</dt><dd>{course.duration}</dd></div>
              <div><dt className="font-semibold text-slate-500">Level</dt><dd>{course.level}</dd></div>
              <div><dt className="font-semibold text-slate-500">CTA Label</dt><dd>{course.cta || 'Apply Today'}</dd></div>
            </dl>
          </aside>
        </div>
      </article>
    </div>
  );
}
