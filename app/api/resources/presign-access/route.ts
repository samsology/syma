import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth/session';
import { getCurrentStudent } from '@/lib/auth/student-session';
import { db } from '@/lib/db';
import { storageService } from '@/lib/storage';
import { getStudentResourceCourseIds } from '@/lib/resources/r2-access';
import { normalizeR2ResourceKey } from '@/lib/resources/r2-key';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ success: false, error: 'Storage key is required.' }, { status: 400 });
    }

    const normalizedKey = normalizeR2ResourceKey(key);
    if (!normalizedKey) {
      return NextResponse.json({ success: false, error: 'Invalid storage key.' }, { status: 400 });
    }
    key = normalizedKey;

    // 1. Authenticate (Admin or Student)
    const admin = await getCurrentAdmin();
    const student = !admin ? await getCurrentStudent() : null;

    if (!admin && !student) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    }

    // Authorize student course enrollment
    if (student) {
      const courseIds = await getStudentResourceCourseIds(key);
      if (courseIds.length === 0) {
        return NextResponse.json({ success: false, error: 'Resource is not available to students.' }, { status: 403 });
      }
      const enrollment = await db.enrollment.findFirst({
        where: {
          studentId: student.id,
          courseId: { in: courseIds },
          status: { in: ['ACTIVE', 'COMPLETED'] },
        },
        select: { id: true },
      });
      if (!enrollment) {
        return NextResponse.json(
          { success: false, error: 'Access denied. Active course enrollment required.' },
          { status: 403 }
        );
      }
    }

    // 2. Verify object exists in bucket
    const exists = await storageService.exists(key);
    if (!exists) {
      return NextResponse.json({ success: false, error: 'Storage object missing in R2 bucket.' }, { status: 404 });
    }

    // 3. Generate 1-hour presigned GET URL
    const accessUrl = await storageService.getSignedUrl(key, 3600);

    return NextResponse.json({
      success: true,
      data: {
        accessUrl,
        storageKey: key,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error generating presigned access URL:', { reason: error.name || 'Error' });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to authorize storage access.' },
      { status: 500 }
    );
  }
}
