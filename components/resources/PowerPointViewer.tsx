'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  Presentation,
  RefreshCw,
} from 'lucide-react';

interface ParsedSlide {
  slideNum: number;
  title: string;
  imageDataUrl: string | null;
  textParagraphs: string[];
}

interface PowerPointViewerProps {
  fileUrl: string;
  storageKey?: string;
  title: string;
  description?: string | null;
  fileSize?: number | null;
  isDownloadable?: boolean;
  className?: string;
}

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PowerPointViewer({
  fileUrl,
  storageKey,
  title,
  description,
  fileSize,
  isDownloadable = true,
  className = '',
}: PowerPointViewerProps) {
  const [slides, setSlides] = useState<ParsedSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState('Downloading presentation data...');
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  const loadPresentation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress('Connecting to secure storage...');

    try {
      let response: Response;

      // 1. Try direct fetch
      try {
        response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (directErr) {
        console.warn('[PowerPointViewer] Direct fetch failed, attempting secure proxy fallback:', directErr);
        setLoadingProgress('Fetching presentation binary securely...');

        let keyToUse = storageKey;
        if (!keyToUse) {
          if (fileUrl.includes('courses/')) {
            keyToUse = 'courses/' + fileUrl.split('courses/')[1]?.split('?')[0];
          } else {
            keyToUse = fileUrl;
          }
        }

        const proxyUrl = `/api/resources/proxy?key=${encodeURIComponent(keyToUse)}`;
        response = await fetch(proxyUrl);

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson.error || `Failed to fetch presentation file (HTTP ${response.status}).`);
        }
      }

      setLoadingProgress('Reading presentation slide deck...');
      const arrayBuffer = await response.arrayBuffer();

      setLoadingProgress('Parsing PowerPoint slide structures...');
      const zip = await JSZip.loadAsync(arrayBuffer);
      const files = Object.keys(zip.files);

      // Find all slide XML files in ppt/slides/
      const slidePaths = files
        .filter((f) => /^ppt\/slides\/slide\d+\.xml$/i.test(f))
        .sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
          const numB = parseInt(b.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
          return numA - numB;
        });

      if (slidePaths.length === 0) {
        throw new Error('No presentation slides were found in this PowerPoint file.');
      }

      setLoadingProgress(`Extracting ${slidePaths.length} presentation slides...`);

      const parsedSlides: ParsedSlide[] = [];

      for (let i = 0; i < slidePaths.length; i++) {
        const slidePath = slidePaths[i];
        const slideNum = i + 1;

        // 1. Check relationships for embedded media images
        const relPath = slidePath
          .replace('ppt/slides/', 'ppt/slides/_rels/')
          .replace('.xml', '.xml.rels');
        const relFile = zip.files[relPath];

        let imageDataUrl: string | null = null;
        if (relFile) {
          const relXml = await relFile.async('text');
          const imgMatch = relXml.match(/Target="\.\.\/media\/([^"]+)"/);
          if (imgMatch && imgMatch[1]) {
            const mediaFileName = imgMatch[1];
            const mediaPath = `ppt/media/${mediaFileName}`;
            const mediaFile = zip.files[mediaPath];
            if (mediaFile) {
              const ext = mediaFileName.split('.').pop()?.toLowerCase();
              let mimeType = 'image/png';
              if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
              else if (ext === 'svg') mimeType = 'image/svg+xml';
              else if (ext === 'gif') mimeType = 'image/gif';
              else if (ext === 'webp') mimeType = 'image/webp';

              const base64 = await mediaFile.async('base64');
              imageDataUrl = `data:${mimeType};base64,${base64}`;
            }
          }
        }

        // 2. Extract text paragraphs from slide XML
        const xmlText = await zip.files[slidePath].async('text');
        const rawTexts = Array.from(xmlText.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g))
          .map((m) => m[1]?.trim())
          .filter((t): t is string => Boolean(t && t.length > 0));

        // Deduplicate consecutive identical texts
        const textParagraphs: string[] = [];
        for (const t of rawTexts) {
          if (textParagraphs[textParagraphs.length - 1] !== t) {
            textParagraphs.push(t);
          }
        }

        const slideTitle = textParagraphs[0] || `Slide ${slideNum}`;

        parsedSlides.push({
          slideNum,
          title: slideTitle,
          imageDataUrl,
          textParagraphs,
        });
      }

      setSlides(parsedSlides);
      setCurrentSlideIndex(0);
      setIsLoading(false);
    } catch (err: unknown) {
      console.error('[PowerPointViewer] Parsing failed:', err);
      setError((err as Error).message || 'Failed to render presentation slides.');
      setIsLoading(false);
    }
  }, [fileUrl]);

  useEffect(() => {
    loadPresentation();
  }, [loadPresentation]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if student is typing in input / textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlideIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlideIndex(slides.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await viewerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  const currentSlide = slides[currentSlideIndex];
  const formattedSize = formatBytes(fileSize);

  if (isLoading) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-14 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 text-slate-600 shadow-sm ${className}`}
      >
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
        <h4 className="text-base font-bold text-slate-900">Rendering Presentation Deck...</h4>
        <p className="mt-1 text-xs text-slate-500">{loadingProgress}</p>
      </div>
    );
  }

  if (error || slides.length === 0) {
    return (
      <div
        className={`rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-center shadow-sm space-y-4 ${className}`}
      >
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">Presentation Player Notice</h4>
          <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto">
            {error || 'Unable to parse slide content directly from this PowerPoint file.'}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={loadPresentation}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-secondary transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry Presentation
          </button>
          {isDownloadable && (
            <a
              href={fileUrl}
              download
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <Download className="h-3.5 w-3.5" /> Download Deck (.pptx)
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewerRef}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-900/10 bg-slate-950 text-white shadow-xl transition-all ${
        isFullscreen ? 'h-screen w-screen rounded-none p-4' : ''
      } ${className}`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <Presentation className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h4 className="truncate text-xs font-bold text-white sm:text-sm">{title}</h4>
            <p className="text-[10px] text-slate-400">
              Slide {currentSlideIndex + 1} of {slides.length}
              {formattedSize ? ` · ${formattedSize}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Presentation'}
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

          {isDownloadable && (
            <a
              href={fileUrl}
              download
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-secondary transition"
              title="Download PowerPoint presentation"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Presentation Canvas */}
      <div className="relative flex flex-1 items-center justify-center bg-slate-950 p-2 sm:p-6 min-h-[380px] sm:min-h-[500px]">
        {currentSlide.imageDataUrl ? (
          <div className="relative flex h-full w-full max-w-5xl items-center justify-center overflow-hidden rounded-xl bg-black/40 shadow-2xl">
            <img
              src={currentSlide.imageDataUrl}
              alt={`Slide ${currentSlide.slideNum}: ${currentSlide.title}`}
              className="max-h-[75vh] w-full object-contain mx-auto select-none"
            />
          </div>
        ) : (
          <div className="flex h-full w-full max-w-4xl flex-col justify-center rounded-2xl bg-white p-8 sm:p-12 text-slate-900 shadow-2xl min-h-[350px]">
            <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600">
              Slide {currentSlide.slideNum}
            </span>
            <h3 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-950">
              {currentSlide.title}
            </h3>
            <div className="mt-6 space-y-3 max-h-[50vh] overflow-y-auto">
              {currentSlide.textParagraphs.slice(1).map((para, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm sm:text-base leading-relaxed text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                  <span>{para}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Nav Hover Arrows */}
        <button
          type="button"
          onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlideIndex === 0}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-white hover:bg-indigo-600 disabled:opacity-30 disabled:hover:bg-slate-900/70 transition shadow-lg backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))}
          disabled={currentSlideIndex === slides.length - 1}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-white hover:bg-indigo-600 disabled:opacity-30 disabled:hover:bg-slate-900/70 transition shadow-lg backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Bottom Control Bar */}
      <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-900/90 p-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlideIndex === 0}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 disabled:opacity-30 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-30 transition"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Slide Counter & Jump Selector */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <span>Slide</span>
            <select
              value={currentSlideIndex}
              onChange={(e) => setCurrentSlideIndex(parseInt(e.target.value, 10))}
              className="rounded-lg border border-white/20 bg-slate-800 px-2 py-1 text-xs font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {slides.map((s, idx) => (
                <option key={idx} value={idx}>
                  {s.slideNum}
                </option>
              ))}
            </select>
            <span>of {slides.length}</span>
          </div>
        </div>

        {/* Slide Thumbnail Filmstrip */}
        <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {slides.map((slide, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlideIndex(idx)}
              className={`relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                currentSlideIndex === idx
                  ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                  : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
              }`}
            >
              {slide.imageDataUrl ? (
                <img
                  src={slide.imageDataUrl}
                  alt={`Thumbnail slide ${slide.slideNum}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800 p-1 text-[9px] font-bold text-slate-300 truncate">
                  Slide {slide.slideNum}
                </div>
              )}
              <span className="absolute bottom-0.5 right-1 rounded bg-black/70 px-1 text-[9px] font-bold text-white">
                {slide.slideNum}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
