import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, Download, ExternalLink, FileText, ShieldAlert, Video } from 'lucide-react';
import { db } from '@/lib/db';
import { CourseStatusBadge } from '@/components/admin/courses/CourseStatusBadge';

type PreviewCoursePageProps = {
  params: Promise<{ id: string }>;
};

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function PreviewCoursePage({ params }: PreviewCoursePageProps) {
  const { id } = await params;
  const course = await db.course.findUnique({
    where: { id },
    include: {
      instructor: { select: { name: true, email: true } },
      weeks: {
        orderBy: [{ sortOrder: 'asc' }, { weekNumber: 'asc' }],
        include: {
          modules: {
            orderBy: { sortOrder: 'asc' },
            include: {
              lessons: {
                orderBy: { sortOrder: 'asc' },
                include: {
                  resources: { orderBy: { createdAt: 'asc' } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) notFound();

  const totalModules = course.weeks.reduce((sum, w) => sum + w.modules.length, 0);
  const totalLessons = course.weeks.reduce(
    (sum, w) => sum + w.modules.reduce((mSum, m) => mSum + m.lessons.length, 0),
    0
  );
  const totalResources = course.weeks.reduce(
    (sum, w) =>
      sum +
      w.modules.reduce(
        (mSum, m) => mSum + m.lessons.reduce((lSum, l) => lSum + l.resources.length, 0),
        0
      ),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/admin/courses/${course.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course Overview
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/courses/${course.id}/curriculum`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Curriculum Builder
          </Link>
          <Link
            href={`/admin/courses/${course.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit Metadata
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <span className="font-bold">Admin-Only Authenticated Preview: </span>
          <span>
            This comprehensive preview verifies curriculum structure, lesson content, and attached resources before
            publishing. Draft and archived content is not accessible to public visitors.
          </span>
        </div>
      </div>

      <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="relative min-h-72 bg-slate-900 px-6 py-16 text-white sm:px-10">
          {course.thumbnailUrl && (
            <Image src={course.thumbnailUrl} alt="" fill sizes="100vw" className="object-cover opacity-30" />
          )}
          <div className="relative max-w-3xl">
            <CourseStatusBadge status={course.status} />
            <h1 className="mt-5 text-4xl font-extrabold leading-tight">{course.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/85">{course.shortDescription}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-white/85">
              <span>{course.category}</span>
              <span>·</span>
              <span>{course.level}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.duration}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_300px]">
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">About this course</h2>
              <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {course.description}
              </div>
            </div>

            {course.benefits && course.benefits.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-slate-950">Key Outcomes &amp; Skills</h3>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 text-sm text-slate-700">
                  {course.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-950">Curriculum &amp; Syllabus</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {course.weeks.length} Weeks · {totalModules} Modules · {totalLessons} Lessons · {totalResources} Resources
                  </p>
                </div>
              </div>

              {course.weeks.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  No curriculum has been added to this course yet.
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {course.weeks.map((week) => (
                    <div
                      key={week.id}
                      className="rounded-lg border border-slate-200 bg-slate-50/50 overflow-hidden shadow-xs"
                    >
                      <div className="border-b border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
                          <span>Week {week.weekNumber}</span>
                          <span>·</span>
                          <span>{week.modules.length} Modules</span>
                        </div>
                        <h4 className="mt-1 text-lg font-bold text-slate-950">{week.title}</h4>
                        {week.description && (
                          <p className="mt-1 text-xs text-slate-500">{week.description}</p>
                        )}
                      </div>

                      <div className="p-4 space-y-4">
                        {week.modules.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No modules in this week.</p>
                        ) : (
                          week.modules.map((module, mIdx) => (
                            <div key={module.id} className="rounded-lg border border-slate-200 bg-white p-4">
                              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                <div>
                                  <span className="text-xs font-bold text-slate-400 uppercase">
                                    Module {mIdx + 1}
                                  </span>
                                  <h5 className="font-bold text-slate-900">{module.title}</h5>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                  {module.lessons.length} lessons
                                </span>
                              </div>

                              <div className="mt-3 space-y-3">
                                {module.lessons.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">No lessons in this module.</p>
                                ) : (
                                  module.lessons.map((lesson) => (
                                    <div
                                      key={lesson.id}
                                      className="rounded-md border border-slate-100 bg-slate-50/70 p-3 text-sm space-y-2"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          {lesson.lessonType === 'VIDEO' ? (
                                            <Video className="h-4 w-4 text-blue-600" />
                                          ) : (
                                            <FileText className="h-4 w-4 text-slate-600" />
                                          )}
                                          <span className="font-bold text-slate-900">{lesson.title}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                          <span className="rounded bg-slate-200 px-1.5 py-0.5 font-bold uppercase text-slate-700 text-[10px]">
                                            {lesson.lessonType}
                                          </span>
                                          {lesson.duration ? (
                                            <span className="text-slate-500 font-medium">
                                              {lesson.duration} min
                                            </span>
                                          ) : null}
                                          {lesson.isPreview && (
                                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-800 text-[10px] uppercase">
                                              Free Preview
                                            </span>
                                          )}
                                          <span
                                            className={`rounded px-1.5 py-0.5 font-bold text-[10px] uppercase ${
                                              lesson.status === 'PUBLISHED'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-amber-100 text-amber-800'
                                            }`}
                                          >
                                            {lesson.status}
                                          </span>
                                        </div>
                                      </div>

                                      {lesson.videoUrl && (
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                          <span className="font-semibold text-slate-700">Video:</span>
                                          <a
                                            href={lesson.videoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primary hover:underline truncate max-w-sm inline-flex items-center gap-1"
                                          >
                                            {lesson.videoUrl}
                                            <ExternalLink className="h-3 w-3" />
                                          </a>
                                        </div>
                                      )}

                                      {lesson.content && (
                                        <div className="rounded bg-white p-2.5 text-xs text-slate-600 leading-relaxed border border-slate-100 max-h-32 overflow-y-auto whitespace-pre-wrap">
                                          {lesson.content}
                                        </div>
                                      )}

                                      {lesson.resources.length > 0 && (
                                        <div className="pt-1">
                                          <p className="text-[11px] font-bold uppercase text-slate-400">
                                            Resources ({lesson.resources.length})
                                          </p>
                                          <div className="mt-1 flex flex-wrap gap-2">
                                            {lesson.resources.map((res) => (
                                              <a
                                                key={res.id}
                                                href={res.fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-xs border border-slate-200 text-slate-700 hover:border-primary hover:text-primary"
                                              >
                                                <Download className="h-3 w-3 text-slate-400" />
                                                <span className="font-medium">{res.name}</span>
                                                <span className="text-[10px] font-bold uppercase text-slate-400">
                                                  ({res.fileType}
                                                  {res.fileSize ? ` · ${formatBytes(res.fileSize)}` : ''})
                                                </span>
                                              </a>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-lg bg-neutral-light p-5 space-y-4">
              <h3 className="font-bold text-slate-950">Course Details</h3>
              <div className="border-b border-slate-200 pb-3">
                <span className="text-2xl font-black text-slate-900">
                  ${(course.priceMinor / 100).toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-slate-500 ml-1.5">{course.currency}</span>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-slate-500">Instructor</dt>
                  <dd className="font-medium text-slate-800">{course.instructor?.name ?? 'Syma Tech Faculty'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Duration</dt>
                  <dd className="font-medium text-slate-800">{course.duration}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Level</dt>
                  <dd className="font-medium text-slate-800">{course.level}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Button CTA</dt>
                  <dd className="font-medium text-slate-800">{course.cta || 'Apply Today'}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
              <h4 className="font-bold text-slate-950 text-sm">Curriculum Summary</h4>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Weeks</span>
                  <span className="font-bold text-slate-900">{course.weeks.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Modules</span>
                  <span className="font-bold text-slate-900">{totalModules}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lessons</span>
                  <span className="font-bold text-slate-900">{totalLessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Attached Resources</span>
                  <span className="font-bold text-slate-900">{totalResources}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
