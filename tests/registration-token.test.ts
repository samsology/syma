import assert from 'node:assert/strict';
import test from 'node:test';
import {
  generateRegistrationToken,
  hashRegistrationToken,
  getContinuationUrl,
  REGISTRATION_TOKEN_EXPIRY_MS,
} from '../lib/auth/registration-token';
import { continueRegistrationSchema } from '../lib/validation/student';

test('generateRegistrationToken produces random 32-byte hex token, hash, and 48h expiration', () => {
  const before = Date.now();
  const tokenData = generateRegistrationToken();
  const after = Date.now();

  assert.equal(typeof tokenData.rawToken, 'string');
  assert.equal(tokenData.rawToken.length, 64); // 32 bytes hex = 64 chars
  assert.equal(typeof tokenData.tokenHash, 'string');
  assert.equal(tokenData.tokenHash.length, 64); // sha256 hex = 64 chars

  // Hash must match SHA-256 of rawToken
  assert.equal(tokenData.tokenHash, hashRegistrationToken(tokenData.rawToken));

  // Expiration timestamp check (~48 hours ahead)
  const expiresMs = tokenData.expiresAt.getTime();
  assert.ok(expiresMs >= before + REGISTRATION_TOKEN_EXPIRY_MS);
  assert.ok(expiresMs <= after + REGISTRATION_TOKEN_EXPIRY_MS);
});

test('generateRegistrationToken produces unique tokens on consecutive calls', () => {
  const token1 = generateRegistrationToken();
  const token2 = generateRegistrationToken();

  assert.notEqual(token1.rawToken, token2.rawToken);
  assert.notEqual(token1.tokenHash, token2.tokenHash);
});

test('hashRegistrationToken is deterministic and handles leading/trailing whitespace', () => {
  const raw = 'abcd1234efgh5678ijkl9012mnop3456';
  const hash1 = hashRegistrationToken(raw);
  const hash2 = hashRegistrationToken(`  ${raw}  `);

  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 64);
});

test('getContinuationUrl builds a clean continuation URL with the token', () => {
  const raw = 'test-token-12345';
  const url = getContinuationUrl(raw);

  assert.ok(url.includes('/continue-registration/test-token-12345'));
  assert.ok(url.startsWith('http://') || url.startsWith('https://'));
});

test('continueRegistrationSchema validates correct student continuation data', () => {
  const parsed = continueRegistrationSchema.safeParse({
    token: 'valid-token-string-123',
    firstName: 'Ada',
    lastName: 'Lovelace',
    phone: '+2348012345678',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    agreeTerms: 'on',
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.firstName, 'Ada');
    assert.equal(parsed.data.lastName, 'Lovelace');
    assert.equal(parsed.data.agreeTerms, true);
  }
});

test('continueRegistrationSchema accepts true boolean for agreeTerms', () => {
  const parsed = continueRegistrationSchema.safeParse({
    token: 'valid-token-string-123',
    firstName: 'Grace',
    lastName: 'Hopper',
    phone: '',
    password: 'Password987!',
    confirmPassword: 'Password987!',
    agreeTerms: true,
  });

  assert.equal(parsed.success, true);
});

test('continueRegistrationSchema rejects passwords shorter than 8 characters', () => {
  const parsed = continueRegistrationSchema.safeParse({
    token: 'valid-token-string-123',
    firstName: 'Alan',
    lastName: 'Turing',
    password: 'short',
    confirmPassword: 'short',
    agreeTerms: 'on',
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    assert.ok(errors.password?.[0]?.includes('8 characters'));
  }
});

test('continueRegistrationSchema rejects mismatched passwords', () => {
  const parsed = continueRegistrationSchema.safeParse({
    token: 'valid-token-string-123',
    firstName: 'Margaret',
    lastName: 'Hamilton',
    password: 'Password123!',
    confirmPassword: 'Password456!',
    agreeTerms: 'on',
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    assert.ok(errors.confirmPassword?.[0]?.includes('do not match'));
  }
});

test('continueRegistrationSchema rejects missing terms agreement', () => {
  const parsed = continueRegistrationSchema.safeParse({
    token: 'valid-token-string-123',
    firstName: 'Katherine',
    lastName: 'Johnson',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    agreeTerms: 'false',
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    assert.ok(errors.agreeTerms?.[0]?.includes('Terms of Service'));
  }
});

test('continueRegistrationSchema rejects empty names and token', () => {
  const parsed = continueRegistrationSchema.safeParse({
    token: '',
    firstName: '   ',
    lastName: '',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    agreeTerms: 'on',
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    assert.ok(errors.token);
    assert.ok(errors.firstName);
    assert.ok(errors.lastName);
  }
});
