import { StorageProvider, StorageObjectMetadata, UploadOptions, UploadResult } from './types';

export class GoogleDriveStorageProvider implements StorageProvider {
  name = 'google_drive';

  async upload(_key: string, _body: Buffer | Uint8Array | ReadableStream, _options?: UploadOptions): Promise<UploadResult> {
    void _key; void _body; void _options;
    throw new Error('Direct file uploads to Google Drive are not supported. Use R2 storage for file uploads.');
  }

  async delete(_key: string): Promise<boolean> {
    void _key;
    // Google Drive resources are managed externally by link reference
    return true;
  }

  async exists(key: string): Promise<boolean> {
    return typeof key === 'string' && key.trim().length > 0;
  }

  async getMetadata(_key: string): Promise<StorageObjectMetadata | null> {
    void _key;
    return {
      contentType: 'text/html',
    };
  }

  async getSignedUrl(key: string): Promise<string> {
    // Return original URL or embed URL for Google Drive links
    return key;
  }
}

export const googleDriveStorage = new GoogleDriveStorageProvider();
