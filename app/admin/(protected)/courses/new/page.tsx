import { db } from '@/lib/db';
import { CourseForm } from '@/components/admin/courses/CourseForm';
import { createCourseAction } from '../actions';

export const metadata = {
  title: 'New Course',
};

export default async function NewCoursePage() {
  const admins = await db.admin.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Create Course</h2>
        <p className="mt-2 text-sm text-slate-500">Save the course as a draft before publishing it.</p>
      </div>
      <CourseForm action={createCourseAction} admins={admins} />
    </div>
  );
}
