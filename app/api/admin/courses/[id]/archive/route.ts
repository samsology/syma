import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  await requireAdmin();
  const { id } = await context.params;
  const existing = await db.course.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Course not found.' } }, { status: 404 });

  const updated = await db.course.update({ where: { id }, data: { status: 'ARCHIVED' } });
  return NextResponse.json({ success: true, data: updated });
}
