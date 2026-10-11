import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth/session';
import { getCurrentStudent } from '@/lib/auth/student-session';
import { storageService } from '@/lib/storage';
import { extractR2StorageKey } from '@/lib/resources/embed';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawKey = searchParams.get('key') || searchParams.get('url');

    if (!rawKey) {
      return NextResponse.json({ success: false, error: 'Storage key or URL is required.' }, { status: 400 });
    }

    const key =
      extractR2StorageKey(rawKey) ||
      rawKey.replace(/^r2:\/\//i, '').replace(/^https?:\/\/courses\//i, 'courses/');

    // 1. Authenticate (Admin or Student)
    const admin = await getCurrentAdmin();
    const student = !admin ? await getCurrentStudent() : null;

    if (!admin && !student) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    }

    // 2. Verify object exists in bucket
    const exists = await storageService.exists(key);
    if (!exists) {
      return NextResponse.json(
        { success: false, error: 'Storage object missing in R2 bucket.' },
        { status: 404 }
      );
    }

    // 3. Generate presigned URL and fetch binary object server-side
    const signedUrl = await storageService.getSignedUrl(key, 300);
    const r2Response = await fetch(signedUrl);

    if (!r2Response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch object from storage (HTTP ${r2Response.status}).` },
        { status: 502 }
      );
    }

    const arrayBuffer = await r2Response.arrayBuffer();
    const ext = key.split('.').pop()?.toLowerCase();

    let contentType = 'application/octet-stream';
    if (ext === 'pptx') {
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (ext === 'ppt') {
      contentType = 'application/vnd.ms-powerpoint';
    } else if (ext === 'pdf') {
      contentType = 'application/pdf';
    } else if (r2Response.headers.get('content-type')) {
      contentType = r2Response.headers.get('content-type')!;
    }

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(arrayBuffer.byteLength),
        'Cache-Control': 'private, max-age=3600',
      },
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
