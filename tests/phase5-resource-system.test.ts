import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseYouTubeId,
  buildYouTubeEmbedUrl,
  parseGoogleDriveEmbedUrl,
  isSafeEmbedUrl,
  getResourceEmbedDescriptor,
  inferResourceMetaFromUrl,
} from '../lib/resources/embed';
import {
  resourceSchema,
  resourceTypeSchema,
  resourceSourceSchema,
} from '../lib/validation/resource';
import { calculateModuleProgress, summarizeLessonProgress } from '../lib/student-course/progress';

// ---------------------------------------------------------------------------
// 1. YouTube URL Parser & Embed Generator
// ---------------------------------------------------------------------------
test('Phase 5.1: YouTube URL parser extracts IDs and timestamps across valid formats', () => {
  // Standard desktop link
  const standard = parseYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.ok(standard);
  assert.equal(standard?.videoId, 'dQw4w9WgXcQ');
  assert.equal(standard?.startSeconds, undefined);

  // Short URL
  const short = parseYouTubeId('https://youtu.be/dQw4w9WgXcQ');
  assert.ok(short);
  assert.equal(short?.videoId, 'dQw4w9WgXcQ');

  // Embed URL
  const embed = parseYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ');
  assert.ok(embed);
  assert.equal(embed?.videoId, 'dQw4w9WgXcQ');

  // Mobile link with timestamp
  const mobileWithTime = parseYouTubeId('https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=1m30s');
  assert.ok(mobileWithTime);
  assert.equal(mobileWithTime?.videoId, 'dQw4w9WgXcQ');
  assert.equal(mobileWithTime?.startSeconds, 90);

  // Timestamp parameter in seconds
  const withSeconds = parseYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&start=120');
  assert.ok(withSeconds);
  assert.equal(withSeconds?.videoId, 'dQw4w9WgXcQ');
  assert.equal(withSeconds?.startSeconds, 120);

  // YouTube live stream URL
  const liveStream = parseYouTubeId('https://www.youtube.com/live/dQw4w9WgXcQ');
  assert.ok(liveStream);
  assert.equal(liveStream?.videoId, 'dQw4w9WgXcQ');

  // YouTube playlist URL
  const playlistOnly = parseYouTubeId('https://www.youtube.com/playlist?list=PLMtHAcoMj2Pk');
  assert.ok(playlistOnly);
  assert.equal(playlistOnly?.playlistId, 'PLMtHAcoMj2Pk');
  assert.equal(playlistOnly?.videoId, undefined);

  // YouTube video with playlist
  const videoWithList = parseYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLMtHAcoMj2Pk');
  assert.ok(videoWithList);
  assert.equal(videoWithList?.videoId, 'dQw4w9WgXcQ');
  assert.equal(videoWithList?.playlistId, 'PLMtHAcoMj2Pk');

  // Secure embed URL generation (single video)
  const embedUrl = buildYouTubeEmbedUrl('dQw4w9WgXcQ', 90);
  assert.equal(
    embedUrl,
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&playsinline=1&start=90'
  );

  // Secure embed URL generation (playlist only)
  const playlistEmbedUrl = buildYouTubeEmbedUrl(undefined, undefined, 'PLMtHAcoMj2Pk');
  assert.equal(
    playlistEmbedUrl,
    'https://www.youtube-nocookie.com/embed/videoseries?list=PLMtHAcoMj2Pk&rel=0&modestbranding=1&playsinline=1'
  );

  // Secure embed URL generation (video with playlist)
  const videoListEmbed = buildYouTubeEmbedUrl('dQw4w9WgXcQ', undefined, 'PLMtHAcoMj2Pk');
  assert.equal(
    videoListEmbed,
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&playsinline=1&list=PLMtHAcoMj2Pk'
  );

  // Invalid formats rejected
  assert.equal(parseYouTubeId('https://example.com/video'), null);
  assert.equal(parseYouTubeId('not-a-url'), null);
  assert.equal(parseYouTubeId('https://youtube.com/watch?v=invalid_short_id'), null);
});

