import Link from 'next/link';
import { ExternalLink, FileText, FolderOpen, Pencil, Presentation, Video } from 'lucide-react';
import { db } from '@/lib/db';

export const metadata = {
  title: 'Admin Resources | Syma Tech Solutions',
};

type AdminResourcesPageProps = {
  searchParams: Promise<{ courseId?: string; q?: string }>;
};

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminResourcesPage({ searchParams }: AdminResourcesPageProps) {
  const { courseId, q } = await searchParams;

  const [allCourses, resources] = await Promise.all([
    db.course.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
    db.lessonResource.findMany({
      where: {
        ...(courseId ? { lesson: { module: { week: { courseId } } } } : {}),
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                title: true,
                week: {
                  select: {
                    weekNumber: true,
                    course: {
                      select: {
                        id: true,
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const uniqueLessonsWithResources = new Set(resources.map((r) => r.lessonId)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Learning Resources</h2>
          <p className="mt-1 text-sm text-slate-500">
            Platform-wide directory of downloadable guides, datasets, notebooks, and reference materials.
          </p>
        </div>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-secondary self-start sm:self-auto"
        >
          <FolderOpen className="h-4 w-4" />
          Manage via Courses
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-2xl font-bold text-slate-950">{resources.length}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Attached Resources</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-2xl font-bold text-slate-950">{uniqueLessonsWithResources}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase">Lessons with Materials</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-2xl font-bold text-slate-950">{allCourses.length}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Courses</p>
        </div>
      </div>

      <form method="GET" className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search resources by name..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:w-64">
          <select
            name="courseId"
            defaultValue={courseId ?? ''}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All Courses</option>
            {allCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Filter
        </button>
        {(courseId || q) && (
          <Link
            href="/admin/resources"
            className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Clear
          </Link>
        )}
      </form>

      {resources.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-400" />
          <h3 className="mt-3 text-lg font-bold text-slate-950">No resources found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {courseId || q
              ? 'Try modifying your filter or search query.'
              : 'Resources can be attached to lessons inside any course curriculum.'}
          </p>
          <div className="mt-5">
            <Link
              href="/admin/courses"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Resource Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Type &amp; Source</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Size</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Course</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Lesson</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((resource) => {
                  const parentCourse = resource.lesson.module.week.course;
                  return (
                    <tr key={resource.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        <a
                          href={resource.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 hover:text-primary"
                        >
                          {resource.resourceType === 'VIDEO' ? (
                            <Video className="h-4 w-4 text-sky-600 shrink-0" />
                          ) : resource.resourceType === 'DOCUMENT' ? (
                            <Presentation className="h-4 w-4 text-indigo-600 shrink-0" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                          )}
                          <div>
                            <span>{resource.name}</span>
                            {resource.description && (
                              <p className="text-xs font-normal text-slate-400 truncate max-w-xs">
                                {resource.description}
                              </p>
                            )}
                          </div>
                          <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                        </a>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase text-slate-700 w-fit">
                            {resource.resourceType || 'FILE'}
                          </span>
                          <span className="text-[11px] text-slate-400 uppercase font-semibold">
                            {resource.sourceType} · {resource.fileType}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {resource.isActive ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                            Hidden
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{formatBytes(resource.fileSize)}</td>
                      <td className="px-4 py-3.5 text-slate-700">
                        <Link
                          href={`/admin/courses/${parentCourse.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {parentCourse.title}
                        </Link>
                        <p className="text-xs text-slate-400">
                          Week {resource.lesson.module.week.weekNumber} · {resource.lesson.module.title}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        {resource.lesson.title}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/admin/courses/${parentCourse.id}/lessons/${resource.lesson.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit in Lesson
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
