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
import { extractR2StorageKey } from '@/lib/resources/embed';

interface PdfViewerProps {
  fileUrl: string;
  storageKey?: string;
  title: string;
  description?: string | null;
  fileSize?: number | null;
  className?: string;
  initialPage?: number;
}

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PdfViewer({
  fileUrl,
  storageKey,
  title,
  description,
  fileSize,
  className = '',
  initialPage = 1,
}: PdfViewerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('Connecting to learning resource...');
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [thumbnails, setThumbnails] = useState<(string | null)[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTaskRef = useRef<any>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const resolvedKey =
    extractR2StorageKey(storageKey) ||
    extractR2StorageKey(fileUrl) ||
    storageKey ||
    null;

  // 1. Fetch PDF binary and initialize PDF.js
  const loadPdf = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress('Connecting to secure storage...');

    try {
      let response: Response;

      // Try direct fetch first
      try {
        response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (directErr) {
        console.warn('[PdfViewer] Direct fetch failed or restricted, attempting proxy fallback:', directErr);
        setLoadingProgress('Authorizing secure document stream...');

        const keyToUse =
          resolvedKey ||
          (fileUrl.includes('courses/') ? 'courses/' + fileUrl.split('courses/')[1]?.split('?')[0] : fileUrl);

        const proxyUrl = `/api/resources/proxy?key=${encodeURIComponent(keyToUse)}`;
        response = await fetch(proxyUrl);

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson.error || `Failed to fetch document file (HTTP ${response.status}).`);
        }
      }

      // Verify content is not an error JSON/HTML
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error || 'Server returned an error instead of document data.');
      }

      setLoadingProgress('Reading document data...');
      const arrayBuffer = await response.arrayBuffer();

      // Verify valid PDF magic bytes (%PDF)
      const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
      const headerStr = String.fromCharCode(...headerBytes);
      if (!headerStr.startsWith('%PDF')) {
        throw new Error('Received resource is not a valid PDF document.');
      }

      setLoadingProgress('Initializing slide presentation engine...');

      // Dynamic import of pdfjs-dist for client-only execution
      const pdfjs = await import('pdfjs-dist');

      if (typeof window !== 'undefined') {
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        }
      }

      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version || '6.4.299'}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version || '6.4.299'}/standard_fonts/`,
      });

      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage((prev) => (prev >= 1 && prev <= doc.numPages ? prev : 1));
      setIsLoading(false);
    } catch (err: unknown) {
      console.error('[PdfViewer] Error loading PDF:', err);
      setError((err as Error).message || 'Unable to load slide presentation.');
      setIsLoading(false);
    }
  }, [fileUrl, resolvedKey]);

  useEffect(() => {
    loadPdf();
    return () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore cancellation on unmount
        }
      }
    };
  }, [loadPdf]);

  // 2. Render active page to canvas whenever currentPage or pdfDoc changes
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

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
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth || 800;

      // Mobile padding: 16px; Desktop padding: 48px
      const isMobile = containerWidth < 640;
      const padding = isMobile ? 16 : 48;
      const availableWidth = Math.max(containerWidth - padding, 260);

      // In fullscreen, also consider available height
      const containerHeight = container.clientHeight || 600;
      const availableHeight = isFullscreen
        ? Math.max(containerHeight - 140, 300)
        : Math.max(Math.min(containerHeight, 700), 300);

      const unscaledViewport = page.getViewport({ scale: 1 });

      // Calculate scale to fit container width without exceeding available height
      const widthScale = availableWidth / unscaledViewport.width;
      const heightScale = availableHeight / unscaledViewport.height;

      // For slide presentation, fit within container bounds while maintaining aspect ratio
      const chosenScale = isFullscreen
        ? Math.min(widthScale, heightScale)
        : Math.min(widthScale, 1.8);

      const viewport = page.getViewport({ scale: chosenScale });

      // Use window.devicePixelRatio for crisp text on Retina/high-density mobile displays
      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2.5);

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);

      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      setIsRenderingPage(false);
    } catch (err: unknown) {
      const errorObj = err as { name?: string };
      if (errorObj?.name !== 'RenderingCancelledException') {
        console.error('[PdfViewer] Page render error:', err);
      }
      setIsRenderingPage(false);
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

  // 3. Lazy thumbnail generation for the bottom filmstrip
  useEffect(() => {
    if (!pdfDoc || totalPages === 0) return;

    let isCancelled = false;
    const initialThumbs = new Array(totalPages).fill(null);
    setThumbnails(initialThumbs);

    const generateThumbnails = async () => {
      for (let i = 1; i <= Math.min(totalPages, 20); i++) {
        if (isCancelled) break;
        try {
          const page = await pdfDoc.getPage(i);
          const unscaled = page.getViewport({ scale: 1 });
          const thumbScale = 120 / unscaled.width;
          const viewport = page.getViewport({ scale: thumbScale });

          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = Math.floor(viewport.width);
          offscreenCanvas.height = Math.floor(viewport.height);
          const ctx = offscreenCanvas.getContext('2d');

          if (ctx) {
            await page.render({
              canvasContext: ctx,
              viewport,
            }).promise;

            const dataUrl = offscreenCanvas.toDataURL('image/jpeg', 0.6);
            if (!isCancelled) {
              setThumbnails((prev) => {
                const next = [...prev];
                next[i - 1] = dataUrl;
                return next;
              });
            }
          }
        } catch {
          // Ignore individual thumbnail failure
        }
      }
    };

    generateThumbnails();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, totalPages]);

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
            onClick={loadPdf}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-secondary transition shadow-sm"
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
            className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition"
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
      <div className="relative flex flex-1 items-center justify-center bg-slate-950 p-2 sm:p-6 min-h-[320px] sm:min-h-[480px]">
        {isRenderingPage && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        )}

        <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-black/60 shadow-2xl">
          <canvas
            ref={canvasRef}
            className="block max-h-[75vh] max-w-full object-contain mx-auto"
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
