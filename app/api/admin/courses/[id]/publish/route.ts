import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { db } from '@/lib/db';
import { validateCourseForPublishing } from '@/lib/courses/publishing';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  await requireAdmin();
  const { id } = await context.params;
  const course = await db.course.findUnique({ where: { id } });

  if (!course) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Course not found.' } }, { status: 404 });

  const validation = await validateCourseForPublishing(id);
  if (!validation.valid) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CURRICULUM_INVALID',
          message: 'Course does not meet publishing requirements.',
          details: validation.errors,
        },
      },
      { status: 400 }
    );
  }

  const updated = await db.course.update({ where: { id }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
  return NextResponse.json({ success: true, data: updated });
}
