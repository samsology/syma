'use client';

import { parseApiResponse } from '@/lib/api/safe-response';

export interface DirectUploadOptions {
  file: File;
  courseId: string;
  lessonId: string;
  resourceType: 'VIDEO' | 'DOCUMENT' | 'SLIDE' | 'FILE' | 'DATASET' | string;
  onProgress?: (progressPercent: number) => void;
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
  const { file, courseId, lessonId, resourceType, onProgress } = options;

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
        lessonId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        resourceType,
      }),
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
  const contentType = headers?.['Content-Type'] || file.type || 'application/octet-stream';

  onProgress?.(10);

  // Step 2: Direct binary PUT to Cloudflare R2 via XMLHttpRequest with progress tracking
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
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
        const errorText = xhr.responseText || xhr.statusText;
        reject(
          new Error(
            `Cloudflare R2 rejected upload with status ${xhr.status} (${xhr.statusText}). ${errorText}`
          )
        );
      }
    };

    xhr.onerror = () => {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://syma-nine.vercel.app';
      reject(
        new Error(
          `Cloudflare R2 blocked direct browser upload from ${origin}. This is caused by missing CORS rules on the R2 bucket 'syma-tech-resources'. Please ensure AllowedOrigins includes '${origin}' and AllowedMethods includes PUT and GET.`
        )
      );
    };

    xhr.ontimeout = () => {
      reject(new Error('Cloudflare R2 upload timed out. Please check your internet connection and retry.'));
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
        lessonId,
      }),
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
