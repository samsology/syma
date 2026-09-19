'use client';

import { useState } from 'react';
import {
  AlertCircle,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Maximize2,
  Presentation,
  RefreshCw,
  Video,
} from 'lucide-react';
import {
  getResourceEmbedDescriptor,
  isSafeEmbedUrl,
} from '@/lib/resources/embed';
import type { ResourceType, ResourceSource } from '@/lib/resources/types';

interface ResourceRendererProps {
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
}

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResourceRenderer({
  title,
  fileUrl,
  resourceType,
  sourceType,
  fileType,
  fileSize,
  description,
  isDownloadable = true,
  className = '',
}: ResourceRendererProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const descriptor = getResourceEmbedDescriptor({
    title,
    fileUrl,
    resourceType,
    sourceType,
    fileType,
  });

  const formattedSize = formatBytes(fileSize);

  // Security check: only allow safe embed domains
  const isEmbedSafe = descriptor.embedUrl ? isSafeEmbedUrl(descriptor.embedUrl) : false;

  // 1. YouTube Video Embed
  if (descriptor.kind === 'youtube' && descriptor.embedUrl && isEmbedSafe && !hasError) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 shadow-md">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white/70">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
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
            <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 font-bold uppercase text-red-700">
              <Video className="h-3 w-3" /> YouTube Video
            </span>
            {description && <span className="text-slate-600">{description}</span>}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            In-Portal Player
          </span>
        </div>
      </div>
    );
  }

  // 2. HTML5 Hosted Video Player
  if (descriptor.kind === 'html5_video' && !hasError) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-md">
          <video
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
            onError={() => setHasError(true)}
          >
            <source src={descriptor.embedUrl} />
            Your browser does not support HTML5 video playback.
          </video>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-sky-100 px-2 py-0.5 font-bold uppercase text-sky-800">
              <Video className="h-3 w-3" /> Video Lecture
            </span>
            {formattedSize && <span>{formattedSize}</span>}
            {description && <span className="text-slate-600">· {description}</span>}
          </div>
          {isDownloadable && (
            <a
              href={descriptor.originalUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <Download className="h-3.5 w-3.5" /> Download Video
            </a>
          )}
        </div>
      </div>
    );
  }

  // 3. Google Slide Presentation Embed
  if (descriptor.kind === 'google_slide' && descriptor.embedUrl && isEmbedSafe && !hasError) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-indigo-200 bg-slate-900 shadow-md">
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
            <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 font-bold uppercase text-indigo-800">
              <Presentation className="h-3 w-3" /> Slide Presentation
            </span>
            {description && <span className="text-slate-600">{description}</span>}
          </div>
          <a
            href={descriptor.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline"
          >
            <Maximize2 className="h-3 w-3" /> Open Full Screen in Google Slides
          </a>
        </div>
      </div>
    );
  }

  // 4. Google Doc / Drive File / PDF Viewer
  if (
    (descriptor.kind === 'google_doc' ||
      descriptor.kind === 'google_drive_file' ||
      descriptor.kind === 'pdf') &&
    descriptor.embedUrl &&
    isEmbedSafe &&
    !hasError
  ) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="relative h-[480px] sm:h-[620px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-500">
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
            onError={() => setHasError(true)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-bold uppercase text-slate-700">
              <FileText className="h-3 w-3" /> Document
            </span>
            {formattedSize && <span>{formattedSize}</span>}
            {description && <span className="text-slate-600">· {description}</span>}
          </div>
          <div className="flex items-center gap-3">
            {isDownloadable && (
              <a
                href={descriptor.originalUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </a>
            )}
            <a
              href={descriptor.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
            >
              Open External <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 5. Downloadable Dataset / Generic File Card
  if (descriptor.kind === 'download_file') {
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
      <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 shrink-0">
              <FolderOpen className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  {isDataset ? '📁 Practice Dataset' : '📁 Downloadable Resource'}
                </span>
                {fileType && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                    {fileType}
                  </span>
                )}
              </div>
              <h4 className="mt-1 font-bold text-slate-900 text-base">{title}</h4>
              {fileName && fileName !== title && (
                <p className="text-xs font-mono text-slate-500 mt-0.5">{fileName}</p>
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
            href={descriptor.originalUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>{isDataset ? 'Download Dataset' : 'Download File'}</span>
          </a>
        </div>
      </div>
    );
  }

  // 6. External Link Card
  if (descriptor.kind === 'external_link' || !isEmbedSafe || hasError) {
    let domain = '';
    try {
      domain = new URL(descriptor.originalUrl).hostname.replace(/^www\./, '');
    } catch {
      domain = descriptor.originalUrl;
    }

    return (
      <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600 shrink-0">
              {hasError ? (
                <AlertCircle className="h-6 w-6 text-amber-600" />
              ) : (
                <ExternalLink className="h-6 w-6 text-slate-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-base">{title}</h4>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                  External
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {hasError
                  ? 'This resource cannot be displayed directly inside an inline frame due to browser or security policies.'
                  : description || 'External reference material and documentation.'}
              </p>
              <span className="mt-1.5 inline-block text-xs font-semibold text-slate-400">
                Host: {domain}
              </span>
            </div>
          </div>

          <a
            href={descriptor.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shrink-0"
          >
            <span>Open External Resource</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          </a>
        </div>
      </div>
    );
  }

  return null;
}
