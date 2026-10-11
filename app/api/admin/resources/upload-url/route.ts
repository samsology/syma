import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAdmin } from '@/lib/auth/authorization';
import { getR2Client, getR2BucketName } from '@/lib/storage/r2Client';

function sanitizeFilename(fileName: string): string {
  const nameWithoutPath = fileName.split(/[/\\]/).pop() || 'file';
  return nameWithoutPath.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const { courseId, lessonId, fileName, fileSize, mimeType, resourceType } = body;

    if (!courseId || typeof courseId !== 'string') {
      return NextResponse.json({ success: false, error: 'courseId is required.' }, { status: 400 });
    }

    if (!lessonId || typeof lessonId !== 'string') {
      return NextResponse.json({ success: false, error: 'lessonId is required.' }, { status: 400 });
    }

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json({ success: false, error: 'fileName is required.' }, { status: 400 });
    }

    const maxSizeBytes = 500 * 1024 * 1024; // 500 MB limit
    if (fileSize && typeof fileSize === 'number' && fileSize > maxSizeBytes) {
      return NextResponse.json({ success: false, error: 'File size exceeds maximum limit of 500 MB.' }, { status: 400 });
    }

    const safeFilename = sanitizeFilename(fileName);
    const folderType = (resourceType || 'file').toString().toLowerCase();
    const uniqueId = crypto.randomUUID();
    const storageKey = `courses/${courseId}/lessons/${lessonId}/${folderType}/${uniqueId}-${safeFilename}`;

    const client = getR2Client();
    const bucket = getR2BucketName();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      ContentType: mimeType || 'application/octet-stream',
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        storageKey,
        key: storageKey,
        expiresInSeconds: 900,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error generating R2 upload URL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate upload URL.' },
      { status: 500 }
    );
  }
}
