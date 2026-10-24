import assert from 'node:assert/strict';
import test from 'node:test';
import { isSupportedByteRange, validateRangeResponse } from '../lib/resources/http-range';
import { normalizeR2ResourceKey, r2ReferenceMatchesKey } from '../lib/resources/r2-key';
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
  assert.equal(validateRangeResponse('bytes=0-9', 206, 'bytes 0-9/100', 10), 206);
  assert.equal(validateRangeResponse('bytes=10-19', 206, 'bytes 10-19/100', 10), 206);
  assert.equal(validateRangeResponse('bytes=90-120', 206, 'bytes 90-99/100', 10), 206);
  assert.equal(validateRangeResponse('bytes=90-', 206, 'bytes 90-99/100', 10), 206);
  assert.equal(validateRangeResponse('bytes=-10', 206, 'bytes 90-99/100', 10), 206);
  assert.equal(validateRangeResponse('bytes=-150', 206, 'bytes 0-99/100', 100), 206);
  assert.equal(validateRangeResponse('bytes=10-19', 206, 'bytes 10-14/100', 5), null);
  assert.equal(validateRangeResponse('bytes=10-', 206, 'bytes 10-98/100', 89), null);
  assert.equal(validateRangeResponse('bytes=-10', 206, 'bytes 90-98/100', 9), null);
  assert.equal(validateRangeResponse('bytes=90-120', 206, 'bytes 90-100/100', 11), null);
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
  assert.equal(validateRangeResponse('bytes=0-9', 200, undefined, 100), 200);
  assert.equal(validateRangeResponse(null, 200, undefined, 100), 200);
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
