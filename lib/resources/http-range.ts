/** Accept only one byte range; PDF.js does not need multipart ranges. */
export function isSupportedByteRange(value: string): boolean {
  const match = value.trim().match(/^bytes=(\d*)-(\d*)$/i);
  if (!match || (!match[1] && !match[2])) return false;
  const start = match[1] ? Number(match[1]) : null;
  const end = match[2] ? Number(match[2]) : null;
  return (start === null || Number.isSafeInteger(start)) && (end === null || Number.isSafeInteger(end)) &&
    (start === null || end === null || start <= end) && (start !== null || end !== 0);
}

/** Return the only status we can safely expose for a storage range response. */
export function validateRangeResponse(
  requestRange: string | null,
  upstreamStatus: number | undefined,
  contentRange: string | undefined,
  contentLength: number | undefined
): 200 | 206 | null {
  if (!requestRange) return upstreamStatus === 200 || upstreamStatus === undefined ? 200 : null;

  // R2 or an upstream may ignore Range and return the complete object. Preserve that as 200.
  if (upstreamStatus === 200) return 200;
  if (upstreamStatus !== 206 || !contentRange || contentLength === undefined) return null;

  const parsed = contentRange.match(/^bytes (\d+)-(\d+)\/(\d+)$/i);
  if (!parsed) return null;
  const start = Number(parsed[1]);
  const end = Number(parsed[2]);
  const total = Number(parsed[3]);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || !Number.isSafeInteger(total)) return null;
  if (start < 0 || end < start || end >= total || end - start + 1 !== contentLength) return null;

  const requested = requestRange.trim().match(/^bytes=(\d*)-(\d*)$/i);
  if (!requested) return null;
  const requestedStart = requested[1] ? Number(requested[1]) : null;
  const requestedEnd = requested[2] ? Number(requested[2]) : null;
  if (requestedStart !== null) {
    if (start !== requestedStart || (requestedEnd !== null && end > requestedEnd)) return null;
  } else if (requestedEnd !== null && start !== Math.max(total - requestedEnd, 0)) {
    return null;
  }
  return 206;
}
