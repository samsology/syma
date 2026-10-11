import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth/session';
import { getCurrentStudent } from '@/lib/auth/student-session';
import { db } from '@/lib/db';
import { storageService } from '@/lib/storage';

export async function GET(
  _request: Request,
  props: { params: Promise<{ resourceId: string }> }
) {
  try {
    const { resourceId } = await props.params;

    if (!resourceId || typeof resourceId !== 'string') {
      return NextResponse.json({ success: false, error: 'resourceId is required.' }, { status: 400 });
    }

    // 1. Authenticate (Admin or Student)
    const admin = await getCurrentAdmin();
    const student = !admin ? await getCurrentStudent() : null;

    if (!admin && !student) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    }

    // 2. Fetch resource & course association
    const resource = await db.lessonResource.findFirst({
      where: {
        id: resourceId,
        isActive: true,
      },
      include: {
        lesson: {
          select: {
            id: true,
            status: true,
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

    if (!resource) {
      return NextResponse.json({ success: false, error: 'Resource not found or inactive.' }, { status: 404 });
    }

    const courseId = resource.lesson.module.week.courseId;

    // 3. Authorize student enrollment (Admins bypass enrollment check)
    if (student) {
      const enrollment = await db.enrollment.findFirst({
        where: {
          studentId: student.id,
          courseId,
          status: { in: ['ACTIVE', 'COMPLETED'] },
        },
      });

      if (!enrollment) {
        return NextResponse.json({ success: false, error: 'Access denied. Active course enrollment required.' }, { status: 403 });
      }
    }

    // 4. Generate access URL based on storage provider
    let accessUrl = resource.fileUrl;

    if (resource.sourceType === 'R2' || resource.storageKey) {
      let storageKey = (resource.storageKey || resource.fileUrl).trim();
      if (/^https?:\/\/courses\//i.test(storageKey)) {
        storageKey = storageKey.replace(/^https?:\/\//i, '');
      } else {
        storageKey = storageKey.replace(/^r2:\/\//i, '');
      }
      if (!storageKey) {
        return NextResponse.json({ success: false, error: 'Resource storage key is missing.' }, { status: 500 });
      }

      // Verify object exists in bucket
      const exists = await storageService.exists(storageKey);
      if (!exists) {
        return NextResponse.json({ success: false, error: 'Storage object missing in R2 bucket.' }, { status: 404 });
      }

      // Generate 1-hour presigned GET URL
      accessUrl = await storageService.getSignedUrl(storageKey, 3600);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: resource.id,
        name: resource.name,
        description: resource.description,
        resourceType: resource.resourceType,
        sourceType: resource.sourceType,
        accessUrl,
        fileType: resource.fileType,
        fileSize: resource.fileSize,
        isDownloadable: resource.isDownloadable,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error fetching resource access URL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to authorize resource access.' },
      { status: 500 }
    );
  }
}