// ---------------------------------------------------------------------------
// 2. Google Drive / Slides / Docs Parser
// ---------------------------------------------------------------------------
test('Phase 5.2: Google Drive & Slides parser transforms URLs to in-portal embed preview URLs', () => {
  // Google Slides edit link
  const slideEdit = parseGoogleDriveEmbedUrl(
    'https://docs.google.com/presentation/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#slide=id.p'
  );
  assert.ok(slideEdit);
  assert.equal(slideEdit?.kind, 'slide');
  assert.equal(
    slideEdit?.embedUrl,
    'https://docs.google.com/presentation/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/embed?start=false&loop=false&delayms=3000'
  );

  // Google Drive File preview
  const driveFile = parseGoogleDriveEmbedUrl(
    'https://drive.google.com/file/d/1AbC2DeF3GhI/view?usp=sharing'
  );
  assert.ok(driveFile);
  assert.equal(driveFile?.kind, 'file');
  assert.equal(driveFile?.embedUrl, 'https://drive.google.com/file/d/1AbC2DeF3GhI/preview');

  // Google Document preview
  const docFile = parseGoogleDriveEmbedUrl(
    'https://docs.google.com/document/d/1DocId123456/edit'
  );
  assert.ok(docFile);
  assert.equal(docFile?.kind, 'doc');
  assert.equal(docFile?.embedUrl, 'https://docs.google.com/document/d/1DocId123456/preview');

  // Non-google URLs
  assert.equal(parseGoogleDriveEmbedUrl('https://vimeo.com/123456'), null);
});

// ---------------------------------------------------------------------------
// 3. Iframe Source Security & Domain Whitelist
// ---------------------------------------------------------------------------
test('Phase 5.3: isSafeEmbedUrl strictly enforces approved domains and rejects arbitrary iframes', () => {
  assert.equal(isSafeEmbedUrl('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'), true);
  assert.equal(isSafeEmbedUrl('https://docs.google.com/presentation/d/123/embed'), true);
  assert.equal(isSafeEmbedUrl('https://drive.google.com/file/d/123/preview'), true);
  assert.equal(isSafeEmbedUrl('/assets/sample-slide.pdf'), true);

  // Unapproved domains rejected
  assert.equal(isSafeEmbedUrl('https://evil-site.com/embed'), false);
  assert.equal(isSafeEmbedUrl('https://phishing.xyz/player'), false);
  assert.equal(isSafeEmbedUrl('http://insecure-http.com'), false);
  assert.equal(isSafeEmbedUrl('javascript:alert(1)'), false);
});

// ---------------------------------------------------------------------------
// 4. Extended Resource Validation Schema
// ---------------------------------------------------------------------------
test('Phase 5.4: resourceSchema validates all 4 ResourceTypes and ResourceSources with safe defaults', () => {
  assert.ok(resourceTypeSchema.safeParse('VIDEO').success);
  assert.ok(resourceTypeSchema.safeParse('DOCUMENT').success);
  assert.ok(resourceTypeSchema.safeParse('FILE').success);
  assert.ok(resourceTypeSchema.safeParse('LINK').success);

  assert.ok(resourceSourceSchema.safeParse('YOUTUBE').success);
  assert.ok(resourceSourceSchema.safeParse('GOOGLE_DRIVE').success);
  assert.ok(resourceSourceSchema.safeParse('UPLOAD').success);
  assert.ok(resourceSourceSchema.safeParse('EXTERNAL').success);

  // Full rich resource payload
  const fullResource = resourceSchema.safeParse({
    name: 'Hands-on Data Cleansing Walkthrough',
    description: 'Practical guide for handling missing values and outliers in pandas.',
    resourceType: 'VIDEO',
    sourceType: 'YOUTUBE',
    fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    fileType: 'youtube',
    sortOrder: 1,
    isDownloadable: false,
    isActive: true,
  });
  assert.ok(fullResource.success);
  if (fullResource.success) {
    assert.equal(fullResource.data.resourceType, 'VIDEO');
    assert.equal(fullResource.data.sourceType, 'YOUTUBE');
    assert.equal(fullResource.data.isDownloadable, false);
    assert.equal(fullResource.data.isActive, true);
  }

  // Backward compatibility: minimal legacy payload without new fields
  const legacyResource = resourceSchema.safeParse({
    name: 'Customer Churn Dataset',
    fileUrl: '/assets/datasets/customer_churn.csv',
    fileType: 'csv',
    fileSize: 1048576,
  });
  assert.ok(legacyResource.success);
  if (legacyResource.success) {
    // Defaults safely applied
    assert.equal(legacyResource.data.resourceType, 'FILE');
    assert.equal(legacyResource.data.sourceType, 'EXTERNAL');
    assert.equal(legacyResource.data.sortOrder, 0);
    assert.equal(legacyResource.data.isDownloadable, true);
    assert.equal(legacyResource.data.isActive, true);
  }
});

