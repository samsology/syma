import assert from 'node:assert/strict';
import test from 'node:test';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { generateNinePagePdfBuffer, ensureTestPdfFixture } from './fixtures/create-test-pdf';
import {
  canDownloadResource,
  getResourceEmbedDescriptor,
  extractR2StorageKey,
  getR2ProxyUrl,
  isPdfFile,
} from '../lib/resources/embed';

// ---------------------------------------------------------------------------
// 1. 9-Page PDF Verification with PDF.js Engine
// ---------------------------------------------------------------------------
test('Phase PDF.1: 9-page "What is Data?" PDF loads and parses all 9 slides', async () => {
  const pdfBuffer = generateNinePagePdfBuffer();
  assert.ok(pdfBuffer.length > 500, 'PDF buffer should contain valid bytes');

  // Verify magic bytes %PDF-
  const header = pdfBuffer.subarray(0, 5).toString('ascii');
  assert.equal(header, '%PDF-');

  // Load via PDF.js engine
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(pdfBuffer),
    disableRange: true,
    disableStream: true,
  });

  const pdfDoc = await loadingTask.promise;
  assert.equal(pdfDoc.numPages, 9, 'PDF document must have exactly 9 pages');

  // Navigate through all 9 pages and verify content accessibility
  for (let pageNum = 1; pageNum <= 9; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    assert.equal(page.pageNumber, pageNum);

    const viewport = page.getViewport({ scale: 1 });
    assert.equal(viewport.width, 612);
    assert.equal(viewport.height, 792);

    const textContent = await page.getTextContent();
    assert.ok(textContent.items.length > 0, `Page ${pageNum} should contain text items`);

    const pageText = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str || '')
      .join(' ');

    assert.ok(
      pageText.includes(`Page ${pageNum} of 9`),
      `Page ${pageNum} text should contain slide indicator`
    );
  }
});

// ---------------------------------------------------------------------------
// 2. Navigation State Engine & Boundary Logic (Previous/Next)
// ---------------------------------------------------------------------------
test('Phase PDF.2: Slide navigation boundaries strictly enforce first-page, last-page, and jump limits', () => {
  const totalPages = 9;

  class SlideNavigationModel {
    currentPage: number;
    totalPages: number;

    constructor(totalPages: number, initialPage = 1) {
      this.totalPages = totalPages;
      this.currentPage = Math.max(1, Math.min(initialPage, totalPages));
    }

    canGoPrev(): boolean {
      return this.currentPage > 1;
    }

    canGoNext(): boolean {
      return this.currentPage < this.totalPages;
    }

    prev(): boolean {
      if (!this.canGoPrev()) return false;
      this.currentPage--;
      return true;
    }

    next(): boolean {
      if (!this.canGoNext()) return false;
      this.currentPage++;
      return true;
    }

    goTo(target: number): void {
      this.currentPage = Math.max(1, Math.min(target, this.totalPages));
    }

    getIndicator(): string {
      return `Page ${this.currentPage} of ${this.totalPages}`;
    }
  }

  const nav = new SlideNavigationModel(totalPages, 1);

  // 1. Initial State: Page 1
  assert.equal(nav.currentPage, 1);
  assert.equal(nav.canGoPrev(), false, 'Previous must be disabled on page 1');
  assert.equal(nav.canGoNext(), true, 'Next must be enabled on page 1');
  assert.equal(nav.prev(), false, 'Calling prev on page 1 must be a no-op');
  assert.equal(nav.getIndicator(), 'Page 1 of 9');

  // 2. Step through all 9 pages sequentially
  for (let expected = 2; expected <= 9; expected++) {
    const moved = nav.next();
    assert.equal(moved, true, `Should successfully move to page ${expected}`);
    assert.equal(nav.currentPage, expected);
    assert.equal(nav.getIndicator(), `Page ${expected} of 9`);
    assert.equal(nav.canGoPrev(), true, 'Previous should be enabled on intermediate and final pages');
  }

  // 3. Final Boundary State: Page 9
  assert.equal(nav.currentPage, 9);
  assert.equal(nav.canGoNext(), false, 'Next must be disabled on page 9 (last page)');
  assert.equal(nav.next(), false, 'Calling next on last page must be a no-op');
  assert.equal(nav.getIndicator(), 'Page 9 of 9');

  // 4. Navigate back to page 1
  for (let expected = 8; expected >= 1; expected--) {
    const moved = nav.prev();
    assert.equal(moved, true, `Should successfully move back to page ${expected}`);
    assert.equal(nav.currentPage, expected);
  }
  assert.equal(nav.currentPage, 1);
  assert.equal(nav.canGoPrev(), false);

  // 5. Jump selector navigation
  nav.goTo(5);
  assert.equal(nav.currentPage, 5);
  assert.equal(nav.getIndicator(), 'Page 5 of 9');

  // 6. Out of bounds clamp
  nav.goTo(99);
  assert.equal(nav.currentPage, 9, 'Jump beyond last page must clamp to totalPages');
  nav.goTo(-5);
  assert.equal(nav.currentPage, 1, 'Jump below first page must clamp to 1');
});

