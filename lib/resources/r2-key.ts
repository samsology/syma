import { extractR2StorageKey } from './embed';

/** Normalize an R2 reference and reject ambiguous or traversal-like object keys. */
export function normalizeR2ResourceKey(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('/') || /[\u0000-\u001f\u007f\\]/.test(trimmed)) {
    return null;
  }

  const extracted = extractR2StorageKey(trimmed);
  const key = extracted || trimmed.replace(/^r2:\/\//i, '').split('?')[0];
  if (
    /[\u0000-\u001f\u007f\\]/.test(key) ||
    /%(?:2e|2f|5c)/i.test(key) ||
    key.startsWith('/') ||
    !key ||
    key.split('/').some((segment) => !segment || segment === '.' || segment === '..')
  ) {
    return null;
  }

  return key;
}

export function r2ReferenceMatchesKey(reference: string | null | undefined, key: string): boolean {
  return Boolean(reference && normalizeR2ResourceKey(reference) === key);
}
