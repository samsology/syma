export type ResourceType = 'VIDEO' | 'DOCUMENT' | 'FILE' | 'LINK';

export type ResourceSource = 'YOUTUBE' | 'GOOGLE_DRIVE' | 'UPLOAD' | 'EXTERNAL';

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
  sortOrder: number;
  isDownloadable: boolean;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface EmbedDescriptor {
  kind: 'youtube' | 'html5_video' | 'google_slide' | 'google_doc' | 'google_drive_file' | 'pdf' | 'download_file' | 'external_link';
  embedUrl?: string;
  originalUrl: string;
  title: string;
  isEmbeddable: boolean;
  requiresExternalFallback: boolean;
  fallbackMessage?: string;
}