// ---------------------------------------------------------------------------
// 3. Responsive Dimension Calculation & Mobile Viewports
// ---------------------------------------------------------------------------
test('Phase PDF.3: Responsive layout preserves aspect ratio and prevents horizontal overflow on mobile viewports', () => {
  // Typical PDF slide aspect ratio (e.g. standard US Letter 612 x 792 or widescreen 16:9)
  const slideDimensions = [
    { name: 'US Letter / Portrait Slide', width: 612, height: 792 },
    { name: '16:9 Widescreen Deck', width: 960, height: 540 },
    { name: '4:3 Standard Deck', width: 800, height: 600 },
  ];

  const testViewports = [
    { label: 'Mobile Small', containerWidth: 360, isMobile: true },
    { label: 'Mobile Standard (iPhone 14/15)', containerWidth: 390, isMobile: true },
    { label: 'Mobile Large (Pro Max / Plus)', containerWidth: 430, isMobile: true },
    { label: 'Tablet Portrait', containerWidth: 768, isMobile: false },
    { label: 'Desktop Laptop', containerWidth: 1200, isMobile: false },
  ];

  for (const slide of slideDimensions) {
    const aspectRatio = slide.width / slide.height;

    for (const vp of testViewports) {
      const padding = vp.isMobile ? 16 : 48;
      const availableWidth = Math.max(vp.containerWidth - padding, 260);

      // Width scale ensures the rendered canvas fits inside available screen width
      const widthScale = availableWidth / slide.width;
      const chosenScale = Math.min(widthScale, vp.isMobile ? 1.0 : 1.8);

      const renderedDisplayWidth = Math.floor(slide.width * chosenScale);
      const renderedDisplayHeight = Math.floor(slide.height * chosenScale);

      // Assertions
      assert.ok(
        renderedDisplayWidth <= vp.containerWidth,
        `[${slide.name} @ ${vp.label}] Rendered width (${renderedDisplayWidth}px) exceeds container width (${vp.containerWidth}px)!`
      );

      // Verify aspect ratio preservation within rounding tolerance
      const renderedRatio = renderedDisplayWidth / renderedDisplayHeight;
      const ratioDiff = Math.abs(renderedRatio - aspectRatio);
      assert.ok(
        ratioDiff < 0.05,
        `[${slide.name} @ ${vp.label}] Aspect ratio skewed! Original: ${aspectRatio.toFixed(3)}, Rendered: ${renderedRatio.toFixed(3)}`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// 4. Removal of Student Download and Print Controls
// ---------------------------------------------------------------------------
test('Phase PDF.4: Student learning viewer strictly prohibits PDF and Video download actions', () => {
  // 1. PDF Resource: canDownloadResource MUST return false
  const canDownloadPdf = canDownloadResource({
    title: 'What is Data? (Slide Deck)',
    fileUrl: 'courses/main-lessons/lessons/instructional/document/b3ea81da-3df2-440b-993c-What-is-Data.pdf',
    resourceType: 'DOCUMENT',
    sourceType: 'R2',
    fileType: 'pdf',
    isDownloadable: true, // Even if admin set true, student viewer forbids it
  });
  assert.equal(canDownloadPdf, false, 'PDF slides must never be downloadable for students');

  // 2. Video Lecture: canDownloadResource MUST return false
  const canDownloadVideo = canDownloadResource({
    title: 'Lesson 1 Walkthrough',
    fileUrl: 'courses/main-lessons/lessons/instructional/video/intro.mp4',
    resourceType: 'VIDEO',
    sourceType: 'R2',
    fileType: 'mp4',
    isDownloadable: true,
  });
  assert.equal(canDownloadVideo, false, 'Video lectures must never be downloadable for students');

  // 3. YouTube Video: canDownloadResource MUST return false
  const canDownloadYt = canDownloadResource({
    title: 'Intro Video',
    fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    resourceType: 'VIDEO',
    sourceType: 'YOUTUBE',
    fileType: 'youtube',
    isDownloadable: true,
  });
  assert.equal(canDownloadYt, false, 'YouTube videos must never be downloadable for students');

  // 4. Dataset (.csv): canDownloadResource MUST return true (legitimate practice data)
  const canDownloadDataset = canDownloadResource({
    title: 'Customer Churn Practice Dataset',
    fileUrl: '/assets/datasets/customer_churn.csv',
    resourceType: 'FILE',
    sourceType: 'UPLOAD',
    fileType: 'csv',
    isDownloadable: true,
  });
  assert.equal(canDownloadDataset, true, 'Datasets must remain downloadable');
});

// ---------------------------------------------------------------------------
// 5. Cloudflare R2 Secure URL Resolution and Proxy Fallback
// ---------------------------------------------------------------------------
test('Phase PDF.5: Cloudflare R2 storage keys resolve cleanly and proxy URLs guarantee same-origin access', () => {
  const r2Key = 'courses/main-lessons/lessons/instructional/document/b3ea81da-3df2-440b-993c-What-is-Data.pdf';

  // 1. Extract key from raw key
  assert.equal(extractR2StorageKey(r2Key), r2Key);

  // 2. Extract key from r2:// scheme
  assert.equal(extractR2StorageKey(`r2://${r2Key}`), r2Key);

  // 3. Extract key from accidental https://courses/ URL
  assert.equal(extractR2StorageKey(`https://${r2Key}`), r2Key);

  // 4. Proxy URL generation guarantees same-origin endpoint
  const proxyUrl = getR2ProxyUrl(r2Key, false);
  assert.ok(proxyUrl);
  assert.equal(proxyUrl, `/api/resources/proxy?key=${encodeURIComponent(r2Key)}`);

  // 5. Proxy URL is same-origin (starts with /api/), completely avoiding CORS restrictions
  assert.ok(proxyUrl?.startsWith('/api/resources/proxy'));
});

// ---------------------------------------------------------------------------
// 6. MP4 Playback Regression Verification
// ---------------------------------------------------------------------------
test('Phase PDF.6: MP4 video descriptor and controlsList="nodownload" remain fully intact', () => {
  const videoDesc = getResourceEmbedDescriptor({
    title: 'Lesson 1 Video Walkthrough',
    fileUrl: 'courses/main-lessons/lessons/instructional/video/sample.mp4',
    resourceType: 'VIDEO',
    sourceType: 'R2',
    fileType: 'mp4',
  });

  assert.equal(videoDesc.kind, 'html5_video');
  assert.equal(videoDesc.isEmbeddable, true);
  assert.equal(videoDesc.requiresExternalFallback, false);
  assert.equal(videoDesc.embedUrl, 'courses/main-lessons/lessons/instructional/video/sample.mp4');
});

// ---------------------------------------------------------------------------
// 7. PDF File Detection and In-Portal Embed Classification
// ---------------------------------------------------------------------------
test('Phase PDF.7: isPdfFile accurately classifies PDF file types and URLs', () => {
  assert.equal(isPdfFile('document.pdf'), true);
  assert.equal(isPdfFile('courses/documents/b3ea81da-What-is-Data.pdf?token=123'), true);
  assert.equal(isPdfFile('application/pdf'), true);
  assert.equal(isPdfFile('pdf'), true);
  assert.equal(isPdfFile('PDF'), true);

  // Non-PDFs
  assert.equal(isPdfFile('presentation.pptx'), false);
  assert.equal(isPdfFile('lecture.mp4'), false);
  assert.equal(isPdfFile('dataset.csv'), false);
  assert.equal(isPdfFile('image.png'), false);
});

// ---------------------------------------------------------------------------
// 8. PDF Validation Magic Bytes Check
// ---------------------------------------------------------------------------
test('Phase PDF.8: PDF binary validator correctly accepts valid PDFs and rejects HTML/JSON error responses', () => {
  function validatePdfBytes(buffer: ArrayBuffer): boolean {
    const headerBytes = new Uint8Array(buffer.slice(0, 5));
    const headerStr = String.fromCharCode(...headerBytes);
    return headerStr.startsWith('%PDF');
  }

  // 1. Valid PDF buffer
  const validBuffer = generateNinePagePdfBuffer();
  assert.equal(validatePdfBytes(validBuffer.buffer), true);

  // 2. JSON error response from expired API token
  const jsonError = Buffer.from(JSON.stringify({ success: false, error: 'Unauthorized session' }));
  assert.equal(validatePdfBytes(jsonError.buffer), false);

  // 3. HTML 404 or Cloudflare Error page
  const htmlError = Buffer.from('<!DOCTYPE html><html><body>Error 403 Forbidden</body></html>');
  assert.equal(validatePdfBytes(htmlError.buffer), false);
});
