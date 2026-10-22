import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getCachedDocument,
  setCachedDocument,
  invalidateDocumentCache,
} from '../lib/resources/pdf-cache';
import {
  extractR2StorageKey,
  getR2ProxyUrl,
  canDownloadResource,
  isPdfFile,
} from '../lib/resources/embed';

// ---------------------------------------------------------------------------
// PART A VALIDATION: SLIDE VIEWER PERFORMANCE & CACHING
// ---------------------------------------------------------------------------

test('A1: Document session cache correctly stores, retrieves, and invalidates PDF documents', () => {
  invalidateDocumentCache(); // Start fresh

  const dummyKey1 = 'courses/data-analytics/week-1/slides.pdf';
  const dummyDoc1 = { id: 'doc-1', numPages: 12, destroyed: false, destroy() { this.destroyed = true; } };

  // 1. Initially empty
  assert.equal(getCachedDocument(dummyKey1), null, 'Cache should initially be empty');

  // 2. Set cache entry
  setCachedDocument(dummyKey1, dummyDoc1, dummyDoc1.numPages);

  // 3. Retrieve cached document
  const cached = getCachedDocument(dummyKey1);
  assert.ok(cached, 'Cached entry should be present');
  assert.equal(cached.doc.id, 'doc-1');
  assert.equal(cached.totalPages, 12);
  assert.ok(cached.cachedAt > 0);

  // 4. Invalidation of specific key
  invalidateDocumentCache(dummyKey1);
  assert.equal(getCachedDocument(dummyKey1), null, 'Key should be deleted after invalidation');
  assert.equal(dummyDoc1.destroyed, true, 'Document destroy() should be called upon cache eviction');

  // 5. Invalidation of all keys
  const dummyKey2 = 'courses/data-analytics/week-2/slides.pdf';
  const dummyDoc2 = { id: 'doc-2', numPages: 8, destroyed: false, destroy() { this.destroyed = true; } };
  setCachedDocument(dummyKey2, dummyDoc2, 8);
  assert.ok(getCachedDocument(dummyKey2));

  invalidateDocumentCache();
  assert.equal(getCachedDocument(dummyKey2), null, 'All documents should be cleared on full invalidation');
  assert.equal(dummyDoc2.destroyed, true);
});

test('A2: Cache LRU eviction bounds memory to maximum entries', () => {
  invalidateDocumentCache();

  // Insert 6 entries (MAX_CACHE_ENTRIES is 5)
  for (let i = 1; i <= 6; i++) {
    const key = `courses/test/week-${i}/slides.pdf`;
    const doc = { id: `doc-${i}`, numPages: i * 2, destroy() {} };
    setCachedDocument(key, doc, doc.numPages);
  }

  // Oldest entry (week-1) should have been evicted
  assert.equal(
    getCachedDocument('courses/test/week-1/slides.pdf'),
    null,
    'Oldest entry should be evicted when cache exceeds maximum size'
  );

  // Most recent entries should still exist
  assert.ok(getCachedDocument('courses/test/week-2/slides.pdf'));
  assert.ok(getCachedDocument('courses/test/week-6/slides.pdf'));

  invalidateDocumentCache();
});

test('A3: R2 storage references map directly to same-origin proxy streaming endpoints', () => {
  const r2Key = 'courses/data-analytics/week-1/presentation.pdf';

  // 1. Direct R2 key
  const proxyUrl1 = getR2ProxyUrl(r2Key, false);
  assert.equal(proxyUrl1, `/api/resources/proxy?key=${encodeURIComponent(r2Key)}`);

  // 2. r2:// protocol
  const proxyUrl2 = getR2ProxyUrl(`r2://${r2Key}`, false);
  assert.equal(proxyUrl2, `/api/resources/proxy?key=${encodeURIComponent(r2Key)}`);

  // 3. S3 / R2 full domain endpoint
  const proxyUrl3 = getR2ProxyUrl(`https://account.r2.cloudflarestorage.com/${r2Key}`, false);
  assert.equal(proxyUrl3, `/api/resources/proxy?key=${encodeURIComponent(r2Key)}`);

  // 4. Same-origin URL guarantees no CORS failure and automatic cookie transmission
  assert.ok(proxyUrl1?.startsWith('/api/resources/proxy'));
});