// ---------------------------------------------------------------------------
// 5. Automatic Meta & Descriptor Resolution
// ---------------------------------------------------------------------------
test('Phase 5.5: inferResourceMetaFromUrl and getResourceEmbedDescriptor automatically classify URLs', () => {
  // YouTube link
  const ytMeta = inferResourceMetaFromUrl('https://youtu.be/dQw4w9WgXcQ');
  assert.equal(ytMeta.resourceType, 'VIDEO');
  assert.equal(ytMeta.sourceType, 'YOUTUBE');

  const ytDesc = getResourceEmbedDescriptor({
    title: 'Intro Video',
    fileUrl: 'https://youtu.be/dQw4w9WgXcQ',
  });
  assert.equal(ytDesc.kind, 'youtube');
  assert.equal(ytDesc.isEmbeddable, true);

  // Google Slide link
  const slideMeta = inferResourceMetaFromUrl(
    'https://docs.google.com/presentation/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit'
  );
  assert.equal(slideMeta.resourceType, 'DOCUMENT');
  assert.equal(slideMeta.sourceType, 'GOOGLE_DRIVE');

  const slideDesc = getResourceEmbedDescriptor({
    title: 'Slide Deck',
    fileUrl: 'https://docs.google.com/presentation/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
  });
  assert.equal(slideDesc.kind, 'google_slide');
  assert.equal(slideDesc.isEmbeddable, true);

  // Dataset link
  const csvMeta = inferResourceMetaFromUrl('https://example.com/dataset.csv');
  assert.equal(csvMeta.resourceType, 'FILE');

  const csvDesc = getResourceEmbedDescriptor({
    title: 'Data File',
    fileUrl: 'https://example.com/dataset.csv',
  });
  assert.equal(csvDesc.kind, 'download_file');
  assert.equal(csvDesc.isEmbeddable, false);
});

// ---------------------------------------------------------------------------
// 6. Zero-Regression Verification for Progress and Weekly Quizzes
// ---------------------------------------------------------------------------
test('Phase 5.6: Lesson completion, module progression, and weekly quiz calculations remain 100% stable', () => {
  const lessonIds = ['l1', 'l2', 'l3'];
  const completed = new Set(['l1', 'l2']);

  const lessonSummary = summarizeLessonProgress(lessonIds, completed);
  assert.equal(lessonSummary.completedLessons, 2);
  assert.equal(lessonSummary.totalLessons, 3);
  assert.equal(lessonSummary.percentage, 67);
  assert.equal(lessonSummary.isComplete, false);
  assert.equal(lessonSummary.nextLessonId, 'l3');

  // Module with quiz & summary
  const moduleProg = calculateModuleProgress({
    lessonIds,
    completedLessonIds: completed,
    hasSummary: true,
    isSummaryCompleted: true,
    hasQuiz: true,
    isQuizPassed: true,
  });
  // 3 lessons + 1 summary + 1 quiz = 5 total items; completed = 2 lessons + 1 summary + 1 quiz = 4
  assert.equal(moduleProg.totalItems, 5);
  assert.equal(moduleProg.completedItems, 4);
  assert.equal(moduleProg.percentage, 80);
  assert.equal(moduleProg.quizPassed, true);
  assert.equal(moduleProg.summaryComplete, true);
  assert.equal(moduleProg.lessonsComplete, false);
});

