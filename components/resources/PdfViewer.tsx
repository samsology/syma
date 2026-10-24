'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';
import {
  extractR2StorageKey,
  getR2ProxyUrl,
} from '@/lib/resources/embed';
import {
  getCachedDocument,
  setCachedDocument,
  invalidateDocumentCache,
  type CachedDocumentEntry,
} from '@/lib/resources/pdf-cache';
import {
  readPdfResponse,
  validatePdfSignature,
} from '@/lib/resources/pdf-buffer';

export { getCachedDocument, setCachedDocument, invalidateDocumentCache };
export type { CachedDocumentEntry };

interface PdfViewerProps {
  fileUrl: string;
  storageKey?: string;
  title: string;
  description?: string | null;
  fileSize?: number | null;
  className?: string;
  initialPage?: number;
  cacheScope?: string;
}

const PDF_LOAD_INACTIVITY_MS = 30_000;
const PDF_LOAD_MAX_MS = 120_000;

function classifyPdfFailure(error: unknown): string {
  const value = error as { name?: string; status?: number; message?: string };
  if (value.status === 401 || value.status === 403) return 'authorization';
  if (value.status === 404) return 'missing-resource';
  if (/worker/i.test(value.message || '') || /worker/i.test(value.name || '')) return 'worker';
  if (/network|fetch|connection/i.test(value.message || '')) return 'network';
  return 'document';
}

function getStudentPdfError(error: unknown): string {
  const value = error as { status?: number; message?: string };
  if (/too large for the fallback viewer/i.test(value.message || '')) return value.message!;
  switch (classifyPdfFailure(error)) {
    case 'authorization':
      return 'You do not have access to this presentation. Refresh the lesson and try again.';
    case 'missing-resource':
      return 'This presentation is unavailable. Contact your course administrator if the problem continues.';
    case 'network':
      return 'The presentation could not be reached. Check your connection and retry.';
    case 'worker':
      return 'The presentation viewer could not start. Refresh the page and retry.';
    default:
      return 'The presentation could not be read. Retry, and contact support if the problem continues.';
  }
}

function createPdfHttpError(status: number, message = `HTTP ${status}`) {
  return Object.assign(new Error(message), { status });
}

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Preload & singleton promise for pdfjs-dist
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsPromise: Promise<any> | null = null;
function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist')
      .then((pdfjs) => {
        if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions?.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        }
        return pdfjs;
      })
      .catch((err) => {
        pdfjsPromise = null;
        throw err;
      });
  }
  return pdfjsPromise;
}

