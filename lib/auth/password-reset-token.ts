import crypto from 'node:crypto';
import { db } from '@/lib/db';

export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;
export const PASSWORD_RESET_TOKEN_EXPIRY_MS = PASSWORD_RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;

export type GeneratedPasswordResetToken = {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
};

export type TokenValidationResult =
  | {
      valid: true;
      tokenRecord: {
        id: string;
        studentId: string;
        tokenHash: string;
        expiresAt: Date;
        usedAt: Date | null;
        createdAt: Date;
      };
      student: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
      };
    }
  | {
      valid: false;
      reason: 'invalid' | 'expired' | 'used' | 'inactive_student';
    };

/**
 * Generates a cryptographically random, unpredictable 32-byte password reset token,
 * along with its SHA-256 hash for secure storage and a 1-hour expiration timestamp.
 */
export function generatePasswordResetToken(): GeneratedPasswordResetToken {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MS);

  return {
    rawToken,
    tokenHash,
    expiresAt,
  };
}

/**
 * Computes a SHA-256 hash of the supplied password reset token for database lookup.
 */
export function hashPasswordResetToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Returns the canonical password reset URL for a student.
 */
export function getPasswordResetUrl(rawToken: string): string {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://symatechsolutions.com').replace(/\/$/, '');
  return `${baseUrl}/student/reset-password?token=${encodeURIComponent(rawToken.trim())}`;
}

/**
 * Validates a reset token securely against the database.
 * Checks for token existence, expiration, single-use status, and student account status.
 */
export async function validatePasswordResetToken(rawToken: string): Promise<TokenValidationResult> {
  const trimmed = rawToken?.trim();
  if (!trimmed) {
    return { valid: false, reason: 'invalid' };
  }

  const tokenHash = hashPasswordResetToken(trimmed);

  const tokenRecord = await db.studentPasswordResetToken.findUnique({
    where: { tokenHash },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
        },
      },
    },
  });

  if (!tokenRecord) {
    return { valid: false, reason: 'invalid' };
  }

  if (tokenRecord.usedAt !== null) {
    return { valid: false, reason: 'used' };
  }

  if (tokenRecord.expiresAt <= new Date()) {
    return { valid: false, reason: 'expired' };
  }

  if (tokenRecord.student.status !== 'ACTIVE') {
    return { valid: false, reason: 'inactive_student' };
  }

  return {
    valid: true,
    tokenRecord,
    student: tokenRecord.student,
  };
}
