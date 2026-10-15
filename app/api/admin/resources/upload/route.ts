import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { r2Storage } from '@/lib/storage/r2Storage';

function sanitizeFilename(fileName: string): string {
  const nameWithoutPath = fileName.split(/[/\\]/).pop() || 'file';
  return nameWithoutPath.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const courseId = formData.get('courseId') as string | null;
    const lessonId = formData.get('lessonId') as string | null;
    const resourceType = (formData.get('resourceType') as string | null) || 'file';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    if (!courseId || typeof courseId !== 'string') {
      return NextResponse.json({ success: false, error: 'courseId is required.' }, { status: 400 });
    }

    if (!lessonId || typeof lessonId !== 'string') {
      return NextResponse.json({ success: false, error: 'lessonId is required.' }, { status: 400 });
    }

    // Strict Vercel serverless request body protection:
    // Any file larger than 4 MB cannot be proxied through Vercel serverless functions.
    const VERCEL_SERVERLESS_MAX_BODY = 4.2 * 1024 * 1024; // 4.2 MB safe ceiling
    if (file.size > VERCEL_SERVERLESS_MAX_BODY) {
      return NextResponse.json({
        success: false,
        error:
          'File size exceeds 4 MB. Large video and presentation files cannot be proxied through the serverless function. Please use direct Cloudflare R2 upload.',
      }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeFilename = sanitizeFilename(file.name);
    const safeCourseId = courseId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeLessonId = lessonId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const folderType = resourceType.toLowerCase();
    const uniqueId = crypto.randomUUID();
    const storageKey = `courses/${safeCourseId}/lessons/${safeLessonId}/${folderType}/${uniqueId}-${safeFilename}`;

    await r2Storage.upload(storageKey, buffer, {
      contentType: file.type || 'application/octet-stream',
    });

    return NextResponse.json({
      success: true,
      data: {
        storageKey,
        key: storageKey,
        fileUrl: `r2://${storageKey}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error uploading file to R2 via server fallback:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload file to R2.' },
      { status: 500 }
    );
  }
}
