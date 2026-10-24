import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyByteRangeResponseHeaders,
  getR2RangeOption,
  getUnsatisfiedContentRange,
  isSupportedByteRange,
  validateRangeResponse,
} from '../lib/resources/http-range';
import { normalizeR2ResourceKey, r2ReferenceMatchesKey } from '../lib/resources/r2-key';
import { isStudentAuthorizedForResource } from '../lib/resources/r2-access';
import { getCachedDocument, invalidateDocumentCache, setCachedDocument } from '../lib/resources/pdf-cache';

test('PDF cache refreshes recency and destroys replaced documents', () => {
  invalidateDocumentCache();
  const docs = Array.from({ length: 6 }, (_, index) => ({
    id: `doc-${index}`,
    numPages: 1,
    destroyed: false,
    destroy() { this.destroyed = true; },
  }));
  for (let index = 0; index < 5; index += 1) {
    setCachedDocument(`resource-${index}`, docs[index], 1);
  }
  assert.equal(getCachedDocument('resource-0')?.doc.id, 'doc-0');
  setCachedDocument('resource-5', docs[5], 1);
  assert.equal(getCachedDocument('resource-0')?.doc.id, 'doc-0');
  assert.equal(getCachedDocument('resource-1'), null);

  const replacement = { id: 'replacement', numPages: 1, destroyed: false, destroy() { this.destroyed = true; } };
  setCachedDocument('resource-0', replacement, 1);
  assert.equal(docs[0].destroyed, true);
  assert.equal(getCachedDocument('resource-0')?.doc.id, 'replacement');
  invalidateDocumentCache();
});

test('PDF proxy accepts only a single well-formed byte range', () => {
  assert.equal(isSupportedByteRange('bytes=0-65535'), true);
  assert.equal(isSupportedByteRange('bytes=65536-'), true);
  assert.equal(isSupportedByteRange('bytes=-1024'), true);
  assert.equal(isSupportedByteRange('bytes=12-4'), false);
  assert.equal(isSupportedByteRange('bytes=0-1,4-5'), false);
  assert.equal(isSupportedByteRange('bytes=-0'), false);
});

test('PDF proxy validates partial response headers and byte counts', () => {
  // Exact explicit range and one capped at the object's final byte.
  assert.equal(validateRangeResponse('bytes=0-9', 206, 'bytes 0-9/100', 10), 206);
  assert.equal(validateRangeResponse('bytes=10-19', 206, 'bytes 10-19/100', 10), 206);
  assert.equal(validateRangeResponse('bytes=90-120', 206, 'bytes 90-99/100', 10), 206);

  // Open-ended and suffix ranges must extend through the object's last byte.
  assert.equal(validateRangeResponse('bytes=90-', 206, 'bytes 90-99/100', 10), 206);
  assert.equal(validateRangeResponse('bytes=-10', 206, 'bytes 90-99/100', 10), 206);
  assert.equal(validateRangeResponse('bytes=-150', 206, 'bytes 0-99/100', 100), 206);

  // A partial upstream interval is not a valid answer when requested bytes remain.
  assert.equal(validateRangeResponse('bytes=10-19', 206, 'bytes 10-14/100', 5), null);
  assert.equal(validateRangeResponse('bytes=10-', 206, 'bytes 10-98/100', 89), null);
  assert.equal(validateRangeResponse('bytes=-10', 206, 'bytes 90-98/100', 9), null);
  assert.equal(validateRangeResponse('bytes=90-120', 206, 'bytes 90-100/100', 11), null);

  // Existing malformed, contradictory, unsatisfiable, and inconsistent cases.
  assert.equal(validateRangeResponse('bytes=0-9', 206, 'bytes 1-10/100', 10), null);
  assert.equal(validateRangeResponse('bytes=0-9', 206, 'bytes 0-9/100', 9), null);
  assert.equal(validateRangeResponse('bytes=0-9', 206, undefined, 10), null);
  assert.equal(validateRangeResponse('bytes=0-9', 206, '', 10), null);
  assert.equal(validateRangeResponse('bytes=0-9', 206, 'not a content range', 10), null);
  assert.equal(validateRangeResponse('bytes=0-9', 206, 'bytes 0-9/9', 10), null);
  assert.equal(validateRangeResponse('bytes=10-9', 206, 'bytes 10-19/100', 10), null);
  assert.equal(validateRangeResponse('bytes=100-', 206, 'bytes 100-109/1000', 10), null);
  assert.equal(validateRangeResponse('bytes=-0', 206, 'bytes 0-99/100', 100), null);
  assert.equal(validateRangeResponse('bytes=0-9', 206, 'bytes 0-9/9007199254740992', 10), null);
  assert.equal(validateRangeResponse('bytes=0-9', 206, 'bytes 0-9/100', Number.NaN), null);
  assert.equal(validateRangeResponse('bytes=0-9', 200, undefined, 100), null);
  assert.equal(validateRangeResponse(null, 200, undefined, 100), 200);
});

