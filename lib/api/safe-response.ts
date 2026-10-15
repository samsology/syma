/**
 * Safe API response parsing utility for Syma Tech.
 * Guarantees zero "Unexpected token '<' / 'R' is not valid JSON" parsing crashes,
 * cleanly handling Vercel 413 Request Entity Too Large, upstream gateway errors,
 * HTML error pages, and server timeouts.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export async function parseApiResponse<T = any>(res: Response): Promise<ApiResponse<T>> {
  const status = res.status;
  const contentType = (res.headers.get('content-type') || '').toLowerCase();

  // 1. Detect Vercel / Cloudflare HTTP 413 Request Entity Too Large
  if (status === 413) {
    return {
      ok: false,
      status: 413,
      error:
        'The file exceeds the Vercel serverless request body limit (4.5 MB). Large video and slide files must be uploaded directly to Cloudflare R2 via presigned upload URL.',
    };
  }

  // 2. Safe JSON parsing if content-type declares JSON
  if (contentType.includes('application/json')) {
    try {
      const json = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          status,
          error: json.error || json.message || `Request failed with HTTP status ${status}.`,
        };
      }
      return {
        ok: true,
        status,
        data: json.data !== undefined ? json.data : json,
        error: json.error,
      };
    } catch (parseErr) {
      console.warn('[parseApiResponse] Failed to parse JSON response body:', parseErr);
    }
  }

  // 3. Fallback for non-JSON responses (HTML, plain text, Gateway 502/504)
  let rawText = '';
  try {
    rawText = await res.text();
  } catch {
    // Ignore text extraction failure
  }

  // Strip HTML tags and truncate for user display
  const cleanSnippet = rawText
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  // Common infrastructure status mappings
  if (status === 401) {
    return {
      ok: false,
      status,
      error: 'Admin authentication required. Please refresh your session.',
    };
  }

  if (status === 403) {
    return {
      ok: false,
      status,
      error: 'Access denied. You do not have permission to modify this course resource.',
    };
  }

  if (status === 404) {
    return {
      ok: false,
      status,
      error: 'The requested resource endpoint was not found.',
    };
  }

  if (status === 504 || status === 502) {
    return {
      ok: false,
      status,
      error: 'Upstream gateway timeout. The upload operation took too long to respond.',
    };
  }

  if (status >= 500) {
    return {
      ok: false,
      status,
      error: cleanSnippet || `Internal server error (${status}). Please try again later.`,
    };
  }

  return {
    ok: res.ok,
    status,
    error: cleanSnippet || `Unexpected response (${status}) from server.`,
  };
}
