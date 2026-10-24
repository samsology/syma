export const PDF_BUFFER_FALLBACK_MAX_BYTES = 32 * 1024 * 1024;

/** Read a PDF response into a correctly sized byte view without duplicating known-length bodies. */
export async function readPdfResponse(
  response: Response,
  signal: AbortSignal,
  onProgress: (loaded: number, total: number) => void
): Promise<Uint8Array> {
  const contentLength = Number(response.headers.get('content-length')) || 0;
  if (contentLength > PDF_BUFFER_FALLBACK_MAX_BYTES) {
    throw new Error('This presentation is too large for the fallback viewer. Contact your course administrator.');
  }
  if (!response.body) {
    throw new Error('The presentation response could not be streamed safely. Retry the presentation.');
  }

  const reader = response.body.getReader();
  let buffer = new Uint8Array(contentLength || Math.min(64 * 1024, PDF_BUFFER_FALLBACK_MAX_BYTES));
  let loaded = 0;
  try {
    while (true) {
      if (signal.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      const nextLoaded = loaded + value.byteLength;
      if (nextLoaded > PDF_BUFFER_FALLBACK_MAX_BYTES) {
        await reader.cancel();
        throw new Error('This presentation is too large for the fallback viewer. Contact your course administrator.');
      }
      if (nextLoaded > buffer.byteLength) {
        const nextBuffer = new Uint8Array(
          Math.min(PDF_BUFFER_FALLBACK_MAX_BYTES, Math.max(nextLoaded, buffer.byteLength * 2))
        );
        nextBuffer.set(buffer.subarray(0, loaded));
        buffer = nextBuffer;
      }

      buffer.set(value, loaded);
      loaded = nextLoaded;
      onProgress(loaded, contentLength);
    }
  } finally {
    reader.releaseLock();
  }

  if (contentLength > 0 && loaded !== contentLength) {
    throw new Error('The presentation download ended before all bytes arrived. Retry the presentation.');
  }
  return buffer.subarray(0, loaded);
}

/** Keep the existing PDF magic-byte check shared and directly testable. */
export function validatePdfSignature(bytes: Uint8Array): void {
  const header = String.fromCharCode(...bytes.subarray(0, 5));
  if (!header.startsWith('%PDF')) {
    throw new Error('Received resource is not a valid PDF document.');
  }
}