// ---------------------------------------------------------------------------
// 7. Resource Behavior Matrix (In-Portal vs Download vs External)
// ---------------------------------------------------------------------------
test('Phase 5.7: Resource Behavior Matrix enforces Video/PPTX/PDF in-portal, Dataset as download, and Link as external', () => {
  // 1. YouTube Video -> In-Portal Viewing
  const ytDesc = getResourceEmbedDescriptor({
    title: 'Lecture Video',
    fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    resourceType: 'VIDEO',
    sourceType: 'YOUTUBE',
  });
  assert.equal(ytDesc.kind, 'youtube');
  assert.equal(ytDesc.isEmbeddable, true);
  assert.equal(ytDesc.requiresExternalFallback, false);

  // YouTube Playlist -> In-Portal Viewing (not external redirect!)
  const playlistDesc = getResourceEmbedDescriptor({
    title: 'Course Playlist',
    fileUrl: 'https://www.youtube.com/playlist?list=PLMtHAcoMj2Pk',
    resourceType: 'VIDEO',
    sourceType: 'YOUTUBE',
  });
  assert.equal(playlistDesc.kind, 'youtube');
  assert.equal(playlistDesc.isEmbeddable, true);
  assert.equal(playlistDesc.requiresExternalFallback, false);
  assert.ok(playlistDesc.embedUrl?.includes('videoseries?list=PLMtHAcoMj2Pk'));

  // 2. PPTX / Slides -> In-Portal Viewing (Google Slides embed preserved)
  const pptxDesc = getResourceEmbedDescriptor({
    title: 'Data Fundamentals Slide Deck',
    fileUrl: 'https://docs.google.com/presentation/d/160u4Mu2tQ8QfXOJT2LpqmSt3c5vD57EM/edit',
    resourceType: 'DOCUMENT',
    sourceType: 'GOOGLE_DRIVE',
    fileType: 'pptx',
  });
  assert.equal(pptxDesc.kind, 'google_slide');
  assert.equal(pptxDesc.isEmbeddable, true);
  assert.equal(pptxDesc.requiresExternalFallback, false);
  assert.ok(pptxDesc.embedUrl?.includes('/presentation/d/160u4Mu2tQ8QfXOJT2LpqmSt3c5vD57EM/embed'));

  // 3. PDF Document -> In-Portal Viewing where supported
  const pdfDesc = getResourceEmbedDescriptor({
    title: 'Study Guide',
    fileUrl: '/assets/docs/lesson_notes.pdf',
    resourceType: 'DOCUMENT',
    sourceType: 'UPLOAD',
    fileType: 'pdf',
  });
  assert.equal(pdfDesc.kind, 'pdf');
  assert.equal(pdfDesc.isEmbeddable, true);

  // 4. Dataset / File -> Direct Download Action (NEVER embeddable!)
  const csvDataset = getResourceEmbedDescriptor({
    title: 'Practice Dataset',
    fileUrl: '/assets/datasets/customer_churn.csv',
    resourceType: 'FILE',
    sourceType: 'UPLOAD',
    fileType: 'csv',
  });
  assert.equal(csvDataset.kind, 'download_file');
  assert.equal(csvDataset.isEmbeddable, false);

  const excelDataset = getResourceEmbedDescriptor({
    title: 'Financial Model Dataset',
    fileUrl: 'https://example.com/data/sales_q3.xlsx',
    resourceType: 'FILE',
    sourceType: 'UPLOAD',
    fileType: 'xlsx',
  });
  assert.equal(excelDataset.kind, 'download_file');
  assert.equal(excelDataset.isEmbeddable, false);

  const zipDataset = getResourceEmbedDescriptor({
    title: 'Raw Images Dataset',
    fileUrl: 'https://example.com/data/images.zip',
    resourceType: 'FILE',
    sourceType: 'UPLOAD',
    fileType: 'zip',
  });
  assert.equal(zipDataset.kind, 'download_file');
  assert.equal(zipDataset.isEmbeddable, false);

  // 5. External Link -> External Resource
  const linkDesc = getResourceEmbedDescriptor({
    title: 'Official Documentation',
    fileUrl: 'https://developer.mozilla.org/en-US/docs/Web',
    resourceType: 'LINK',
    sourceType: 'EXTERNAL',
    fileType: 'link',
  });
  assert.equal(linkDesc.kind, 'external_link');
  assert.equal(linkDesc.isEmbeddable, false);
  assert.equal(linkDesc.requiresExternalFallback, true);
});