test('PDF proxy advertises range support only when the R2 path supports it', () => {
  const fullResponseHeaders = new Headers({ 'Content-Type': 'application/pdf' });
  applyByteRangeResponseHeaders(fullResponseHeaders, {
    rangeSupported: true,
    status: 200,
    contentLength: 100,
  });
  assert.equal(fullResponseHeaders.get('Accept-Ranges'), 'bytes');
  assert.equal(fullResponseHeaders.get('Content-Length'), '100');
  assert.equal(fullResponseHeaders.get('Content-Type'), 'application/pdf');

  const unsupportedHeaders = new Headers();
  applyByteRangeResponseHeaders(unsupportedHeaders, {
    rangeSupported: false,
    status: 200,
    contentLength: 100,
  });
  assert.equal(unsupportedHeaders.has('Accept-Ranges'), false);
});

test('PDF proxy forwards ranges and returns validated partial headers', () => {
  assert.deepEqual(getR2RangeOption('bytes=10-19'), { Range: 'bytes=10-19' });
  assert.deepEqual(getR2RangeOption(null), {});

  const headers = new Headers({ 'Content-Type': 'application/pdf' });
  applyByteRangeResponseHeaders(headers, {
    rangeSupported: true,
    status: 206,
    contentRange: 'bytes 10-19/100',
    contentLength: 10,
  });
  assert.equal(headers.get('Accept-Ranges'), 'bytes');
  assert.equal(headers.get('Content-Range'), 'bytes 10-19/100');
  assert.equal(headers.get('Content-Length'), '10');
});

test('PDF proxy preserves safe 416 handling for invalid and unsatisfiable ranges', () => {
  assert.equal(isSupportedByteRange('bytes=invalid'), false);
  assert.equal(validateRangeResponse('bytes=100-', 416, undefined, undefined), null);
  assert.equal(getUnsatisfiedContentRange({ $response: { headers: { 'content-range': 'bytes */100' } } }), 'bytes */100');
  assert.equal(getUnsatisfiedContentRange({ $response: { headers: { 'content-range': 'bytes 0-9/100' } } }), null);
});

test('student access fails closed for unknown resources and non-enrolled students', () => {
  assert.equal(isStudentAuthorizedForResource([], ['course-1']), false);
  assert.equal(isStudentAuthorizedForResource(['course-private'], ['course-other']), false);
  assert.equal(isStudentAuthorizedForResource(['course-private'], []), false);
  assert.equal(isStudentAuthorizedForResource(['course-private'], ['course-private']), true);
});

test('R2 keys reject traversal, encoded separators, and ambiguous paths', () => {
  assert.equal(normalizeR2ResourceKey('courses/course-1/lesson.pdf'), 'courses/course-1/lesson.pdf');
  assert.equal(normalizeR2ResourceKey('r2://courses/course-1/lesson.pdf'), 'courses/course-1/lesson.pdf');
  assert.equal(normalizeR2ResourceKey('https://account.r2.cloudflarestorage.com/courses/course-1/lesson.pdf'), 'courses/course-1/lesson.pdf');
  assert.equal(normalizeR2ResourceKey('courses/../private.pdf'), null);
  assert.equal(normalizeR2ResourceKey('courses/%2e%2e/private.pdf'), null);
  assert.equal(normalizeR2ResourceKey('/courses/private.pdf'), null);
  assert.equal(normalizeR2ResourceKey('courses//private.pdf'), null);
  assert.equal(r2ReferenceMatchesKey('courses/course-1/slide.pdf', 'courses/course-1/slide.pdf'), true);
  assert.equal(r2ReferenceMatchesKey('courses/other/course-1/slide.pdf', 'courses/course-1/slide.pdf'), false);
  assert.equal(r2ReferenceMatchesKey(null, 'courses/course-1/slide.pdf'), false);
});
