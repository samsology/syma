'use client';

import { parseApiResponse } from '@/lib/api/safe-response';

export interface DirectUploadOptions {
  file: File;
  courseId: string;
  lessonId?: string;
  weekId?: string;
  resourceType: 'VIDEO' | 'DOCUMENT' | 'SLIDE' | 'FILE' | 'DATASET' | string;
  onProgress?: (progressPercent: number) => void;
  onStorageKey?: (storageKey: string) => void;
}

export interface DirectUploadResult {
  storageKey: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
}

/**
 * Uploads a file directly from the browser to Cloudflare R2 via presigned PUT URL.
 * Avoids passing large video or document binaries through Vercel serverless request bodies.
 * Tracks upload progress (0-100%) and verifies object storage in Cloudflare R2 upon completion.
 */
export async function uploadFileDirectToR2(
  options: DirectUploadOptions
): Promise<DirectUploadResult> {
  const { file, courseId, lessonId, weekId, resourceType, onProgress, onStorageKey } = options;

  if (!file) {
    throw new Error('No file selected for upload.');
  }

  // Pre-check file size (1 GB limit)
  const MAX_SIZE_BYTES = 1024 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File size exceeds the 1 GB maximum limit.');
  }

  // Step 1: Request presigned upload authorization from Syma Tech server
  onProgress?.(5);

  let authRes: Response;
  try {
    authRes = await fetch('/api/admin/resources/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId,
        ...(lessonId ? { lessonId } : {}),
        ...(weekId ? { weekId } : {}),
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        resourceType,
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (netErr) {
    throw new Error(`Failed to contact Syma Tech upload authorization endpoint: ${(netErr as Error).message}`);
  }

  const parsedAuth = await parseApiResponse<{
    uploadUrl: string;
    storageKey: string;
    method?: string;
    headers?: Record<string, string>;
  }>(authRes);

  if (!parsedAuth.ok || !parsedAuth.data?.uploadUrl) {
    throw new Error(parsedAuth.error || 'Failed to authorize Cloudflare R2 upload.');
  }

  const { uploadUrl, storageKey, headers } = parsedAuth.data;
  onStorageKey?.(storageKey);
  const contentType = headers?.['Content-Type'] || file.type || 'application/octet-stream';

  onProgress?.(10);

  // Step 2: Direct binary PUT to Cloudflare R2 via XMLHttpRequest with progress tracking
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.timeout = 120_000;
    xhr.setRequestHeader('Content-Type', contentType);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        // Smoothly map upload progress from 10% to 90%
        const percent = Math.round((event.loaded / event.total) * 100);
        const mapped = Math.min(90, Math.max(10, Math.round(10 + percent * 0.8)));
        onProgress(mapped);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        const code = xhr.responseText.match(/<Code>([^<]+)<\/Code>/i)?.[1];
        if (xhr.status === 403 && code === 'RequestExpired') {
          reject(new Error('The Cloudflare R2 upload authorization expired before the upload started. Please retry.'));
          return;
        }
        if (xhr.status === 403) {
          reject(new Error('Cloudflare R2 denied the upload (403). The signed request may not match its Content-Type or may no longer be valid. Please retry; if it continues, contact an administrator.'));
          return;
        }
        if (xhr.status === 404) {
          reject(new Error('Cloudflare R2 could not find the target bucket or object (404). Please contact an administrator.'));
          return;
        }
        if (xhr.status === 413) {
          reject(new Error('Cloudflare R2 rejected the upload because the request is too large (413).'));
          return;
        }
        if (xhr.status >= 500) {
          reject(new Error(`Cloudflare R2 is temporarily unavailable (${xhr.status}). Please retry later.`));
          return;
        }
        reject(new Error(`Cloudflare R2 rejected the upload (${xhr.status || 'unknown status'}). Please retry or contact an administrator.`));
      }
    };

    xhr.onerror = () => {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'this site';
      reject(new Error(`The browser could not read a response from Cloudflare R2 for ${origin}. This can be a CORS/preflight rejection or a network/TLS failure; check the browser Network panel for the OPTIONS and PUT requests before changing bucket settings.`));
    };

    xhr.ontimeout = () => {
      reject(new Error('Cloudflare R2 upload timed out. The server will verify the object before saving; retry Save Assignment to continue.'));
    };

    xhr.onabort = () => {
      reject(new Error('Cloudflare R2 upload was cancelled before it could be confirmed.'));
    };

    xhr.send(file);
  });

  // Step 3: Verify the uploaded object exists and is valid in Cloudflare R2
  onProgress?.(95);

  let verifyRes: Response;
  try {
    verifyRes = await fetch('/api/admin/resources/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storageKey,
        expectedSize: file.size,
        expectedType: file.type,
        courseId,
        ...(lessonId ? { lessonId } : {}),
        ...(weekId ? { weekId } : {}),
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (netErr) {
    throw new Error(`Failed to contact verification endpoint: ${(netErr as Error).message}`);
  }

  const parsedVerify = await parseApiResponse<{
    verified: boolean;
    storageKey: string;
    size: number;
    contentType: string;
  }>(verifyRes);

  if (!parsedVerify.ok || !parsedVerify.data?.verified) {
    throw new Error(parsedVerify.error || 'Failed to verify uploaded object in Cloudflare R2.');
  }

  onProgress?.(100);

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'file';

  return {
    storageKey,
    fileUrl: `r2://${storageKey}`,
    fileName: file.name,
    fileSize: parsedVerify.data.size || file.size,
    fileType: fileExt,
    mimeType: parsedVerify.data.contentType || contentType,
  };
}
