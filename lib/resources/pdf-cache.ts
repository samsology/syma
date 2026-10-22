/**
 * In-Memory PDF Document Cache (Client-side Session Cache)
 *
 * Caches parsed PDFDocumentProxy instances in client memory during a session.
 * Avoids repeated full-document parsing, binary downloads, and worker startup
 * when a student switches between tabs (e.g. video / slide / instructions)
 * or revisits previously viewed lessons within their session.
 *
 * Security & Isolation:
 * - Session-scoped in the browser tab's memory only
 * - Never cached publicly or shared across student boundaries
 * - Bounded by an LRU eviction limit to prevent browser memory bloat
 * - Supports explicit TTL invalidation and on-demand cache clearing
 */

export interface CachedDocumentEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any;
  totalPages: number;
  cachedAt: number;
}

const documentCache = new Map<string, CachedDocumentEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_ENTRIES = 5;

/**
 * Retrieves a cached document proxy if present and not expired.
 */
export function getCachedDocument(key: string): CachedDocumentEntry | null {
  const entry = documentCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    try {
      entry.doc?.destroy?.();
    } catch {
      // ignore destruction errors
    }
    documentCache.delete(key);
    return null;
  }

  return entry;
}

/**
 * Stores a parsed PDFDocumentProxy in the session cache with LRU eviction.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setCachedDocument(key: string, doc: any, totalPages: number): void {
  if (documentCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = documentCache.keys().next().value;
    if (oldestKey) {
      const old = documentCache.get(oldestKey);
      try {
        old?.doc?.destroy?.();
      } catch {
        // ignore
      }
      documentCache.delete(oldestKey);
    }
  }

  documentCache.set(key, { doc, totalPages, cachedAt: Date.now() });
}

/**
 * Clears a specific cached resource or all cached documents.
 */
export function invalidateDocumentCache(key?: string): void {
  if (key) {
    const entry = documentCache.get(key);
    try {
      entry?.doc?.destroy?.();
    } catch {
      // ignore
    }
    documentCache.delete(key);
  } else {
    for (const [, entry] of documentCache) {
      try {
        entry?.doc?.destroy?.();
      } catch {
        // ignore
      }
    }
    documentCache.clear();
  }
}

/**
 * Returns current cache size (used for diagnostics and tests).
 */
export function getDocumentCacheSize(): number {
  return documentCache.size;
}
