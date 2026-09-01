import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { db } from '@/lib/db';
import { updateCourseSchema } from '@/lib/validation/course';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(code: string, message: string, status: number, fields?: Record<string, string[] | undefined>) {
  return NextResponse.json({ success: false, error: { code, message, fields } }, { status });
}

export async function GET(_request: Request, context: RouteContext) {
  await requireAdmin();
  const { id } = await context.params;
  const course = await db.course.findUnique({
    where: { id },
    include: { instructor: { select: { id: true, name: true, email: true } } },
  });

  if (!course) return errorResponse('NOT_FOUND', 'Course not found.', 404);
  return NextResponse.json({ success: true, data: course });
}

export async function PUT(request: Request, context: RouteContext) {
  await requireAdmin();
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateCourseSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid course data.', 400, parsed.error.flatten().fieldErrors);
  }

  const existingCourse = await db.course.findUnique({ where: { id }, select: { id: true } });
  if (!existingCourse) return errorResponse('NOT_FOUND', 'Course not found.', 404);

  try {
    const course = await db.course.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        shortDescription: parsed.data.shortDescription,
        description: parsed.data.description,
        category: parsed.data.category,
        level: parsed.data.level,
        duration: parsed.data.duration,
        thumbnailUrl: parsed.data.thumbnailUrl || null,
        instructorId: parsed.data.instructorId || null,
      },
    });

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return errorResponse('DUPLICATE_SLUG', 'A course with this slug already exists.', 409, {
        slug: ['A course with this slug already exists.'],
      });
    }
    return errorResponse('SERVER_ERROR', 'Unable to update course.', 500);
  }
}
