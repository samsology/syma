'use client';

import { useState } from 'react';
import {
  Download,
  ExternalLink,
  Eye,
  FileText,
  Play,
  Presentation,
  Video,
  X,
} from 'lucide-react';
import type { LessonResource } from '@prisma/client';
import { ResourceRenderer } from './ResourceRenderer';
import { getResourceEmbedDescriptor } from '@/lib/resources/embed';

interface ResourceStageProps {
  lessonTitle: string;
  primaryVideoUrl?: string | null;
  primarySlideUrl?: string | null;
  primaryResourceType?: 'SLIDE' | 'VIDEO' | null;
  resources: LessonResource[];
}

export function ResourceStage({
  lessonTitle,
  primaryVideoUrl,
  primarySlideUrl,
  primaryResourceType,
  resources,
}: ResourceStageProps) {
  // Determine initial active media
  const initialActive = primaryVideoUrl
    ? {
        id: 'primary-video',
        title: `${lessonTitle} (Lecture Video)`,
        fileUrl: primaryVideoUrl,
        resourceType: 'VIDEO' as const,
        sourceType: (primaryVideoUrl.includes('youtube') || primaryVideoUrl.includes('youtu.be')
          ? 'YOUTUBE'
          : 'EXTERNAL') as any,
        description: 'Official lecture walkthrough and explanation.',
      }
    : primarySlideUrl && primaryResourceType === 'SLIDE'
    ? {
        id: 'primary-slide',
        title: `${lessonTitle} (Slide Deck)`,
        fileUrl: primarySlideUrl,
        resourceType: 'DOCUMENT' as const,
        sourceType: 'GOOGLE_DRIVE' as any,
        description: 'Full presentation deck for this lesson.',
      }
    : null;

  const [activeMedia, setActiveMedia] = useState<{
    id: string;
    title: string;
    fileUrl: string;
    resourceType?: any;
    sourceType?: any;
    fileType?: string;
    fileSize?: number | null;
    description?: string | null;
    isDownloadable?: boolean;
  } | null>(initialActive);

  return (
    <div className="space-y-6">
      {/* Active In-Portal Media Stage */}
      {activeMedia && (
        <section
          id="in-portal-resource-stage"
          className="rounded-2xl border-2 border-primary/20 bg-slate-900/5 p-4 sm:p-6 shadow-sm transition"
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
                {activeMedia.resourceType === 'VIDEO' ? (
                  <Video className="h-4 w-4" />
                ) : activeMedia.resourceType === 'DOCUMENT' ? (
                  <Presentation className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                  In-Portal Learning Viewer
                </span>
                <h3 className="text-base font-bold text-slate-950">{activeMedia.title}</h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveMedia(null)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              title="Close viewer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Hide Viewer</span>
            </button>
          </div>

          <ResourceRenderer
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

      {/* Lesson Attached Resources List */}
      {resources && resources.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xl font-black text-slate-950">Lesson Resources &amp; Materials</h3>
            <p className="mt-1 text-xs text-slate-500">
              Consume interactive presentations, video explainers, datasets, and guides directly within this lesson.
            </p>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {resources.map((resource) => {
              const descriptor = getResourceEmbedDescriptor({
                title: resource.name,
                fileUrl: resource.fileUrl,
                resourceType: resource.resourceType,
                sourceType: resource.sourceType,
                fileType: resource.fileType,
              });

              const isCurrentlyActive = activeMedia?.id === resource.id;

              return (
                <div
                  key={resource.id}
                  className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-700">
                      {resource.resourceType === 'VIDEO' || descriptor.kind === 'youtube' ? (
                        <Video className="h-4 w-4 text-sky-600" />
                      ) : resource.resourceType === 'DOCUMENT' ||
                        descriptor.kind === 'google_slide' ? (
                        <Presentation className="h-4 w-4 text-indigo-600" />
                      ) : descriptor.kind === 'download_file' ? (
                        <FileText className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <ExternalLink className="h-4 w-4 text-slate-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-sm">{resource.name}</p>
                        {resource.resourceType && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-black uppercase tracking-wider text-slate-600">
                            {resource.resourceType}
                          </span>
                        )}
                      </div>
                      {resource.description && (
                        <p className="mt-0.5 text-xs text-slate-500">{resource.description}</p>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 uppercase font-semibold">
                        <span>{resource.fileType}</span>
                        {resource.fileSize ? (
                          <span>
                            · {resource.fileSize < 1024 * 1024
                              ? `${(resource.fileSize / 1024).toFixed(1)} KB`
                              : `${(resource.fileSize / (1024 * 1024)).toFixed(1)} MB`}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
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
                          // Smooth scroll into stage view
                          const elem = document.getElementById('in-portal-resource-stage');
                          elem?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          isCurrentlyActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-primary text-white hover:bg-secondary'
                        }`}
                      >
                        {resource.resourceType === 'VIDEO' ? (
                          <Play className="h-3.5 w-3.5 fill-current" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {isCurrentlyActive
                            ? 'Viewing in Portal'
                            : resource.resourceType === 'VIDEO'
                            ? 'Watch in Portal'
                            : 'View in Portal'}
                        </span>
                      </button>
                    ) : descriptor.kind === 'download_file' ? (
                      <a
                        href={resource.fileUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    ) : (
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                      >
                        <span>Visit Link</span>
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </a>
                    )}

                    {descriptor.isEmbeddable && resource.isDownloadable && (
                      <a
                        href={resource.fileUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        title="Download file directly"
                      >
                        <Download className="h-3.5 w-3.5" />
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
