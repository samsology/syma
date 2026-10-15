import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth/session';
import { getCurrentStudent } from '@/lib/auth/student-session';
import { db } from '@/lib/db';
import { storageService } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ success: false, error: 'Storage key is required.' }, { status: 400 });
    }

    // Clean r2://, https://courses/, or S3 URL prefix if present
    const rawKey = key.trim();
    if (/^https?:\/\/courses\//i.test(rawKey)) {
      key = rawKey.replace(/^https?:\/\//i, '');
    } else {
      key = rawKey.replace(/^r2:\/\//i, '');
    }

    // 1. Authenticate (Admin or Student)
    const admin = await getCurrentAdmin();
    const student = !admin ? await getCurrentStudent() : null;

    if (!admin && !student) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    }

    // Authorize student course enrollment
    if (student) {
      const resource = await db.lessonResource.findFirst({
        where: {
          OR: [
            { storageKey: key },
            { fileUrl: key },
            { fileUrl: { contains: key } },
          ],
          isActive: true,
        },
        select: {
          lesson: {
            select: {
              module: {
                select: {
                  week: {
                    select: {
                      courseId: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const lesson = !resource
        ? await db.lesson.findFirst({
            where: {
              OR: [
                { videoUrl: key },
                { videoUrl: { contains: key } },
                { slideUrl: key },
                { slideUrl: { contains: key } },
              ],
            },
            select: {
              module: {
                select: {
                  week: {
                    select: {
                      courseId: true,
                    },
                  },
                },
              },
            },
          })
        : null;

      const courseId =
        resource?.lesson?.module?.week?.courseId ||
        lesson?.module?.week?.courseId;

      if (courseId) {
        const enrollment = await db.enrollment.findFirst({
          where: {
            studentId: student.id,
            courseId,
            status: { in: ['ACTIVE', 'COMPLETED'] },
          },
        });

        if (!enrollment) {
          return NextResponse.json(
            { success: false, error: 'Access denied. Active course enrollment required.' },
            { status: 403 }
          );
        }
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
    console.error('Error generating presigned access URL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to authorize storage access.' },
      { status: 500 }
    );
  }
}