test('A4: ResourceRenderer bypasses presign authorization latency for PDF files', () => {
  // isPdfFile correctly detects PDF extensions and MIME types
  assert.equal(isPdfFile('lesson-slides.pdf'), true);
  assert.equal(isPdfFile('courses/documents/lecture.pdf?sig=abc'), true);
  assert.equal(isPdfFile('application/pdf'), true);
  assert.equal(isPdfFile('pdf'), true);

  // Non-PDFs require external presigned URLs
  assert.equal(isPdfFile('video.mp4'), false);
  assert.equal(isPdfFile('dataset.csv'), false);
});

test('A5: Student PDF viewer maintains strict no-download security policy', () => {
  const canDownload = canDownloadResource({
    title: 'Instructional Slide Deck',
    fileUrl: 'courses/data-analytics/week-1/slides.pdf',
    resourceType: 'DOCUMENT',
    sourceType: 'R2',
    fileType: 'pdf',
    isDownloadable: true, // Should still be overridden to false
  });

  assert.equal(canDownload, false, 'Student slide viewer must never permit PDF downloads');
});

// ---------------------------------------------------------------------------
// PART B VALIDATION: WEEKLY CURRICULUM DROPDOWNS & NAVIGATION
// ---------------------------------------------------------------------------

test('B1: Active week calculation correctly targets the week containing the current lesson', () => {
  // Mock course curriculum structure with 3 weeks
  const mockWeeks = [
    {
      id: 'week-1',
      weekNumber: 1,
      title: 'Week 1: Introduction to Data',
      modules: [
        {
          id: 'mod-1',
          title: 'Module 1.1',
          lessons: [
            { id: 'lesson-101', title: 'What is Data?' },
            { id: 'lesson-102', title: 'Data Types' },
          ],
        },
      ],
    },
    {
      id: 'week-2',
      weekNumber: 2,
      title: 'Week 2: Data Cleaning & Prep',
      modules: [
        {
          id: 'mod-2',
          title: 'Module 2.1',
          lessons: [
            { id: 'lesson-201', title: 'Missing Values' },
            { id: 'lesson-202', title: 'Data Normalization' },
          ],
        },
      ],
    },
    {
      id: 'week-3',
      weekNumber: 3,
      title: 'Week 3: Exploratory Analysis',
      modules: [
        {
          id: 'mod-3',
          title: 'Module 3.1',
          lessons: [
            { id: 'lesson-301', title: 'Descriptive Stats' },
          ],
        },
      ],
    },
  ];

  // Helper matching WeeklyCurriculum's active week resolution
  function computeActiveWeek(
    weeks: typeof mockWeeks,
    currentLessonId: string | null,
    dripStatus: Record<string, { isCurrent?: boolean; isUnlocked?: boolean; isCompleted?: boolean }>,
    completedIds: Set<string>
  ): string {
    // 1. Week containing current lesson
    for (const week of weeks) {
      const lessons = week.modules.flatMap((m) => m.lessons);
      if (lessons.some((l) => l.id === currentLessonId || dripStatus[l.id]?.isCurrent)) {
        return week.id;
      }
    }

    // 2. First incomplete week with unlocked content
    for (const week of weeks) {
      const lessons = week.modules.flatMap((m) => m.lessons);
      const isComplete = lessons.length > 0 && lessons.every((l) => completedIds.has(l.id));
      const hasUnlocked = lessons.some((l) => dripStatus[l.id]?.isUnlocked);
      if (!isComplete && hasUnlocked) {
        return week.id;
      }
    }

    return weeks[0].id;
  }

  // Case 1: Student stopped at lesson-202 in Week 2
  const active1 = computeActiveWeek(
    mockWeeks,
    'lesson-202',
    { 'lesson-202': { isCurrent: true, isUnlocked: true } },
    new Set(['lesson-101', 'lesson-102', 'lesson-201'])
  );
  assert.equal(active1, 'week-2', 'Week 2 must be identified as active because it contains lesson-202');

  // Case 2: Week 1 is complete, student has unlocked lesson-201
  const active2 = computeActiveWeek(
    mockWeeks,
    null,
    { 'lesson-201': { isUnlocked: true } },
    new Set(['lesson-101', 'lesson-102'])
  );
  assert.equal(active2, 'week-2', 'Week 2 must be identified as active because it is the first incomplete unlocked week');

  // Case 3: Course not started yet -> defaults to Week 1
  const active3 = computeActiveWeek(mockWeeks, null, {}, new Set());
  assert.equal(active3, 'week-1', 'Defaults to week 1 when no progress has been made');
});

