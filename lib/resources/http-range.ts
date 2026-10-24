/** Accept only one byte range; PDF.js does not need multipart ranges. */
export function isSupportedByteRange(value: string): boolean {
  const match = value.trim().match(/^bytes=(\d*)-(\d*)$/i);
  if (!match || (!match[1] && !match[2])) return false;
  const start = match[1] ? Number(match[1]) : null;
  const end = match[2] ? Number(match[2]) : null;
  return (start === null || Number.isSafeInteger(start)) && (end === null || Number.isSafeInteger(end)) &&
    (start === null || end === null || start <= end) && (start !== null || end !== 0);
}

/** Pass a validated browser Range header through to the R2 GetObject request. */
export function getR2RangeOption(value: string | null): { Range?: string } {
  return value ? { Range: value } : {};
}

export interface ByteRangeResponseHeaderOptions {
  rangeSupported: boolean;
  status: 200 | 206;
  contentRange?: string;
  contentLength?: number;
}

/** Apply only byte-range metadata verified by the proxy's R2 response handling. */
export function applyByteRangeResponseHeaders(
  headers: Headers,
  options: ByteRangeResponseHeaderOptions
): void {
  if (options.rangeSupported) headers.set('Accept-Ranges', 'bytes');
  if (options.contentLength !== undefined) {
    headers.set('Content-Length', String(options.contentLength));
  }
  if (options.status === 206 && options.contentRange) {
    headers.set('Content-Range', options.contentRange);
  }
}

/** Preserve a valid unsatisfied-range length from an S3-compatible error, if supplied. */
export function getUnsatisfiedContentRange(error: unknown): string | null {
  const value = error as {
    ContentRange?: string;
    $response?: { headers?: Record<string, string | undefined> };
  };
  const candidate = value?.ContentRange ?? value?.$response?.headers?.['content-range'];
  return candidate && /^bytes \*\/\d+$/.test(candidate) ? candidate : null;
}

/** Return the only status we can safely expose for a storage range response. */
export function validateRangeResponse(
  requestRange: string | null,
  upstreamStatus: number | undefined,
  contentRange: string | undefined,
  contentLength: number | undefined
): 200 | 206 | null {
  if (!requestRange) return upstreamStatus === 200 || upstreamStatus === undefined ? 200 : null;

  // A full response cannot satisfy a Range request. Never present it as partial
  // or stream an unbounded full object as an automatic fallback.
  if (upstreamStatus === 200) return null;
  if (upstreamStatus !== 206 || !contentRange || contentLength === undefined) return null;

  const parsed = contentRange.match(/^bytes (\d+)-(\d+)\/(\d+)$/i);
  if (!parsed) return null;
  const start = Number(parsed[1]);
  const end = Number(parsed[2]);
  const total = Number(parsed[3]);
  if (
    !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || !Number.isSafeInteger(total) ||
    !Number.isSafeInteger(contentLength) || contentLength <= 0 || total <= 0 ||
    start < 0 || end < start || end >= total
  ) return null;

  const requested = requestRange.trim().match(/^bytes=(\d*)-(\d*)$/i);
  if (!requested) return null;
  const requestedStart = requested[1] ? Number(requested[1]) : null;
  const requestedEnd = requested[2] ? Number(requested[2]) : null;
  if (
    (requestedStart !== null && !Number.isSafeInteger(requestedStart)) ||
    (requestedEnd !== null && !Number.isSafeInteger(requestedEnd)) ||
    (requestedStart !== null && requestedEnd !== null && requestedStart > requestedEnd)
  ) return null;

  if (requestedStart !== null) {
    if (requestedStart >= total || start !== requestedStart) return null;
    const requiredEnd = requestedEnd === null ? total - 1 : Math.min(requestedEnd, total - 1);
    if (end !== requiredEnd) return null;
  } else {
    if (requestedEnd === null || requestedEnd === 0) return null;
    if (end !== total - 1 || start !== Math.max(0, total - requestedEnd)) return null;
  }
  // The validated interval is now safe and within the object, so this addition
  // cannot overflow the safe-integer range.
  if (end - start + 1 !== contentLength) return null;
  return 206;
}
