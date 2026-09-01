import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { db } from '@/lib/db';
import { getAdminCourses } from '@/lib/courses/queries';
import { createCourseSchema } from '@/lib/validation/course';
import type { CourseSort } from '@/lib/courses/options';

function errorResponse(code: string, message: string, status: number, fields?: Record<string, string[] | undefined>) {
  return NextResponse.json({ success: false, error: { code, message, fields } }, { status });
}

export async function GET(request: Request) {
  await requireAdmin();
  const url = new URL(request.url);
  const result = await getAdminCourses({
    search: url.searchParams.get('q') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
    category: url.searchParams.get('category') ?? undefined,
    level: url.searchParams.get('level') ?? undefined,
    sort: (url.searchParams.get('sort') ?? 'recent') as CourseSort,
    page: Number(url.searchParams.get('page') ?? '1'),
  });

  return NextResponse.json({ success: true, data: result });
}

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json().catch(() => null);
  const parsed = createCourseSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid course data.', 400, parsed.error.flatten().fieldErrors);
  }

  try {
    const course = await db.course.create({
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
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ success: true, data: course }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return errorResponse('DUPLICATE_SLUG', 'A course with this slug already exists.', 409, {
        slug: ['A course with this slug already exists.'],
      });
    }
    return errorResponse('SERVER_ERROR', 'Unable to create course.', 500);
  }
}