export function PdfViewer({
  fileUrl,
  storageKey,
  title,
  description,
  fileSize,
  className = '',
  initialPage = 1,
  cacheScope = 'anonymous-viewer',
}: PdfViewerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);
  const [firstSlideRendered, setFirstSlideRendered] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('Preparing presentation...');
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [thumbnails, setThumbnails] = useState<(string | null)[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTaskRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeLoadingTaskRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutCleanupRef = useRef<(() => void) | null>(null);
  const renderGenerationRef = useRef(0);
  const viewerStartedAtRef = useRef(performance.now());
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const hasRenderedActivePageRef = useRef(false);

  const resolvedKey =
    extractR2StorageKey(storageKey) ||
    extractR2StorageKey(fileUrl) ||
    (storageKey && !storageKey.startsWith('http') ? storageKey : null);

  // Stable cache key
  const cacheKey = `${cacheScope}:${resolvedKey || fileUrl}`;

  // Compute best direct stream URL. For R2 storage, the same-origin proxy route provides:
  // 1. Full session authorization (verifying student enrollment)
  // 2. HTTP 206 Byte-Range streaming (allowing PDF.js to fetch only page 1 first)
  // 3. Zero CORS failures
  const preferredStreamUrl = resolvedKey
    ? getR2ProxyUrl(resolvedKey, false) || `/api/resources/proxy?key=${encodeURIComponent(resolvedKey)}`
    : fileUrl;

  // 1. Fetch PDF binary and initialize PDF.js with Range Streaming
  const loadPdf = useCallback(async () => {
    viewerStartedAtRef.current = performance.now();
    setFirstSlideRendered(false);
    hasRenderedActivePageRef.current = false;
    setThumbnails([]);
    // Check in-memory cache first (0ms restoration on tab/page revisit)
    const cached = getCachedDocument(cacheKey);
    if (cached) {
      setPdfDoc(cached.doc);
      setTotalPages(cached.totalPages);
      setCurrentPage(Math.max(1, Math.min(initialPage, cached.totalPages)));
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setPdfDoc(null);
    setTotalPages(0);
    setError(null);
    setLoadingProgress('Connecting to presentation engine...');

    // Cancel any ongoing loading task
    if (activeLoadingTaskRef.current) {
      try {
        activeLoadingTaskRef.current.destroy();
      } catch {
        // ignore
      }
      activeLoadingTaskRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    const loadStartedAt = performance.now();
    let stage = 'engine';
    let hasReportedFirstResponse = false;
    let overallTimeout: ReturnType<typeof setTimeout> | undefined;
    let inactivityTimeout: ReturnType<typeof setTimeout> | undefined;
    const clearTimeouts = () => {
      clearTimeout(overallTimeout);
      clearTimeout(inactivityTimeout);
      if (timeoutCleanupRef.current === clearTimeouts) timeoutCleanupRef.current = null;
    };
    const failForTimeout = (timeoutStage: string, timeoutKind: 'inactivity' | 'overall') => {
      if (abortCtrl.signal.aborted) return;
      console.warn('[PdfViewer] load failed', { stage: timeoutStage, reason: `${timeoutKind}-timeout` });
      abortCtrl.abort();
      try {
        activeLoadingTaskRef.current?.destroy?.();
      } catch {
        // ignore
      }
      clearTimeouts();
      setIsLoading(false);
      setError(timeoutKind === 'inactivity'
        ? 'The presentation stopped responding while loading. Check your connection and retry.'
        : 'The presentation could not finish loading in time. Check your connection and retry.');
    };
    const resetInactivityTimeout = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(
        () => failForTimeout(stage, 'inactivity'),
        PDF_LOAD_INACTIVITY_MS
      );
    };
    overallTimeout = setTimeout(() => failForTimeout(stage, 'overall'), PDF_LOAD_MAX_MS);
    resetInactivityTimeout();
    timeoutCleanupRef.current = clearTimeouts;

    try {
      // Concurrently initialize PDF.js engine while setting up stream
      const pdfjs = await getPdfjs();
      if (abortCtrl.signal.aborted) return;

      stage = 'document';
      setLoadingProgress('Reading presentation stream...');

      let doc = null;

      // Primary strategy: Progressive HTTP Range-Request Streaming via PDF.js URL
      // PDF.js requests the xref table and only the byte range needed for page 1 first,
      // avoiding downloading the entire multi-megabyte file upfront.
      try {
        const loadingTask = pdfjs.getDocument({
          url: preferredStreamUrl,
          withCredentials: true,
          rangeChunkSize: 65536,
          cMapUrl: '/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: '/standard_fonts/',
          disableAutoFetch: false,
          disableStream: false,
        });

        activeLoadingTaskRef.current = loadingTask;

        loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
          const bytesComplete = total > 0 && loaded >= total;
          stage = bytesComplete ? 'document-processing' : 'document-stream';
          if (bytesComplete) clearTimeout(inactivityTimeout);
          else resetInactivityTimeout();
          if (!hasReportedFirstResponse && loaded > 0) {
            hasReportedFirstResponse = true;
            console.info('[PdfViewer] first response data', {
              durationMs: Math.round(performance.now() - loadStartedAt),
              source: resolvedKey ? 'authenticated-proxy' : 'direct',
            });
          }
          if (total > 0) {
            const pct = Math.min(100, Math.round((loaded / total) * 100));
            setLoadingProgress(`Reading presentation (${pct}%)...`);
          } else if (loaded > 0) {
            setLoadingProgress(`Reading presentation (${formatBytes(loaded)})...`);
          }
        };

        doc = await loadingTask.promise;
      } catch (streamErr: unknown) {
        if (abortCtrl.signal.aborted) return;
        const streamStatus = (streamErr as { status?: number }).status;
        if (streamStatus === 401 || streamStatus === 403 || streamStatus === 404) throw streamErr;
        console.warn('[PdfViewer] Range streaming failed; attempting the bounded fallback loader.', {
          reason: classifyPdfFailure(streamErr),
        });

        stage = 'buffered-fallback';
        setLoadingProgress('Authorizing secure document stream...');

        // Fallback strategy: Direct or Proxy buffer fetch with magic byte validation
        let response: Response;
        try {
          response = await fetch(preferredStreamUrl, { signal: abortCtrl.signal });
          if (!response.ok || response.status !== 200) {
            throw createPdfHttpError(response.status);
          }
        } catch (fetchErr) {
          if (abortCtrl.signal.aborted) return;
          const status = (fetchErr as { status?: number }).status;
          if (status === 401 || status === 403 || status === 404) throw fetchErr;
          console.warn('[PdfViewer] Primary document fetch failed; trying the authenticated proxy fallback.', {
            reason: classifyPdfFailure(fetchErr),
          });

          const keyToUse =
            resolvedKey ||
            (fileUrl.includes('courses/') ? 'courses/' + fileUrl.split('courses/')[1]?.split('?')[0] : fileUrl);

          const proxyFallback = `/api/resources/proxy?key=${encodeURIComponent(keyToUse)}`;
          response = await fetch(proxyFallback, { signal: abortCtrl.signal });

          if (!response.ok || response.status !== 200) {
            const errJson = await response.json().catch(() => ({}));
            throw createPdfHttpError(response.status, errJson.error || `Failed to fetch document file (HTTP ${response.status}).`);
          }
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await response.json().catch(() => ({}));
          throw new Error(json.error || 'Server returned an error instead of document data.');
        }

        setLoadingProgress('Processing document bytes...');
        resetInactivityTimeout();
        const pdfBytes = await readPdfResponse(response, abortCtrl.signal, (loaded, total) => {
          resetInactivityTimeout();
          if (!hasReportedFirstResponse && loaded > 0) {
            hasReportedFirstResponse = true;
            console.info('[PdfViewer] first response data', {
              durationMs: Math.round(performance.now() - loadStartedAt),
              source: resolvedKey ? 'authenticated-proxy' : 'direct',
            });
          }
          setLoadingProgress(total > 0
            ? `Reading presentation (${Math.min(100, Math.round((loaded / total) * 100))}%)...`
            : `Reading presentation (${formatBytes(loaded)})...`);
        });
        stage = 'document-processing';
        clearTimeout(inactivityTimeout);

        validatePdfSignature(pdfBytes);

        const bufferedTask = pdfjs.getDocument({
          data: pdfBytes,
          cMapUrl: '/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: '/standard_fonts/',
        });

        activeLoadingTaskRef.current = bufferedTask;
        doc = await bufferedTask.promise;
      }

      clearTimeouts();

      if (abortCtrl.signal.aborted || !doc) return;

      // Cache document for session reuse
      setCachedDocument(cacheKey, doc, doc.numPages);
      // Keep the resolved document alive in the bounded cache; destroying the loading task here
      // would also destroy the document proxy and make the cached entry unusable.
      activeLoadingTaskRef.current = null;

      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(Math.max(1, Math.min(initialPage, doc.numPages)));
      setIsLoading(false);
      setError(null);
      console.info('[PdfViewer] document ready', {
        durationMs: Math.round(performance.now() - loadStartedAt),
        pages: doc.numPages,
        source: resolvedKey ? 'authenticated-proxy' : 'direct',
      });
    } catch (err: unknown) {
      clearTimeouts();
      if (abortCtrl.signal.aborted) return;
      console.warn('[PdfViewer] load failed', { stage, reason: classifyPdfFailure(err) });
      setError(getStudentPdfError(err));
      setIsLoading(false);
    }
  }, [cacheKey, preferredStreamUrl, resolvedKey, fileUrl, initialPage]);

  useEffect(() => {
    loadPdf();
    return () => {
      timeoutCleanupRef.current?.();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      renderGenerationRef.current += 1;
      if (activeLoadingTaskRef.current) {
        try {
          activeLoadingTaskRef.current.destroy();
        } catch {
          // ignore
        }
      }
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [loadPdf]);

  // 2. Render active page to canvas whenever currentPage or pdfDoc changes
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    const generation = ++renderGenerationRef.current;
    const renderStartedAt = performance.now();
    let renderTimedOut = false;

    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {
        // ignore cancellation of previous task
      }
    }

    setIsRenderingPage(true);

    try {
      const page = await pdfDoc.getPage(currentPage);
      if (generation !== renderGenerationRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth || 800;

      // Mobile padding: 8px; Desktop padding: 16px
      const isMobile = containerWidth < 640;
      const padding = isMobile ? 8 : 16;
      const availableWidth = Math.max(containerWidth - padding, 260);

      // In fullscreen, also consider available height
      const containerHeight = container.clientHeight || 600;
      const availableHeight = isFullscreen
        ? Math.max(containerHeight - 120, 300)
        : Math.max(Math.min(containerHeight, 850), 300);

      const unscaledViewport = page.getViewport({ scale: 1 });

      // Calculate scale to fit container width without exceeding available height
      const widthScale = availableWidth / unscaledViewport.width;
      const heightScale = availableHeight / unscaledViewport.height;

      // For slide presentation, fit within container bounds while maintaining aspect ratio
      const chosenScale = isFullscreen
        ? Math.min(widthScale, heightScale)
        : Math.min(widthScale, 2.5);

      const viewport = page.getViewport({ scale: chosenScale });

      // Use window.devicePixelRatio for crisp text on Retina/high-density mobile displays
      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2.5);

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);

      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('The slide canvas is unavailable.');

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      const renderTimeout = setTimeout(() => {
        renderTimedOut = true;
        try {
          renderTask.cancel();
        } catch {
          // The render may have completed while the timeout fired.
        }
      }, 45_000);
      try {
        await renderTask.promise;
      } finally {
        clearTimeout(renderTimeout);
      }
      if (generation !== renderGenerationRef.current) return;
      setIsRenderingPage(false);
      if (!hasRenderedActivePageRef.current) {
        hasRenderedActivePageRef.current = true;
        setFirstSlideRendered(true);
        console.info('[PdfViewer] first active-page render complete', {
          timeToFirstSlideMs: Math.round(performance.now() - viewerStartedAtRef.current),
          renderDurationMs: Math.round(performance.now() - renderStartedAt),
          page: currentPage,
        });
      }
    } catch (err: unknown) {
      const errorObj = err as { name?: string };
      if (errorObj?.name !== 'RenderingCancelledException' || renderTimedOut) {
        console.warn('[PdfViewer] render failed', { stage: 'canvas-render', reason: classifyPdfFailure(err) });
        if (generation === renderGenerationRef.current) {
          setError(renderTimedOut
            ? 'This slide took too long to render. Retry the presentation.'
            : 'This slide could not be rendered. Retry the presentation.');
        }
      }
      if (generation === renderGenerationRef.current) setIsRenderingPage(false);
    }
  }, [pdfDoc, currentPage, isFullscreen]);

  // Trigger render on active page change
  useEffect(() => {
    if (pdfDoc && !isLoading) {
      renderCurrentPage();
    }
  }, [pdfDoc, currentPage, isLoading, renderCurrentPage]);

  // Handle container resize & orientation changes with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let resizeTimer: NodeJS.Timeout;
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (pdfDoc && !isLoading) {
          renderCurrentPage();
        }
      }, 150);
    });

    observer.observe(container);
    return () => {
      clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, [pdfDoc, isLoading, renderCurrentPage]);

  // 3. Deferred thumbnail generation for the bottom filmstrip
  // Crucial: Thumbnails only begin rendering AFTER the primary slide has rendered,
  // preventing main-thread and canvas context contention.
  useEffect(() => {
    if (!pdfDoc || totalPages <= 1 || !firstSlideRendered || isLoading) return;

    let isCancelled = false;
    setThumbnails((prev) => (prev.length === totalPages ? prev : new Array(totalPages).fill(null)));
    let activeThumbnailRender: { cancel: () => void; promise: Promise<void> } | null = null;

    // Generate only the active and adjacent thumbnails in idle time to bound canvas and data URL memory.
    const generateThumbnails = async () => {
      const targetIndices = [currentPage, currentPage + 1, currentPage - 1]
        .filter((pageNum) => pageNum >= 1 && pageNum <= totalPages);

      for (const pageNum of targetIndices) {
        if (isCancelled) break;

        // Yield to browser rendering loop
        await new Promise((resolve) => setTimeout(resolve, 60));
        if (isCancelled) break;

        try {
          const page = await pdfDoc.getPage(pageNum);
          const unscaled = page.getViewport({ scale: 1 });
          const thumbScale = 120 / unscaled.width;
          const viewport = page.getViewport({ scale: thumbScale });

          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = Math.floor(viewport.width);
          offscreenCanvas.height = Math.floor(viewport.height);
          const ctx = offscreenCanvas.getContext('2d');

          if (ctx) {
            const thumbnailRender = page.render({
              canvasContext: ctx,
              viewport,
            });
            activeThumbnailRender = thumbnailRender;
            await thumbnailRender.promise;

            const dataUrl = offscreenCanvas.toDataURL('image/jpeg', 0.6);
            offscreenCanvas.width = 0;
            offscreenCanvas.height = 0;
            if (!isCancelled) {
              setThumbnails((prev) => {
                const next = new Array(totalPages).fill(null);
                for (const nearbyPage of targetIndices) {
                  if (nearbyPage !== pageNum && prev[nearbyPage - 1]) next[nearbyPage - 1] = prev[nearbyPage - 1];
                }
                next[pageNum - 1] = dataUrl;
                return next;
              });
            }
          }
        } catch {
          // Ignore individual thumbnail failure
        } finally {
          activeThumbnailRender = null;
        }
      }
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    const idleId =
      typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).requestIdleCallback(() => generateThumbnails(), { timeout: 1000 })
        : setTimeout(generateThumbnails, 250);

    return () => {
      isCancelled = true;
      try {
        activeThumbnailRender?.cancel();
      } catch {
        // Ignore cancellation after an individual thumbnail has already finished.
      }
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && typeof idleId === 'number') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
    };
  }, [pdfDoc, totalPages, firstSlideRendered, isLoading, currentPage]);

  // 4. Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  // 5. Navigation functions
  const goToPage = useCallback(
    (targetPage: number) => {
      if (totalPages === 0) return;
      const safePage = Math.max(1, Math.min(targetPage, totalPages));
      setCurrentPage(safePage);
    },
    [totalPages]
  );

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  // 6. Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (
        targetTag === 'input' ||
        targetTag === 'textarea' ||
        targetTag === 'select' ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevPage();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToPage(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToPage(totalPages);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPage, nextPage, prevPage, totalPages]);

  // 7. Mobile swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touchEndX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const touchEndY = e.changedTouches[0]?.clientY ?? touchStartYRef.current;

    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;

    // Only swipe if horizontal movement is dominant and exceeds threshold
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swiped left -> next page
        nextPage();
      } else {
        // Swiped right -> prev page
        prevPage();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleRetry = () => {
    timeoutCleanupRef.current?.();
    abortControllerRef.current?.abort();
    try {
      activeLoadingTaskRef.current?.destroy?.();
    } catch {
      // Ignore cleanup errors from the failed attempt.
    }
    activeLoadingTaskRef.current = null;
    try {
      renderTaskRef.current?.cancel?.();
    } catch {
      // Ignore cleanup errors from the failed render.
    }
    renderTaskRef.current = null;
    renderGenerationRef.current += 1;
    setIsRenderingPage(false);
    invalidateDocumentCache(cacheKey);
    setFirstSlideRendered(false);
    hasRenderedActivePageRef.current = false;
    loadPdf();
  };

  const formattedSize = formatBytes(fileSize);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-12 sm:p-16 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 text-slate-600 shadow-sm ${className}`}
      >
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
        <h4 className="text-base font-bold text-slate-900">Loading Slide Presentation...</h4>
        <p className="mt-1 text-xs text-slate-500">{loadingProgress}</p>
      </div>
    );
  }

  // Error state
  if (error || totalPages === 0) {
    return (
      <div
        className={`rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-center shadow-sm space-y-4 ${className}`}
      >
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">Unable to Display Slide Presentation</h4>
          <p className="mt-1.5 text-xs text-slate-600 max-w-md mx-auto">
            {error || 'Unable to render the requested PDF slides within the portal.'}
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-secondary transition shadow-sm cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry Presentation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-900/10 bg-slate-950 text-white shadow-xl transition-all select-none ${
        isFullscreen ? 'h-screen w-screen rounded-none p-2 sm:p-4' : ''
      } ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Top Header Bar - Strict Student Experience (No Download / Print / Open buttons) */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-3 py-2.5 sm:px-4 sm:py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h4 className="truncate text-xs font-bold text-white sm:text-sm">{title}</h4>
            <p className="text-[10px] text-slate-400">
              Page {currentPage} of {totalPages}
              {formattedSize ? ` · ${formattedSize}` : ''}
              {description ? ` · ${description}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Slides'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Slides'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className="relative flex flex-1 items-center justify-center bg-slate-950 p-1 sm:p-2 min-h-[320px] sm:min-h-[480px]">
        {isRenderingPage && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        )}

        <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-black/60 shadow-2xl">
          <canvas
            ref={canvasRef}
            className="block max-h-[82vh] max-w-full object-contain mx-auto"
          />
        </div>

        {/* Quick Nav Hover Arrows (desktop only) */}
        <button
          type="button"
          onClick={prevPage}
          disabled={currentPage === 1}
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-white hover:bg-indigo-600 disabled:opacity-20 disabled:hover:bg-slate-900/70 transition shadow-lg backdrop-blur-sm cursor-pointer disabled:cursor-not-allowed"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-white hover:bg-indigo-600 disabled:opacity-20 disabled:hover:bg-slate-900/70 transition shadow-lg backdrop-blur-sm cursor-pointer disabled:cursor-not-allowed"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Bottom Control Bar */}
      <div className="flex flex-col gap-2.5 border-t border-white/10 bg-slate-900/95 p-2.5 sm:px-6 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevPage}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Previous</span>
            </button>

            <button
              type="button"
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="hidden xs:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Slide Counter & Jump Selector */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <span>Slide</span>
            <select
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value, 10))}
              aria-label="Select slide number"
              className="rounded-lg border border-white/20 bg-slate-800 px-2 py-1 text-xs font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <span>of {totalPages}</span>
          </div>
        </div>

        {/* Slide Thumbnail Filmstrip */}
        {totalPages > 1 && (
          <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const thumbUrl = thumbnails[pageNum - 1];
              const isSelected = currentPage === pageNum;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => goToPage(pageNum)}
                  className={`relative h-12 w-20 sm:h-14 sm:w-24 shrink-0 overflow-hidden rounded-lg border-2 transition cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                      : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Go to slide ${pageNum}`}
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={`Slide ${pageNum} preview`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-800 p-1 text-[9px] font-bold text-slate-300 truncate">
                      Slide {pageNum}
                    </div>
                  )}
                  <span className="absolute bottom-0.5 right-1 rounded bg-black/75 px-1 text-[9px] font-bold text-white">
                    {pageNum}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
