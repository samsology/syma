import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { CourseForm } from '@/components/admin/courses/CourseForm';
import { updateCourseAction } from '../../actions';

type EditCoursePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const [course, admins] = await Promise.all([
    db.course.findUnique({ where: { id } }),
    db.admin.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!course) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Edit Course</h2>
        <p className="mt-2 text-sm text-slate-500">Update course-level details. Manage lessons and resources from the Curriculum Builder.</p>
      </div>
      <CourseForm action={updateCourseAction.bind(null, course.id)} course={course} admins={admins} />
    </div>
  );
}
