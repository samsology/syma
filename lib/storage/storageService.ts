import { StorageProvider, StorageObjectMetadata, UploadOptions, UploadResult } from './types';
import { r2Storage } from './r2Storage';
import { googleDriveStorage } from './googleDriveStorage';

export class StorageService implements StorageProvider {
  name = 'storage_service';
  private defaultProvider: StorageProvider;
  private providers: Map<string, StorageProvider>;

  constructor(defaultProvider: StorageProvider = r2Storage) {
    this.defaultProvider = defaultProvider;
    this.providers = new Map<string, StorageProvider>([
      ['r2', r2Storage],
      ['google_drive', googleDriveStorage],
    ]);
  }

  getProvider(providerName?: 'r2' | 'google_drive'): StorageProvider {
    if (!providerName) return this.defaultProvider;
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Storage provider '${providerName}' not registered.`);
    }
    return provider;
  }

  async upload(key: string, body: Buffer | Uint8Array | ReadableStream, options?: UploadOptions): Promise<UploadResult> {
    return this.defaultProvider.upload(key, body, options);
  }

  async delete(key: string): Promise<boolean> {
    return this.defaultProvider.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.defaultProvider.exists(key);
  }

  async getMetadata(key: string): Promise<StorageObjectMetadata | null> {
    return this.defaultProvider.getMetadata(key);
  }

  async getSignedUrl(key: string, expiresInSeconds?: number): Promise<string> {
    return this.defaultProvider.getSignedUrl(key, expiresInSeconds);
  }
}

export const storageService = new StorageService();
