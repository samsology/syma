import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { db } from '@/lib/db';
import { updateCourseSchema } from '@/lib/validation/course';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  await requireAdmin();
  const { id } = await context.params;
  const course = await db.course.findUnique({ where: { id } });

  if (!course) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Course not found.' } }, { status: 404 });
  if (!updateCourseSchema.safeParse(course).success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Complete required course fields before publishing.' } }, { status: 400 });
  }
  const [weekCount, moduleCount, lessonCount] = await Promise.all([
    db.courseWeek.count({ where: { courseId: id } }),
    db.courseModule.count({ where: { week: { courseId: id } } }),
    db.lesson.count({ where: { module: { week: { courseId: id } } } }),
  ]);
  if (weekCount === 0 || moduleCount === 0 || lessonCount === 0) {
    return NextResponse.json({ success: false, error: { code: 'CURRICULUM_REQUIRED', message: 'Add at least one week, one module, and one lesson before publishing.' } }, { status: 400 });
  }

  const updated = await db.course.update({ where: { id }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
  return NextResponse.json({ success: true, data: updated });
}
