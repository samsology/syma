import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { CurriculumBuilder } from '@/components/admin/curriculum/CurriculumBuilder';

type CurriculumPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CurriculumPage({ params }: CurriculumPageProps) {
  const { id } = await params;
  const course = await db.course.findUnique({
    where: { id },
    include: {
      weeks: {
        orderBy: [{ sortOrder: 'asc' }, { weekNumber: 'asc' }],
        include: {
          assignment: true,
          modules: {
            orderBy: { sortOrder: 'asc' },
            include: {
              summary: true,
              quiz: true,
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

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500" aria-label="Breadcrumb">
        <Link href="/admin/courses" className="hover:text-primary">Courses</Link>
        <span>/</span>
        <Link href={`/admin/courses/${course.id}`} className="hover:text-primary">{course.title}</Link>
        <span>/</span>
        <span className="text-slate-900">Curriculum</span>
      </nav>
      <Link href={`/admin/courses/${course.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">
        <ArrowLeft className="h-4 w-4" />
        Back to Course
      </Link>
      <CurriculumBuilder course={course} />
    </div>
  );
}
