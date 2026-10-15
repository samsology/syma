import { NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import { getCurrentAdmin } from '@/lib/auth/session';
import { getCurrentStudent } from '@/lib/auth/student-session';
import { db } from '@/lib/db';
import { getR2Client, getR2BucketName } from '@/lib/storage/r2Client';
import { extractR2StorageKey } from '@/lib/resources/embed';

const MIME_TYPES: Record<string, string> = {
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogg: 'video/ogg',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  csv: 'text/csv; charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  zip: 'application/zip',
  json: 'application/json',
  txt: 'text/plain; charset=utf-8',
  ipynb: 'application/json',
  pbix: 'application/octet-stream',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawKey = searchParams.get('key') || searchParams.get('url');

    if (!rawKey) {
      return NextResponse.json(
        { success: false, error: 'Storage key or URL is required.' },
        { status: 400 }
      );
    }

    const key =
      extractR2StorageKey(rawKey) ||
      rawKey.replace(/^r2:\/\//i, '').replace(/^https?:\/\/courses\//i, 'courses/');

    // 1. Authenticate (Admin or Student)
    const admin = await getCurrentAdmin();
    const student = !admin ? await getCurrentStudent() : null;

    if (!admin && !student) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
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

    const client = getR2Client();
    const bucket = getR2BucketName();
    const rangeHeader = request.headers.get('range');
    const isDownload =
      searchParams.get('download') === '1' || searchParams.get('download') === 'true';

    // 2. Fetch object with optional Range header for audio/video streaming & seeking
    let s3Response;
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      });
      s3Response = await client.send(command);
    } catch (s3Err: unknown) {
      const err = s3Err as { name?: string; $metadata?: { httpStatusCode?: number } };
      if (err.name === 'NoSuchKey' || err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return NextResponse.json(
          { success: false, error: 'Resource object missing or not found in storage.' },
          { status: 404 }
        );
      }
      throw s3Err;
    }

    if (!s3Response.Body) {
      return NextResponse.json(
        { success: false, error: 'Resource object has empty body.' },
        { status: 404 }
      );
    }

    // Determine content type
    const ext = key.split('.').pop()?.toLowerCase() || '';
    const contentType =
      MIME_TYPES[ext] || s3Response.ContentType || 'application/octet-stream';

    // Determine clean filename for attachment / inline header
    const rawFilename = key.split('/').pop() || 'resource';
    // Remove UUID prefix if present: e.g. 17c06227-c85a-44af-8218-8a8bf5498cc8-myFile.pptx -> myFile.pptx
    const cleanFilename = rawFilename.replace(/^[0-9a-fA-F-]{36}-/, '');
    const encodedFilename = encodeURIComponent(cleanFilename);

    // Prevent download disposition on instructional media (PDF, Video, PPTX)
    const isRestrictedLearningMedia = ['pdf', 'mp4', 'webm', 'ogg', 'mov', 'm4v', 'pptx', 'ppt'].includes(ext);
    const dispositionType = (isDownload && !isRestrictedLearningMedia) ? 'attachment' : 'inline';
    const contentDisposition = `${dispositionType}; filename="${cleanFilename.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`;

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'private, max-age=3600');
    headers.set('Content-Disposition', contentDisposition);

    if (s3Response.ContentLength !== undefined) {
      headers.set('Content-Length', String(s3Response.ContentLength));
    }

    if (s3Response.ContentRange) {
      headers.set('Content-Range', s3Response.ContentRange);
    }

    const statusCode = s3Response.$metadata?.httpStatusCode || (rangeHeader ? 206 : 200);

    // Convert AWS SDK stream to Web stream
    let webStream: ReadableStream;
    if (typeof (s3Response.Body as { transformToWebStream?: () => ReadableStream }).transformToWebStream === 'function') {
      webStream = (s3Response.Body as { transformToWebStream: () => ReadableStream }).transformToWebStream();
    } else if (s3Response.Body instanceof Readable) {
      webStream = Readable.toWeb(s3Response.Body) as ReadableStream;
    } else {
      webStream = s3Response.Body as unknown as ReadableStream;
    }

    return new Response(webStream, {
      status: statusCode,
      headers,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error proxying resource access:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to proxy storage resource.' },
      { status: 500 }
    );
  }
}
