import { NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import { getCurrentAdmin } from '@/lib/auth/session';
import { getCurrentStudent } from '@/lib/auth/student-session';
import { db } from '@/lib/db';
import { getR2Client, getR2BucketName } from '@/lib/storage/r2Client';
import { getStudentResourceCourseIds } from '@/lib/resources/r2-access';
import { normalizeR2ResourceKey } from '@/lib/resources/r2-key';
import { isSupportedByteRange, validateRangeResponse } from '@/lib/resources/http-range';

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
  const requestStartedAt = Date.now();
  console.info('[resource-proxy] request started', {
    rangeRequested: Boolean(request.headers.get('range')),
  });
  try {
    const { searchParams } = new URL(request.url);
    const rawKey = searchParams.get('key') || searchParams.get('url');

    if (!rawKey) {
      return NextResponse.json(
        { success: false, error: 'Storage key or URL is required.' },
        { status: 400 }
      );
    }

    const key = normalizeR2ResourceKey(rawKey);
    if (!key) {
      return NextResponse.json({ success: false, error: 'Invalid storage key.' }, { status: 400 });
    }

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

    const client = getR2Client();
    const bucket = getR2BucketName();
    const rangeHeader = request.headers.get('range');
    if (rangeHeader && !isSupportedByteRange(rangeHeader)) {
      return new Response(null, { status: 416, headers: { 'Cache-Control': 'private, no-store' } });
    }
    const isDownload =
      searchParams.get('download') === '1' || searchParams.get('download') === 'true';

    // 2. Fetch object with optional Range header for audio/video streaming & seeking
    // Handle both raw key (e.g. courses/...) and bucket-prefixed key (e.g. syma-tech-resources/courses/...)
    let s3Response;
    const candidateKeys = [
      key,
      key.startsWith(`${bucket}/`) ? key.slice(bucket.length + 1) : `${bucket}/${key}`,
    ];

    let foundKey = key;
    for (const candidate of candidateKeys) {
      try {
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: candidate,
          ...(rangeHeader ? { Range: rangeHeader } : {}),
        });
        s3Response = await client.send(command);
        foundKey = candidate;
        break;
      } catch (s3Err: unknown) {
        const err = s3Err as { name?: string; $metadata?: { httpStatusCode?: number } };
        if (err.name === 'NoSuchKey' || err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
          continue;
        }
        throw s3Err;
      }
    }

    if (!s3Response || !s3Response.Body) {
      return NextResponse.json(
        { success: false, error: 'Resource object missing or not found in storage.' },
        { status: 404 }
      );
    }

    // Determine content type
    const ext = foundKey.split('.').pop()?.toLowerCase() || '';
    const contentType =
      MIME_TYPES[ext] || s3Response.ContentType || 'application/octet-stream';

    // Determine clean filename for attachment / inline header
    const rawFilename = foundKey.split('/').pop() || 'resource';
    // Remove UUID prefix if present: e.g. 17c06227-c85a-44af-8218-8a8bf5498cc8-myFile.pptx -> myFile.pptx
    const cleanFilename = rawFilename.replace(/^[0-9a-fA-F-]{36}-/, '');
    const encodedFilename = encodeURIComponent(cleanFilename);

    // Prevent download disposition on instructional media (PDF, Video, PPTX)
    const isRestrictedLearningMedia = ['pdf', 'mp4', 'webm', 'ogg', 'mov', 'm4v', 'pptx', 'ppt'].includes(ext);
    const dispositionType = (isDownload && !isRestrictedLearningMedia) ? 'attachment' : 'inline';
    const contentDisposition = `${dispositionType}; filename="${cleanFilename.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`;

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    const responseStatus = validateRangeResponse(
      rangeHeader,
      s3Response.$metadata?.httpStatusCode,
      s3Response.ContentRange,
      s3Response.ContentLength
    );
    if (responseStatus === null) {
      try {
        (s3Response.Body as { destroy?: () => void }).destroy?.();
      } catch {
        // Ignore stream cleanup errors while rejecting an invalid range response.
      }
      console.warn('[resource-proxy] Invalid upstream range response', {
        rangeRequested: Boolean(rangeHeader),
        status: s3Response.$metadata?.httpStatusCode ?? null,
        durationMs: Date.now() - requestStartedAt,
      });
      return NextResponse.json({ success: false, error: 'Unable to stream this resource safely.' }, { status: 502 });
    }
    if (responseStatus === 206) headers.set('Accept-Ranges', 'bytes');
    // Private caching is partitioned by the authenticated request cookie.
    headers.set('Cache-Control', 'private, max-age=3600');
    headers.set('Vary', 'Cookie');
    headers.set('Content-Disposition', contentDisposition);

    if (s3Response.ContentLength !== undefined) {
      headers.set('Content-Length', String(s3Response.ContentLength));
    }

    if (responseStatus === 206 && s3Response.ContentRange) {
      headers.set('Content-Range', s3Response.ContentRange);
    }

    // Convert AWS SDK stream to Web stream
    let webStream: ReadableStream;
    if (typeof (s3Response.Body as { transformToWebStream?: () => ReadableStream }).transformToWebStream === 'function') {
      webStream = (s3Response.Body as { transformToWebStream: () => ReadableStream }).transformToWebStream();
    } else if (s3Response.Body instanceof Readable) {
      webStream = Readable.toWeb(s3Response.Body) as ReadableStream;
    } else {
      webStream = s3Response.Body as unknown as ReadableStream;
    }

    console.info('[resource-proxy] upstream response ready', {
      status: responseStatus,
      rangeRequested: Boolean(rangeHeader),
      bytes: s3Response.ContentLength ?? null,
      durationMs: Date.now() - requestStartedAt,
    });

    let firstByteReported = false;
    const measuredStream = webStream.pipeThrough(new TransformStream({
      transform(chunk, controller) {
        if (!firstByteReported) {
          firstByteReported = true;
          console.info('[resource-proxy] first response byte', {
            durationMs: Date.now() - requestStartedAt,
            rangeRequested: Boolean(rangeHeader),
          });
        }
        controller.enqueue(chunk);
      },
    }));

    return new Response(measuredStream, {
      status: responseStatus,
      headers,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[resource-proxy] failed', {
      reason: error.name || 'Error',
      durationMs: Date.now() - requestStartedAt,
    });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to proxy storage resource.' },
      { status: 500 }
    );
  }
}
