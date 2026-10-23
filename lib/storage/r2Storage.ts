import {
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Client, getR2BucketName } from './r2Client';
import { StorageProvider, StorageObjectMetadata, UploadOptions, UploadResult } from './types';

export class R2StorageProvider implements StorageProvider {
  name = 'r2';

  private requestOptions() {
    // Bound storage waits so a stalled R2 request cannot leave a Server Action
    // pending indefinitely. The signal also aborts the underlying SDK request.
    return { abortSignal: AbortSignal.timeout(25_000) };
  }

  async upload(
    key: string,
    body: Buffer | Uint8Array | ReadableStream,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const client = getR2Client();
    const bucket = getR2BucketName();

    let bufferBody: Buffer;
    if (Buffer.isBuffer(body)) {
      bufferBody = body;
    } else if (body instanceof Uint8Array) {
      bufferBody = Buffer.from(body);
    } else {
      const chunks: Uint8Array[] = [];
      const reader = body.getReader();
      let done = false;
      while (!done) {
        const res = await reader.read();
        done = res.done;
        if (res.value) chunks.push(res.value);
      }
      bufferBody = Buffer.concat(chunks);
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bufferBody,
      ContentType: options?.contentType || 'application/octet-stream',
    });

    await client.send(command, this.requestOptions());

    return {
      key,
    };
  }

  async delete(key: string): Promise<boolean> {
    const client = getR2Client();
    const bucket = getR2BucketName();

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await client.send(command, this.requestOptions());
    return true;
  }

  async exists(key: string): Promise<boolean> {
    const metadata = await this.getMetadata(key);
    return metadata !== null;
  }

  async getMetadata(key: string): Promise<StorageObjectMetadata | null> {
    const client = getR2Client();
    const bucket = getR2BucketName();

    const candidateKeys = [
      key,
      key.startsWith(`${bucket}/`) ? key.slice(bucket.length + 1) : `${bucket}/${key}`,
    ];

    for (const candidate of candidateKeys) {
      try {
        const command = new HeadObjectCommand({
          Bucket: bucket,
          Key: candidate,
        });

        const response = await client.send(command, this.requestOptions());
        return {
          contentType: response.ContentType,
          size: response.ContentLength,
          lastModified: response.LastModified,
          etag: response.ETag,
        };
      } catch (err: unknown) {
        const error = err as { name?: string; $metadata?: { httpStatusCode?: number } };
        if (error.name === 'NotFound' || error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
          continue;
        }
        throw err;
      }
    }
    return null;
  }

  async getSignedUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    const client = getR2Client();
    const bucket = getR2BucketName();

    const candidateKeys = [
      key,
      key.startsWith(`${bucket}/`) ? key.slice(bucket.length + 1) : `${bucket}/${key}`,
    ];

    let resolvedKey = key;
    for (const candidate of candidateKeys) {
      try {
        await client.send(new HeadObjectCommand({ Bucket: bucket, Key: candidate }), this.requestOptions());
        resolvedKey = candidate;
        break;
      } catch {
        // try next
      }
    }

    const ext = resolvedKey.split('.').pop()?.toLowerCase();
    let responseContentType: string | undefined;
    switch (ext) {
      case 'pdf':
        responseContentType = 'application/pdf';
        break;
      case 'mp4':
        responseContentType = 'video/mp4';
        break;
      case 'webm':
        responseContentType = 'video/webm';
        break;
      case 'png':
        responseContentType = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
        responseContentType = 'image/jpeg';
        break;
      case 'pptx':
        responseContentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
      case 'ppt':
        responseContentType = 'application/vnd.ms-powerpoint';
        break;
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: resolvedKey,
      ResponseContentDisposition: 'inline',
      ...(responseContentType ? { ResponseContentType: responseContentType } : {}),
    });

    return getS3SignedUrl(client, command, { expiresIn: expiresInSeconds });
  }
}

export const r2Storage = new R2StorageProvider();
