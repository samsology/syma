import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  await requireAdmin();
  const { id } = await context.params;
  const course = await db.course.findUnique({
    where: { id },
    include: {
      weeks: {
        orderBy: [{ sortOrder: 'asc' }, { weekNumber: 'asc' }],
        include: {
          modules: {
            orderBy: { sortOrder: 'asc' },
            include: {
              lessons: {
                orderBy: { sortOrder: 'asc' },
                include: { resources: { orderBy: { createdAt: 'asc' } } },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Course not found.' } }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: course });
}
