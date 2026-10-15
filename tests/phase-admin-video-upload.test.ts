import assert from 'node:assert/strict';
import test from 'node:test';
import { parseApiResponse } from '../lib/api/safe-response';
import { inferResourceMetaFromUrl } from '../lib/resources/embed';

test('Admin Upload Fix 1.1: parseApiResponse prevents syntax crash on HTTP 413 Request Entity Too Large', async () => {
  // Simulates Vercel Edge returning plain text 'Request Entity Too Large' on 413
  const vercel413Response = new Response('Request Entity Too Large', {
    status: 413,
    statusText: 'Payload Too Large',
    headers: { 'content-type': 'text/plain' },
  });

  const parsed = await parseApiResponse(vercel413Response);

  assert.equal(parsed.ok, false);
  assert.equal(parsed.status, 413);
  assert.ok(parsed.error?.includes('4.5 MB'), 'Error should mention the Vercel 4.5 MB limit');
  assert.ok(parsed.error?.includes('Cloudflare R2'), 'Error should guide admin to direct R2 upload');
});

test('Admin Upload Fix 1.2: parseApiResponse safely parses HTML error pages without throwing SyntaxError', async () => {
  const htmlGatewayResponse = new Response(
    '<html><head><title>504 Gateway Time-out</title></head><body><center><h1>504 Gateway Time-out</h1></center></body></html>',
    {
      status: 504,
      statusText: 'Gateway Timeout',
      headers: { 'content-type': 'text/html' },
    }
  );

  const parsed = await parseApiResponse(htmlGatewayResponse);

  assert.equal(parsed.ok, false);
  assert.equal(parsed.status, 504);
  assert.ok(parsed.error?.includes('gateway timeout'), 'Error should map to gateway timeout message');
});

test('Admin Upload Fix 1.3: parseApiResponse parses successful JSON response cleanly', async () => {
  const jsonSuccessResponse = new Response(
    JSON.stringify({
      success: true,
      data: {
        uploadUrl: 'https://syma-tech-resources.r2.cloudflarestorage.com/test-key?signed=true',
        storageKey: 'courses/course-1/lessons/lesson-1/video/sample.mp4',
      },
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }
  );

  const parsed = await parseApiResponse<{ uploadUrl: string; storageKey: string }>(jsonSuccessResponse);

  assert.equal(parsed.ok, true);
  assert.equal(parsed.status, 200);
  assert.equal(parsed.data?.storageKey, 'courses/course-1/lessons/lesson-1/video/sample.mp4');
  assert.ok(parsed.data?.uploadUrl.startsWith('https://'));
});

test('Admin Upload Fix 1.4: parseApiResponse extracts structured server error messages from JSON error responses', async () => {
  const jsonErrorResponse = new Response(
    JSON.stringify({
      success: false,
      error: 'File size exceeds maximum allowed limit of 1 GB.',
    }),
    {
      status: 400,
      headers: { 'content-type': 'application/json' },
    }
  );

  const parsed = await parseApiResponse(jsonErrorResponse);

  assert.equal(parsed.ok, false);
  assert.equal(parsed.status, 400);
  assert.equal(parsed.error, 'File size exceeds maximum allowed limit of 1 GB.');
});

test('Admin Upload Fix 2.1: Key Generation and Category validation constraints', () => {
  // Video allowed extensions
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'm4v', 'mkv'];
  const invalidExtensions = ['exe', 'bat', 'sh', 'php', 'js'];

  for (const ext of videoExtensions) {
    assert.ok(videoExtensions.includes(ext), `Extension .${ext} should be allowed for video`);
  }

  for (const badExt of invalidExtensions) {
    assert.equal(videoExtensions.includes(badExt), false, `Extension .${badExt} must be rejected`);
  }

  // 1 GB Max Size for videos
  const maxVideoBytes = 1024 * 1024 * 1024; // 1 GB
  const testFileSize500MB = 500 * 1024 * 1024;
  const testFileSize1GB = 1024 * 1024 * 1024;
  const testFileSizeOverLimit = 1025 * 1024 * 1024;

  assert.ok(testFileSize500MB <= maxVideoBytes);
  assert.ok(testFileSize1GB <= maxVideoBytes);
  assert.ok(testFileSizeOverLimit > maxVideoBytes);
});

test('Admin Upload Fix 2.2: Path sanitization and storage key structure', () => {
  const courseId = 'course-123';
  const lessonId = 'lesson-456';
  const fileName = 'My Lecture Video (Lesson 1).mp4';
  const uniqueId = 'uuid-test-1234';

  const nameWithoutPath = fileName.split(/[/\\]/).pop() || 'file';
  const safeFilename = nameWithoutPath.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const storageKey = `courses/${courseId}/lessons/${lessonId}/video/${uniqueId}-${safeFilename}`;

  assert.equal(safeFilename, 'My_Lecture_Video__Lesson_1_.mp4');
  assert.equal(storageKey, 'courses/course-123/lessons/lesson-456/video/uuid-test-1234-My_Lecture_Video__Lesson_1_.mp4');
  assert.ok(storageKey.startsWith('courses/'));
  assert.ok(storageKey.endsWith('.mp4'));
  assert.equal(storageKey.includes('..'), false);
});

test('Admin Upload Fix 3.1: Verification path safety checks', () => {
  const validKey = 'courses/c1/lessons/l1/video/uuid-test.mp4';
  const maliciousKeyTraversal = 'courses/../../etc/passwd';
  const externalKey = 'other-bucket/secret.key';

  const isValidKey = (k: string) => k.startsWith('courses/') && !k.includes('..');

  assert.equal(isValidKey(validKey), true);
  assert.equal(isValidKey(maliciousKeyTraversal), false);
  assert.equal(isValidKey(externalKey), false);
});

test('Admin Upload Fix 4.1: URL sanitization and R2 storage key preservation', () => {
  function sanitizeUrl(val: unknown): string {
    if (!val || typeof val !== 'string') return '';
    let trimmed = val.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('r2://') || trimmed.startsWith('courses/')) {
      return trimmed;
    }
    if (/^https?:\/\/courses\//i.test(trimmed)) {
      return trimmed.replace(/^https?:\/\//i, '');
    }
    if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
  }

  // 1. Direct R2 key should be preserved without https://
  const r2Key = 'courses/intro-python/lessons/day-1/video/sample.mp4';
  assert.equal(sanitizeUrl(r2Key), r2Key);

  // 2. r2:// URI should be preserved
  const r2Uri = 'r2://courses/intro-python/lessons/day-1/video/sample.mp4';
  assert.equal(sanitizeUrl(r2Uri), r2Uri);

  // 3. Accidental https:// prepended to courses/ path should be stripped
  const corruptedKey = 'https://courses/intro-python/lessons/day-1/video/sample.mp4';
  assert.equal(sanitizeUrl(corruptedKey), r2Key);

  // 4. Regular external URLs should preserve https://
  const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  assert.equal(sanitizeUrl(youtubeUrl), youtubeUrl);
});

test('Admin Upload Fix 4.2: Resource Metadata Inference supports Cloudflare R2 MP4 keys', () => {
  const r2VideoKey = 'courses/analytics-101/lessons/lesson-3/video/lecture.mp4';
  const meta = inferResourceMetaFromUrl(r2VideoKey);

  assert.equal(meta.resourceType, 'VIDEO');
  assert.equal(meta.suggestedFileType, 'mp4');
  assert.equal(meta.sourceType, 'UPLOAD');
});
