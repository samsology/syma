export interface StorageObjectMetadata {
  contentType?: string;
  size?: number;
  lastModified?: Date;
  etag?: string;
}

export interface UploadOptions {
  contentType?: string;
  isPublic?: boolean;
}

export interface UploadResult {
  key: string;
  url?: string;
}

export interface StorageProvider {
  name: string;
  upload(key: string, body: Buffer | Uint8Array | ReadableStream, options?: UploadOptions): Promise<UploadResult>;
  delete(key: string): Promise<boolean>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  exists(key: string): Promise<boolean>;
  getMetadata(key: string): Promise<StorageObjectMetadata | null>;
}
