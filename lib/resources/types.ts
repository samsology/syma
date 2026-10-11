export type ResourceType = 'VIDEO' | 'DOCUMENT' | 'FILE' | 'LINK';

export type ResourceSource = 'YOUTUBE' | 'GOOGLE_DRIVE' | 'UPLOAD' | 'EXTERNAL' | 'R2';

export interface ResourceView {
  id: string;
  lessonId: string;
  name: string;
  description?: string | null;
  resourceType: ResourceType;
  sourceType: ResourceSource;
  fileUrl: string;
  fileType: string;
  fileSize?: number | null;
  storageKey?: string | null;
  mimeType?: string | null;
  sortOrder: number;
  isDownloadable: boolean;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface EmbedDescriptor {
  kind:
    | 'youtube'
    | 'html5_video'
    | 'audio'
    | 'image'
    | 'google_slide'
    | 'google_doc'
    | 'google_drive_file'
    | 'pdf'
    | 'powerpoint'
    | 'download_file'
    | 'external_link';
  embedUrl?: string;
  originalUrl: string;
  title: string;
  isEmbeddable: boolean;
  requiresExternalFallback: boolean;
  fallbackMessage?: string;
}
