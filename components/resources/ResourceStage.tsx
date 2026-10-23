'use client';

import { useState } from 'react';
import {
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Play,
  Presentation,
  ShieldCheck,
  Video,
  X,
  Sparkles,
} from 'lucide-react';
import type { LessonResource, ResourceType, ResourceSource } from '@prisma/client';
import { ResourceRenderer } from './ResourceRenderer';
import {
  canDownloadResource,
  getResourceEmbedDescriptor,
  isR2StorageReference,
  getR2ProxyUrl,
} from '@/lib/resources/embed';

interface ResourceStageProps {
  cacheScope?: string;
  lessonTitle: string;
  primaryVideoUrl?: string | null;
  primarySlideUrl?: string | null;
  primaryResourceType?: 'SLIDE' | 'VIDEO' | null;
  resources: LessonResource[];
}

export function ResourceStage({
  cacheScope,
  lessonTitle,
  primaryVideoUrl,
  primarySlideUrl,
  primaryResourceType,
  resources,
}: ResourceStageProps) {
  // Determine initial active media
  let computedInitialActive: {
    id: string;
    title: string;
    fileUrl: string;
    resourceType?: ResourceType;
    sourceType?: ResourceSource;
    fileType?: string;
    fileSize?: number | null;
    description?: string | null;
    isDownloadable?: boolean;
  } | null = null;

  if (primaryVideoUrl) {
    const isR2 = isR2StorageReference(primaryVideoUrl);
    const ext = primaryVideoUrl.split('?')[0].split('.').pop()?.toLowerCase();

    computedInitialActive = {
      id: 'primary-video',
      title: `${lessonTitle} (Lecture Video)`,
      fileUrl: primaryVideoUrl,
      resourceType: 'VIDEO',
      sourceType:
        primaryVideoUrl.includes('youtube') || primaryVideoUrl.includes('youtu.be')
          ? 'YOUTUBE'
          : isR2
            ? 'R2'
            : 'EXTERNAL',
      fileType: ext && ext.length <= 5 ? ext : 'mp4',
      description: 'Official lecture walkthrough and explanation.',
    };
  } else if (primarySlideUrl && (!primaryVideoUrl || primaryResourceType === 'SLIDE')) {
    const isR2 = isR2StorageReference(primarySlideUrl);
    const ext = primarySlideUrl.split('?')[0].split('.').pop()?.toLowerCase();

    computedInitialActive = {
      id: 'primary-slide',
      title: `${lessonTitle} (Slide Deck)`,
      fileUrl: primarySlideUrl,
      resourceType: 'DOCUMENT',
      sourceType: isR2 ? 'R2' : 'GOOGLE_DRIVE',
      fileType: ext && ext.length <= 5 ? ext : 'pptx',
      description: 'Full presentation deck for this lesson.',
    };
  } else if (resources && resources.length > 0) {
    const viewableResources = resources.filter((r) => {
      const desc = getResourceEmbedDescriptor({
        title: r.name,
        fileUrl: r.fileUrl,
        resourceType: r.resourceType,
        sourceType: r.sourceType,
        fileType: r.fileType,
      });
      return desc.isEmbeddable;
    });

    if (viewableResources.length > 0) {
      let chosen = viewableResources[0];
      if (primaryResourceType === 'SLIDE') {
        const slideItem = viewableResources.find((r) => r.resourceType === 'DOCUMENT');
        if (slideItem) chosen = slideItem;
      } else {
        const videoItem = viewableResources.find((r) => r.resourceType === 'VIDEO');
        if (videoItem) chosen = videoItem;
      }

      computedInitialActive = {
        id: chosen.id,
        title: chosen.name,
        fileUrl: chosen.fileUrl,
        resourceType: chosen.resourceType,
        sourceType: chosen.sourceType,
        fileType: chosen.fileType,
        fileSize: chosen.fileSize,
        description: chosen.description,
        isDownloadable: chosen.isDownloadable,
      };
    }
  }

  const [activeMedia, setActiveMedia] = useState(computedInitialActive);

  return (
    <div className="space-y-6">
      {/* 1. Active In-Portal Media Stage */}
      {activeMedia && (
        <section
          id="in-portal-resource-stage"
          className="rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-sm transition"
        >
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-navy text-white shadow-xs">
                {activeMedia.resourceType === 'VIDEO' ? (
                  <Video className="h-4 w-4" />
                ) : activeMedia.resourceType === 'DOCUMENT' ? (
                  <Presentation className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-cerulean">
                    {activeMedia.resourceType === 'VIDEO' ? 'Interactive Video' : 'Slide Deck'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.2 text-[10px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Stage
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-950 truncate max-w-[220px] sm:max-w-md">
                  {activeMedia.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveMedia(null)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cerulean"
              title="Close viewer stage"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Minimize Stage</span>
            </button>
          </div>

          <ResourceRenderer
            cacheScope={cacheScope}
            id={activeMedia.id}
            title={activeMedia.title}
            fileUrl={activeMedia.fileUrl}
            resourceType={activeMedia.resourceType}
            sourceType={activeMedia.sourceType}
            fileType={activeMedia.fileType}
            fileSize={activeMedia.fileSize}
            description={activeMedia.description}
            isDownloadable={activeMedia.isDownloadable}
          />
        </section>
      )}

      {/* 2. Structured Learning Materials & Practice Assets */}
      {resources && resources.length > 0 && (
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-950 font-heading">
                Lesson Materials &amp; Practice Assets
              </h3>
              <p className="text-xs text-slate-500">
                Interactive slide presentations, video explainers, datasets, and clinical references
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
              {resources.length} {resources.length === 1 ? 'Resource' : 'Resources'}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {resources.map((resource) => {
              const descriptor = getResourceEmbedDescriptor({
                title: resource.name,
                fileUrl: resource.fileUrl,
                resourceType: resource.resourceType,
                sourceType: resource.sourceType,
                fileType: resource.fileType,
              });

              const isCurrentlyActive = activeMedia?.id === resource.id;

              const isDataset =
                resource.resourceType === 'FILE' ||
                descriptor.kind === 'download_file' ||
                [
                  'csv',
                  'xlsx',
                  'xls',
                  'zip',
                  'pbix',
                  'ipynb',
                  'parquet',
                  'tsv',
                  'dataset',
                ].includes(resource.fileType?.toLowerCase() || '') ||
                /dataset|data/i.test(resource.name);

              const isVideo = resource.resourceType === 'VIDEO' || descriptor.kind === 'youtube';
              const isSlide =
                resource.resourceType === 'DOCUMENT' || descriptor.kind === 'google_slide';

              const canDownloadInline =
                descriptor.isEmbeddable &&
                canDownloadResource({
                  title: resource.name,
                  fileUrl: resource.fileUrl,
                  resourceType: resource.resourceType,
                  sourceType: resource.sourceType,
                  fileType: resource.fileType,
                  isDownloadable: resource.isDownloadable,
                });

              const isR2Resource =
                resource.sourceType === 'R2' ||
                isR2StorageReference(resource.fileUrl) ||
                (!resource.fileUrl.startsWith('http') && !resource.fileUrl.startsWith('/'));

              const directDownloadHref = isR2Resource
                ? getR2ProxyUrl(resource.fileUrl, true) || resource.fileUrl
                : resource.fileUrl;

              return (
                <div
                  key={resource.id}
                  className={`group flex flex-col justify-between rounded-2xl border p-4 transition ${
                    isCurrentlyActive
                      ? 'border-emerald-300 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-200'
                      : 'border-slate-200/90 bg-white hover:border-brand-cerulean/50 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isVideo ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                            <Video className="h-3.5 w-3.5" />
                          </span>
                        ) : isSlide ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                            <Presentation className="h-3.5 w-3.5" />
                          </span>
                        ) : isDataset ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                            <FileText className="h-3.5 w-3.5" />
                          </span>
                        )}

                        <span
                          className={`rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                            isVideo
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : isSlide
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : isDataset
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isVideo
                            ? 'Video'
                            : isSlide
                              ? 'Slide Deck'
                              : isDataset
                                ? 'Dataset'
                                : 'Resource'}
                        </span>
                      </div>

                      {/* File format and size chip */}
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                        {resource.fileType && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-slate-600">
                            .{resource.fileType}
                          </span>
                        )}
                        {resource.fileSize ? (
                          <span>
                            {resource.fileSize < 1024 * 1024
                              ? `${Math.round(resource.fileSize / 1024)} KB`
                              : `${(resource.fileSize / (1024 * 1024)).toFixed(1)} MB`}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-950 group-hover:text-primary transition line-clamp-1">
                        {resource.name}
                      </h4>
                      {resource.description && (
                        <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {resource.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {descriptor.isEmbeddable ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMedia({
                            id: resource.id,
                            title: resource.name,
                            fileUrl: resource.fileUrl,
                            resourceType: resource.resourceType,
                            sourceType: resource.sourceType,
                            fileType: resource.fileType,
                            fileSize: resource.fileSize,
                            description: resource.description,
                            isDownloadable: resource.isDownloadable,
                          });
                          const elem = document.getElementById('in-portal-resource-stage');
                          elem?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 ${
                          isCurrentlyActive
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-primary text-white hover:bg-secondary'
                        }`}
                      >
                        {isVideo ? (
                          <Play className="h-3.5 w-3.5 fill-current" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        <span>{isCurrentlyActive ? 'Viewing Now' : 'Load in Stage'}</span>
                      </button>
                    ) : descriptor.kind === 'download_file' || isDataset ? (
                      <a
                        href={directDownloadHref}
                        download
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-700"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Dataset</span>
                      </a>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">
                        In-Portal Reference
                      </span>
                    )}

                    {canDownloadInline && (
                      <a
                        href={directDownloadHref}
                        download
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition"
                        title="Download a copy"
                      >
                        <Download className="h-3 w-3" />
                        <span className="hidden sm:inline">Save</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
