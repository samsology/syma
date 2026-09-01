import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { LessonForm } from '@/components/admin/curriculum/CurriculumForms';
import { updateLessonAction } from '../../../curriculum/actions';

type LessonEditPageProps = {
  params: Promise<{ id: string; lessonId: string }>;
};

export default async function LessonEditPage({ params }: LessonEditPageProps) {
  const { id, lessonId } = await params;
  const course = await db.course.findUnique({ where: { id }, select: { id: true, title: true } });
  const lesson = await db.lesson.findFirst({ where: { id: lessonId, module: { week: { courseId: id } } } });

  if (!course || !lesson) notFound();

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500" aria-label="Breadcrumb">
        <Link href="/admin/courses" className="hover:text-primary">Courses</Link>
        <span>/</span>
        <Link href={`/admin/courses/${course.id}`} className="hover:text-primary">{course.title}</Link>
        <span>/</span>
        <Link href={`/admin/courses/${course.id}/curriculum`} className="hover:text-primary">Curriculum</Link>
        <span>/</span>
        <span className="text-slate-900">Lesson</span>
      </nav>
      <Link href={`/admin/courses/${course.id}/curriculum`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">
        <ArrowLeft className="h-4 w-4" />
        Back to Curriculum
      </Link>
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Edit Lesson</h2>
        <p className="mt-2 text-sm text-slate-500">Save lesson content, video URL, status, and preview settings.</p>
      </div>
      <LessonForm action={updateLessonAction.bind(null, course.id, lesson.id)} lesson={lesson} />
    </div>
  );
}
