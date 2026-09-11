import crypto from 'node:crypto';

export const REGISTRATION_TOKEN_EXPIRY_HOURS = 48;
export const REGISTRATION_TOKEN_EXPIRY_MS = REGISTRATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;

export type GeneratedRegistrationToken = {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
};

/**
 * Generates a cryptographically random, unpredictable 32-byte registration token,
 * along with its SHA-256 hash for secure storage and a 48-hour expiration timestamp.
 */
export function generateRegistrationToken(): GeneratedRegistrationToken {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashRegistrationToken(rawToken);
  const expiresAt = new Date(Date.now() + REGISTRATION_TOKEN_EXPIRY_MS);

  return {
    rawToken,
    tokenHash,
    expiresAt,
  };
}

/**
 * Computes a SHA-256 hash of the supplied registration token for database lookup.
 */
export function hashRegistrationToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Returns the canonical registration continuation URL for an applicant.
 */
export function getContinuationUrl(rawToken: string): string {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://symatechsolutions.com').replace(/\/$/, '');
  return `${baseUrl}/continue-registration/${encodeURIComponent(rawToken.trim())}`;
}
