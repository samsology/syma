import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { LessonForm } from '@/components/admin/curriculum/CurriculumForms';
import { ResourceManager } from '@/components/admin/curriculum/ResourceManager';
import { updateLessonAction } from '../../../curriculum/actions';

type LessonEditPageProps = {
  params: Promise<{ id: string; lessonId: string }>;
};

export default async function LessonEditPage({ params }: LessonEditPageProps) {
  const { id, lessonId } = await params;
  const course = await db.course.findUnique({ where: { id }, select: { id: true, title: true } });
  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, module: { week: { courseId: id } } },
    include: { resources: { orderBy: { createdAt: 'asc' } } },
  });

  if (!course || !lesson) notFound();

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500" aria-label="Breadcrumb">
        <Link href="/admin/courses" className="hover:text-primary">
          Courses
        </Link>
        <span>/</span>
        <Link href={`/admin/courses/${course.id}`} className="hover:text-primary">
          {course.title}
        </Link>
        <span>/</span>
        <Link href={`/admin/courses/${course.id}/curriculum`} className="hover:text-primary">
          Curriculum
        </Link>
        <span>/</span>
        <span className="text-slate-900">Lesson: {lesson.title}</span>
      </nav>

      <Link
        href={`/admin/courses/${course.id}/curriculum`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Curriculum
      </Link>

      <div>
        <h2 className="text-2xl font-bold text-slate-950">Edit Lesson: {lesson.title}</h2>
        <p className="mt-2 text-sm text-slate-500">
          Manage instructional content, video links, preview eligibility, and attached supporting resources.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Instructional Content</h3>
        <LessonForm action={updateLessonAction.bind(null, course.id, lesson.id)} lesson={lesson} />
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Attached Materials &amp; Resources</h3>
        <p className="text-sm text-slate-500">
          Manage downloadable files, datasets, slides, and external repositories specifically for this lesson.
        </p>
        <ResourceManager courseId={course.id} lessonId={lesson.id} resources={lesson.resources} />
      </section>
    </div>
  );
}