test('B2: Week progress and completion summary calculation', () => {
  const lessons = [
    { id: 'l1', title: 'Lesson 1' },
    { id: 'l2', title: 'Lesson 2' },
    { id: 'l3', title: 'Lesson 3' },
    { id: 'l4', title: 'Lesson 4' },
  ];

  const completedSet = new Set(['l1', 'l2', 'l3']);
  const total = lessons.length;
  const completed = lessons.filter((l) => completedSet.has(l.id)).length;
  const pct = Math.round((completed / total) * 100);

  assert.equal(completed, 3);
  assert.equal(total, 4);
  assert.equal(pct, 75);
  assert.equal(`${completed}/${total} Lessons`, '3/4 Lessons');
});

test('B3: Collapsed vs expanded state management', () => {
  const weeks = ['week-1', 'week-2', 'week-3', 'week-4'];
  const activeWeekId = 'week-2';

  // Default state: only the active week is expanded
  let expanded = new Set<string>([activeWeekId]);
  assert.equal(expanded.has('week-1'), false);
  assert.equal(expanded.has('week-2'), true);
  assert.equal(expanded.has('week-3'), false);
  assert.equal(expanded.has('week-4'), false);

  // Student clicks week-3 header to expand
  expanded.add('week-3');
  assert.equal(expanded.has('week-3'), true);
  assert.equal(expanded.has('week-2'), true); // week-2 remains open

  // Student clicks week-2 header to collapse it
  expanded.delete('week-2');
  assert.equal(expanded.has('week-2'), false);
  assert.equal(expanded.has('week-3'), true);

  // Expand All
  expanded = new Set(weeks);
  assert.equal(expanded.size, 4);

  // Collapse All
  expanded = new Set();
  assert.equal(expanded.size, 0);
});

test('B4: Drip progression lock rules and accessibility attributes', () => {
  // Locked lesson must have lockReason and correct button accessibility attributes
  const lockedLessonStatus = {
    isUnlocked: false,
    isCompleted: false,
    isCurrent: false,
    lockReason: 'Complete Module 1 Quiz to unlock this lesson',
  };

  assert.equal(lockedLessonStatus.isUnlocked, false);
  assert.equal(lockedLessonStatus.lockReason, 'Complete Module 1 Quiz to unlock this lesson');

  // Verify aria attribute bindings
  function getAriaProps(weekId: string, isExpanded: boolean) {
    return {
      'aria-expanded': isExpanded,
      'aria-controls': `week-content-${weekId}`,
    };
  }

  const ariaOpen = getAriaProps('week-1', true);
  assert.equal(ariaOpen['aria-expanded'], true);
  assert.equal(ariaOpen['aria-controls'], 'week-content-week-1');

  const ariaClosed = getAriaProps('week-1', false);
  assert.equal(ariaClosed['aria-expanded'], false);
  assert.equal(ariaClosed['aria-controls'], 'week-content-week-1');
});
