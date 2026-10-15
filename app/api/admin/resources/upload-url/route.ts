import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAdmin } from '@/lib/auth/authorization';
import { db } from '@/lib/db';
import { sanitizeR2PathSegment } from '@/lib/resources/r2-upload-key';
import { getR2Client, getR2BucketName } from '@/lib/storage/r2Client';

function sanitizeFilename(fileName: string): string {
  const nameWithoutPath = fileName.split(/[/\\]/).pop() || 'file';
  return nameWithoutPath.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

// Config per category: allowed extensions, mime prefix checks, and byte limits
const ALLOWED_CONFIG: Record<string, { extensions: string[]; mimePrefixes?: string[]; maxBytes: number }> = {
  video: {
    extensions: ['mp4', 'webm', 'ogg', 'mov', 'm4v', 'mkv'],
    mimePrefixes: ['video/'],
    maxBytes: 1024 * 1024 * 1024, // 1 GB limit for videos
  },
  document: {
    extensions: ['pdf', 'pptx', 'ppt', 'key', 'doc', 'docx'],
    mimePrefixes: ['application/pdf', 'application/vnd', 'application/msword'],
    maxBytes: 500 * 1024 * 1024, // 500 MB limit for documents
  },
  slide: {
    extensions: ['pdf', 'pptx', 'ppt', 'key'],
    mimePrefixes: ['application/pdf', 'application/vnd', 'application/msword'],
    maxBytes: 500 * 1024 * 1024, // 500 MB limit for slides
  },
  file: {
    extensions: [
      'csv', 'json', 'xlsx', 'xls', 'zip', 'tar', 'gz', 'txt', 'tsv',
      'parquet', 'png', 'jpg', 'jpeg', 'pdf', 'mp4', 'webm', 'pptx',
    ],
    maxBytes: 500 * 1024 * 1024, // 500 MB limit for general files
  },
};

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

    // Lessons can be uploaded before their first save (the curriculum form uses a draft ID).
    // Bind the key to an existing course; requiring a persisted lesson here blocks that flow.
    const course = await db.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 });
    }

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json({ success: false, error: 'fileName is required.' }, { status: 400 });
    }

    const safeFilename = sanitizeFilename(fileName);
    const fileExt = safeFilename.split('.').pop()?.toLowerCase() || '';
    if (!fileExt) {
      return NextResponse.json({ success: false, error: 'Uploaded file must have a valid extension.' }, { status: 400 });
    }

    const category = (resourceType || 'file').toString().toLowerCase();
    const config = ALLOWED_CONFIG[category] || ALLOWED_CONFIG.file;

    // Validate extension
    if (!config.extensions.includes(fileExt)) {
      return NextResponse.json({
        success: false,
        error: `Invalid file extension '.${fileExt}' for ${category} resource. Allowed extensions: ${config.extensions.map((e) => `.${e}`).join(', ')}`,
      }, { status: 400 });
    }

    // Validate file size (up to 1 GB for videos)
    if (fileSize && typeof fileSize === 'number') {
      if (fileSize <= 0) {
        return NextResponse.json({ success: false, error: 'File size must be greater than 0 bytes.' }, { status: 400 });
      }
      if (fileSize > config.maxBytes) {
        const maxMB = Math.round(config.maxBytes / (1024 * 1024));
        const maxDisplay = maxMB >= 1024 ? `${maxMB / 1024} GB` : `${maxMB} MB`;
        return NextResponse.json({
          success: false,
          error: `File size exceeds maximum allowed limit of ${maxDisplay}.`,
        }, { status: 400 });
      }
    }

    // Sanitize course and lesson IDs for the key path
    const safeCourseId = sanitizeR2PathSegment(courseId);
    const safeLessonId = sanitizeR2PathSegment(lessonId);
    const uniqueId = crypto.randomUUID();
    const folderType = category;
    const storageKey = `courses/${safeCourseId}/lessons/${safeLessonId}/${folderType}/${uniqueId}-${safeFilename}`;

    const client = getR2Client();
    const bucket = getR2BucketName();

    // Default MIME type mapping if not provided or generic
    let resolvedMimeType = (mimeType && mimeType !== 'application/octet-stream') ? mimeType : '';
    if (!resolvedMimeType) {
      if (fileExt === 'mp4') resolvedMimeType = 'video/mp4';
      else if (fileExt === 'webm') resolvedMimeType = 'video/webm';
      else if (fileExt === 'ogg') resolvedMimeType = 'video/ogg';
      else if (fileExt === 'mov') resolvedMimeType = 'video/quicktime';
      else if (fileExt === 'pdf') resolvedMimeType = 'application/pdf';
      else if (fileExt === 'pptx') resolvedMimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      else if (fileExt === 'ppt') resolvedMimeType = 'application/vnd.ms-powerpoint';
      else if (fileExt === 'csv') resolvedMimeType = 'text/csv';
      else if (fileExt === 'json') resolvedMimeType = 'application/json';
      else resolvedMimeType = 'application/octet-stream';
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      ContentType: resolvedMimeType,
    });

    const expiresInSeconds = 900; // 15 minutes
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        storageKey,
        key: storageKey,
        expiresInSeconds,
        method: 'PUT',
        headers: {
          'Content-Type': resolvedMimeType,
        },
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
