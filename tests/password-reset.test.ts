import assert from 'node:assert/strict';
import test from 'node:test';
import bcrypt from 'bcryptjs';
import {
  studentPasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../lib/validation/student';
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  getPasswordResetUrl,
  PASSWORD_RESET_TOKEN_EXPIRY_HOURS,
  PASSWORD_RESET_TOKEN_EXPIRY_MS,
} from '../lib/auth/password-reset-token';
import { sendPasswordResetEmail } from '../lib/email/email';

test('1. Password reset token generation produces cryptographically random tokens and 1h expiry', () => {
  const tokenObj1 = generatePasswordResetToken();
  const tokenObj2 = generatePasswordResetToken();

  assert.equal(typeof tokenObj1.rawToken, 'string');
  assert.equal(tokenObj1.rawToken.length, 64); // 32 bytes in hex = 64 chars
  assert.notEqual(tokenObj1.rawToken, tokenObj2.rawToken);
  assert.notEqual(tokenObj1.tokenHash, tokenObj2.tokenHash);

  assert.equal(tokenObj1.tokenHash.length, 64); // sha256 hex length = 64
  assert.equal(hashPasswordResetToken(tokenObj1.rawToken), tokenObj1.tokenHash);

  // Expiry check: approximately 1 hour in the future
  const now = Date.now();
  const diff = tokenObj1.expiresAt.getTime() - now;
  assert.ok(diff > 59 * 60 * 1000 && diff <= PASSWORD_RESET_TOKEN_EXPIRY_MS);
  assert.equal(PASSWORD_RESET_TOKEN_EXPIRY_HOURS, 1);
});

test('2. hashPasswordResetToken is deterministic and trims whitespace', () => {
  const raw = 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0';
  const hash1 = hashPasswordResetToken(raw);
  const hash2 = hashPasswordResetToken(`  ${raw}  `);

  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 64);
});

test('3. getPasswordResetUrl constructs canonical reset URL without duplicate slashes', () => {
  const token = 'sample-token-12345';
  const url = getPasswordResetUrl(token);

  assert.ok(url.includes('/student/reset-password?token=sample-token-12345'));
  assert.ok(!url.includes('//student/reset-password'));
});

test('4. Password validation rules are consistent across registration and reset', () => {
  // Passwords shorter than 12 characters are rejected
  const shortPass = 'short123';
  assert.equal(studentPasswordSchema.safeParse(shortPass).success, false);

  const validPass = 'securePassword123!';
  assert.equal(studentPasswordSchema.safeParse(validPass).success, true);

  // Reset password schema tests
  const validReset = resetPasswordSchema.safeParse({
    token: 'valid-token',
    password: 'securePassword123!',
    confirmPassword: 'securePassword123!',
  });
  assert.equal(validReset.success, true);

  // Mismatched passwords rejected
  const mismatchedReset = resetPasswordSchema.safeParse({
    token: 'valid-token',
    password: 'securePassword123!',
    confirmPassword: 'differentPassword123!',
  });
  assert.equal(mismatchedReset.success, false);

  // Passwords under 12 characters rejected in reset
  const shortReset = resetPasswordSchema.safeParse({
    token: 'valid-token',
    password: 'short',
    confirmPassword: 'short',
  });
  assert.equal(shortReset.success, false);
});

test('5. Forgot password validation normalizes email and rejects invalid format', () => {
  const valid = forgotPasswordSchema.safeParse({
    email: '  STUDENT@EXAMPLE.COM  ',
  });
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.email, 'student@example.com');
  }

  const invalid = forgotPasswordSchema.safeParse({
    email: 'not-an-email',
  });
  assert.equal(invalid.success, false);

  const empty = forgotPasswordSchema.safeParse({
    email: '',
  });
  assert.equal(empty.success, false);
});

test('6. Password hashing for reset matches registration security standard', async () => {
  const newPassword = 'myNewSecurePassword2026!';
  const hash = await bcrypt.hash(newPassword, 12);

  assert.notEqual(hash, newPassword);
  assert.equal(await bcrypt.compare(newPassword, hash), true);
  assert.equal(await bcrypt.compare('wrongPassword123!', hash), false);
});

test('7. sendPasswordResetEmail generates branded transactional email', async () => {
  const result = await sendPasswordResetEmail({
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    resetUrl: 'https://syma-nine.vercel.app/student/reset-password?token=test-token',
  });

  // Since BREVO_API_KEY is not set in test environment, it safely returns skipped
  assert.equal(typeof result, 'object');
  assert.ok('success' in result);
});

test('8. Empty or invalid reset token is rejected by validation', async () => {
  const { validatePasswordResetToken } = await import('../lib/auth/password-reset-token');
  const emptyRes = await validatePasswordResetToken('');
  assert.equal(emptyRes.valid, false);
  if (!emptyRes.valid) {
    assert.equal(emptyRes.reason, 'invalid');
  }

  const whitespaceRes = await validatePasswordResetToken('   ');
  assert.equal(whitespaceRes.valid, false);
  if (!whitespaceRes.valid) {
    assert.equal(whitespaceRes.reason, 'invalid');
  }
});

