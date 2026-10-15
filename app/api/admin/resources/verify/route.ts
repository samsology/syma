import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { r2Storage } from '@/lib/storage/r2Storage';

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const { storageKey, expectedSize, expectedType, courseId, lessonId } = body;

    if (!storageKey || typeof storageKey !== 'string') {
      return NextResponse.json({ success: false, error: 'storageKey is required.' }, { status: 400 });
    }

    // Security check: storageKey must be in the expected courses/ folder structure
    if (!storageKey.startsWith('courses/') || storageKey.includes('..')) {
      return NextResponse.json({ success: false, error: 'Invalid storage key path.' }, { status: 400 });
    }

    // Verify object exists in Cloudflare R2
    const metadata = await r2Storage.getMetadata(storageKey);
    if (!metadata) {
      return NextResponse.json({
        success: false,
        error: 'The uploaded file was not found in Cloudflare R2 storage. Direct upload may have failed or timed out.',
      }, { status: 404 });
    }

    // Ensure file is non-empty
    if (metadata.size === undefined || metadata.size === null || metadata.size <= 0) {
      return NextResponse.json({
        success: false,
        error: 'The uploaded file in Cloudflare R2 is empty (0 bytes).',
      }, { status: 400 });
    }

    // Plausible size check (up to 1 GB limit)
    const MAX_ALLOWED_BYTES = 1024 * 1024 * 1024;
    if (metadata.size > MAX_ALLOWED_BYTES) {
      return NextResponse.json({
        success: false,
        error: 'Uploaded object size exceeds maximum allowed limit of 1 GB.',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        storageKey,
        key: storageKey,
        fileUrl: `r2://${storageKey}`,
        size: metadata.size,
        contentType: metadata.contentType,
        etag: metadata.etag,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error verifying R2 upload:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify uploaded resource.' },
      { status: 500 }
    );
  }
}
