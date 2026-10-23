'use client';

import { useState, useEffect } from 'react';
import {
  AlertCircle,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Presentation,
  RefreshCw,
  Video,
  Volume2,
} from 'lucide-react';
import {
  canDownloadResource,
  getResourceEmbedDescriptor,
  isSafeEmbedUrl,
  isR2StorageReference,
  extractR2StorageKey,
  isPowerPointFile,
  isPdfFile,
  isAudioFile,
  isImageFile,
} from '@/lib/resources/embed';
import { PowerPointViewer } from './PowerPointViewer';
import { PdfViewer } from './PdfViewer';
import type { ResourceType, ResourceSource } from '@/lib/resources/types';

interface ResourceRendererProps {
  id?: string;
  resourceId?: string;
  title: string;
  fileUrl: string;
  resourceType?: ResourceType;
  sourceType?: ResourceSource;
  fileType?: string;
  fileSize?: number | null;
  description?: string | null;
  isDownloadable?: boolean;
  className?: string;
  autoPlay?: boolean;
  cacheScope?: string;
}

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResourceRenderer({
  id,
  resourceId,
  title,
  fileUrl,
  resourceType,
  sourceType,
  fileType,
  fileSize,
  description,
  isDownloadable = true,
  className = '',
  cacheScope,
}: ResourceRendererProps) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const isPdf = isPdfFile(fileType) || isPdfFile(fileUrl);
  const isR2Url =
    !isPdf &&
    (sourceType === 'R2' ||
      isR2StorageReference(fileUrl) ||
      (!fileUrl.startsWith('http') && !fileUrl.startsWith('/')));

  const [authorizing, setAuthorizing] = useState<boolean>(isR2Url);
  const targetId = id || resourceId;

  const fetchAccessUrl = () => {
    let isMounted = true;
    if (isR2Url) {
      setAuthorizing(true);
      setHasError(false);
      setErrorMessage(null);

      const storageKey =
        extractR2StorageKey(fileUrl) ||
        fileUrl.replace(/^r2:\/\//i, '').replace(/^https?:\/\/courses\//i, 'courses/');

      const useResourceEndpoint =
        targetId && targetId.length >= 10 && !targetId.startsWith('primary-');

      const endpoint = useResourceEndpoint
        ? `/api/resources/${targetId}/access`
        : `/api/resources/presign-access?key=${encodeURIComponent(storageKey)}`;

      fetch(endpoint)
        .then((res) => res.json())
        .then((json) => {
          if (isMounted) {
            if (json.success && json.data?.accessUrl) {
              setSignedUrl(json.data.accessUrl);
            } else {
              setHasError(true);
              setErrorMessage(json.error || 'Failed to authorize resource access.');
            }
            setAuthorizing(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setHasError(true);
            setErrorMessage((err as Error).message || 'Network error authorizing resource.');
            setAuthorizing(false);
          }
        });
    } else {
      setAuthorizing(false);
    }
    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    return fetchAccessUrl();
  }, [targetId, sourceType, fileUrl, isR2Url]);

  const effectiveUrl = signedUrl || fileUrl;

  const descriptor = getResourceEmbedDescriptor({
    title,
    fileUrl: effectiveUrl,
    resourceType,
    sourceType,
    fileType,
  });

  const formattedSize = formatBytes(fileSize);
  const canDownload = canDownloadResource({
    title,
    fileUrl: effectiveUrl,
    resourceType,
    sourceType,
    fileType,
    isDownloadable,
  });

  // 1. Authorizing state
  if (authorizing) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-12 text-slate-500 rounded-2xl border border-slate-200 bg-slate-50 ${className}`}
      >
        <RefreshCw className="h-7 w-7 animate-spin text-primary mb-3" />
        <p className="text-sm font-bold text-slate-800">Authorizing secure learning resource...</p>
        <p className="mt-1 text-xs text-slate-500">Preparing encrypted access token</p>
      </div>
    );
  }

  // 2. Authorization or access error state
  if (hasError && !signedUrl) {
    return (
      <div
        className={`rounded-2xl border border-red-200 bg-red-50/70 p-6 text-center ${className}`}
      >
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3">
          <AlertCircle className="h-5 w-5" />
        </div>
        <h4 className="text-base font-bold text-slate-900">Unable to Load Learning Resource</h4>
        <p className="mt-1.5 text-xs text-slate-600 max-w-md mx-auto">
          {errorMessage ||
            'The secure access link could not be verified. You may need to refresh your session or re-authenticate.'}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={fetchAccessUrl}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-white hover:bg-secondary transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry Access
          </button>
        </div>
      </div>
    );
  }

  // Security check: only allow safe embed domains
  const isEmbedSafe = descriptor.embedUrl ? isSafeEmbedUrl(descriptor.embedUrl) : false;

  // 3. YouTube Video Embed
  if (descriptor.kind === 'youtube' && descriptor.embedUrl && isEmbedSafe && !hasError) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 shadow-md">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white/70">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="text-primary h-6 w-6 animate-spin" />
                <span className="text-xs font-semibold">Loading video player...</span>
              </div>
            </div>
          )}
          <iframe
            src={descriptor.embedUrl}
            title={title}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-sky-100 px-2 py-0.5 font-bold text-sky-800 uppercase">
              <Video className="h-3 w-3" /> Video Lecture
            </span>
            {description && <span className="text-slate-600">{description}</span>}
          </div>
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            In-Portal Player
          </span>
        </div>
      </div>
    );
  }

  // 4. HTML5 Hosted Video Player (MP4, WebM, Cloudflare R2 Video)
  if (
    (descriptor.kind === 'html5_video' || (resourceType === 'VIDEO' && effectiveUrl)) &&
    !hasError
  ) {
    const videoSrc = effectiveUrl || descriptor.embedUrl;
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="relative aspect-video w-full max-w-5xl mx-auto overflow-hidden rounded-xl sm:rounded-2xl bg-black shadow-md">
          <video
            src={videoSrc}
            controls
            controlsList="nodownload"
            playsInline
            className="h-full w-full object-contain"
            onLoadedData={() => setIsLoading(false)}
            onCanPlay={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          >
            Your browser does not support HTML5 video playback.
          </video>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-sky-100 px-2 py-0.5 font-bold text-sky-800 uppercase">
              <Video className="h-3 w-3" /> Video Lecture
            </span>
            {formattedSize && <span>{formattedSize}</span>}
            {description && <span className="text-slate-600">· {description}</span>}
          </div>
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            In-Portal Player
          </span>
        </div>
      </div>
    );
  }

  // 5. Native Audio Player (.mp3, .wav, .ogg, .m4a, .aac)
  if (descriptor.kind === 'audio' || isAudioFile(fileType) || isAudioFile(effectiveUrl)) {
    return (
      <div
        className={`rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/60 via-white to-slate-50 p-6 shadow-sm space-y-4 ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="shrink-0 rounded-xl bg-sky-100 p-3 text-sky-700">
              <Volume2 className="h-6 w-6" />
            </div>
            <div>
              <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-black tracking-wider text-sky-800 uppercase">
                Audio Recording
              </span>
              <h4 className="mt-1 text-base font-bold text-slate-900">{title}</h4>
              {description && <p className="mt-1 text-xs text-slate-600">{description}</p>}
              {formattedSize && (
                <span className="mt-1 inline-block text-[11px] font-semibold text-slate-400">
                  Size: {formattedSize}
                </span>
              )}
            </div>
          </div>
          <a
            href={effectiveUrl}
            download
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Download className="h-3.5 w-3.5" /> Download Audio
          </a>
        </div>
        <audio src={effectiveUrl} controls className="w-full" preload="metadata">
          Your browser does not support audio playback.
        </audio>
      </div>
    );
  }

  // 6. Image Resource (.png, .jpg, .jpeg, .webp, .svg, .gif)
  if (descriptor.kind === 'image' || isImageFile(fileType) || isImageFile(effectiveUrl)) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/5 p-2 shadow-sm text-center">
          <img
            src={effectiveUrl}
            alt={title}
            className="mx-auto max-h-[600px] w-full rounded-xl object-contain"
            loading="lazy"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 uppercase">
              <ImageIcon className="h-3 w-3" /> Image Resource
            </span>
            {formattedSize && <span>{formattedSize}</span>}
            {description && <span className="text-slate-600">· {description}</span>}
          </div>
          <div className="flex items-center gap-3">
            <a
              href={effectiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Full Size
            </a>
            <a
              href={effectiveUrl}
              download
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <Download className="h-3.5 w-3.5" /> Download Image
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 7. Google Slide Presentation Embed (Genuinely hosted on Google Docs/Drive)
  if (descriptor.kind === 'google_slide' && descriptor.embedUrl && isEmbedSafe && !hasError) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-indigo-200 bg-slate-900 shadow-md">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white/70">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
                <span className="text-xs font-semibold">Loading presentation deck...</span>
              </div>
            </div>
          )}
          <iframe
            src={descriptor.embedUrl}
            title={title}
            className="h-full w-full border-0"
            allowFullScreen
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => setHasError(true)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 font-bold text-indigo-800 uppercase">
              <Presentation className="h-3 w-3" /> Slide Presentation
            </span>
            {description && <span className="text-slate-600">{description}</span>}
          </div>
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            In-Portal Player
          </span>
        </div>
      </div>
    );
  }

  // 8. PowerPoint Presentation Deck (.pptx, .ppt, .key)
  // Genuine, interactive in-portal PowerPoint slide viewer
  if (
    descriptor.kind === 'powerpoint' ||
    isPowerPointFile(fileType) ||
    isPowerPointFile(effectiveUrl) ||
    isPowerPointFile(fileUrl)
  ) {
    const computedStorageKey =
      extractR2StorageKey(fileUrl) || extractR2StorageKey(effectiveUrl) || fileUrl;

    return (
      <PowerPointViewer
        fileUrl={effectiveUrl}
        storageKey={computedStorageKey}
        title={title}
        description={description}
        fileSize={fileSize}
        isDownloadable={canDownload}
        className={className}
      />
    );
  }

  // 9. PDF Document & In-Portal PDF Slide Deck
  if (
    descriptor.kind === 'pdf' ||
    isPdfFile(fileType) ||
    isPdfFile(effectiveUrl) ||
    isPdfFile(fileUrl)
  ) {
    const computedStorageKey =
      extractR2StorageKey(fileUrl) || extractR2StorageKey(effectiveUrl) || fileUrl;

    return (
      <PdfViewer
        fileUrl={effectiveUrl}
        storageKey={computedStorageKey}
        title={title}
        description={description}
        fileSize={fileSize}
        cacheScope={cacheScope}
        className={className}
      />
    );
  }

  // 9b. Google Drive Documents & Files (Preview Only)
  if (
    (descriptor.kind === 'google_doc' || descriptor.kind === 'google_drive_file') &&
    descriptor.embedUrl &&
    isEmbedSafe &&
    !hasError
  ) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="relative h-[550px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:h-[700px]">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50 text-slate-500">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs font-semibold">Rendering document inside portal...</span>
              </div>
            </div>
          )}
          <iframe
            src={descriptor.embedUrl}
            title={title}
            className="h-full w-full border-0"
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 font-bold text-indigo-800 uppercase">
              <FileText className="h-3.5 w-3.5" /> Document Preview
            </span>
            {formattedSize && <span>{formattedSize}</span>}
            {description && <span className="text-slate-600">· {description}</span>}
          </div>
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            In-Portal Viewer
          </span>
        </div>
      </div>
    );
  }

  // 10. Downloadable Dataset / Generic File Card
  if (descriptor.kind === 'download_file' || resourceType === 'FILE') {
    const isDataset =
      resourceType === 'FILE' ||
      /\.(csv|xlsx|xls|zip|pbix|ipynb|parquet|tsv)(\?.*)?$/i.test(descriptor.originalUrl) ||
      ['csv', 'xlsx', 'xls', 'zip', 'pbix', 'ipynb', 'parquet', 'tsv', 'dataset'].includes(
        fileType?.toLowerCase() || ''
      ) ||
      /dataset|data/i.test(title);

    let fileName = '';
    try {
      const parsedUrl = new URL(descriptor.originalUrl, 'https://example.local');
      const segments = parsedUrl.pathname.split('/');
      fileName = segments[segments.length - 1] || '';
    } catch {
      fileName = '';
    }

    return (
      <div
        className={`space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="shrink-0 rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <FolderOpen className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-100/70 px-2 py-0.5 text-[10px] font-black tracking-wider text-emerald-700 uppercase">
                  {isDataset ? '📁 Practice Dataset' : '📁 Downloadable Resource'}
                </span>
                {fileType && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                    {fileType}
                  </span>
                )}
              </div>
              <h4 className="mt-1 text-base font-bold text-slate-900">{title}</h4>
              {fileName && fileName !== title && (
                <p className="mt-0.5 font-mono text-xs text-slate-500">{fileName}</p>
              )}
              {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
              {formattedSize && (
                <span className="mt-1.5 inline-block text-[11px] font-semibold text-slate-400">
                  Size: {formattedSize}
                </span>
              )}
            </div>
          </div>
          <a
            href={effectiveUrl}
            download
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Dataset</span>
          </a>
        </div>
      </div>
    );
  }

  // 11. Generic External Resource / Fallback Link Card
  let domain = '';
  try {
    domain = new URL(descriptor.originalUrl).hostname;
  } catch {
    domain = descriptor.originalUrl;
  }

  return (
    <div
      className={`space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-lg bg-slate-100 p-2.5 text-slate-600">
            {hasError ? (
              <AlertCircle className="h-6 w-6 text-amber-600" />
            ) : (
              <ExternalLink className="h-6 w-6 text-slate-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-900">{title}</h4>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                {fileType?.toUpperCase() || 'External'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {description || 'Learning resource and documentation.'}
            </p>
            {domain && (
              <span className="mt-1.5 inline-block text-xs font-semibold text-slate-400">
                Resource: {domain}
              </span>
            )}
          </div>
        </div>

        <a
          href={effectiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
        >
          <span>Open Resource</span>
          <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
        </a>
      </div>
    </div>
  );
}
