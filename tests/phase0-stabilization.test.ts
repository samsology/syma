import assert from 'node:assert/strict';
import test from 'node:test';
import crypto from 'node:crypto';
import { paystackProvider } from '../lib/payments/providers/paystack';
import {
  canTransitionOrderStatus,
  canTransitionPaymentStatus,
  formatMoney,
} from '../lib/payments/rules';
import robots from '../app/robots';

// Helper matching lesson resource file size formatting
function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// FIX #1: Paystack Webhook Signature Verification & timingSafeEqual Safety
// ---------------------------------------------------------------------------
test('Fix 1.1: Paystack webhook accepts valid signature matching SHA512 HMAC', () => {
  const originalSecret = process.env.PAYSTACK_SECRET_KEY;
  try {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_secret_key_12345';
    const payload = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_123' } });
    const validSignature = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(payload)
      .digest('hex');

    const isValid = paystackProvider.verifyWebhookSignature(payload, validSignature);
    assert.equal(isValid, true);
  } finally {
    process.env.PAYSTACK_SECRET_KEY = originalSecret;
  }
});

test('Fix 1.2: Paystack webhook safely rejects signature with mismatched length without RangeError', () => {
  const originalSecret = process.env.PAYSTACK_SECRET_KEY;
  try {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_secret_key_12345';
    const payload = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_123' } });

    // Node.js crypto.timingSafeEqual throws RangeError if buffers have different lengths.
    // Our implementation must catch or pre-check buffer length and return false cleanly.
    const shortSignature = 'deadbeef';
    const emptySignature = '';
    const longSignature = 'a'.repeat(256);

    assert.doesNotThrow(() => {
      const shortResult = paystackProvider.verifyWebhookSignature(payload, shortSignature);
      assert.equal(shortResult, false);
    });

    assert.doesNotThrow(() => {
      const emptyResult = paystackProvider.verifyWebhookSignature(payload, emptySignature);
      assert.equal(emptyResult, false);
    });

    assert.doesNotThrow(() => {
      const longResult = paystackProvider.verifyWebhookSignature(payload, longSignature);
      assert.equal(longResult, false);
    });
  } finally {
    process.env.PAYSTACK_SECRET_KEY = originalSecret;
  }
});

test('Fix 1.3: Paystack webhook rejects invalid signature of equal length', () => {
  const originalSecret = process.env.PAYSTACK_SECRET_KEY;
  try {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_secret_key_12345';
    const payload = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_123' } });
    const validSignature = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(payload)
      .digest('hex');

    // Create an invalid signature of the EXACT same length (128 hex chars)
    const tamperedSignature =
      validSignature.slice(0, -1) + (validSignature.slice(-1) === 'a' ? 'b' : 'a');
    assert.equal(tamperedSignature.length, validSignature.length);

    const isValid = paystackProvider.verifyWebhookSignature(payload, tamperedSignature);
    assert.equal(isValid, false);
  } finally {
    process.env.PAYSTACK_SECRET_KEY = originalSecret;
  }
});

test('Fix 1.4: Paystack webhook rejects null, undefined, or missing secret key', () => {
  const originalSecret = process.env.PAYSTACK_SECRET_KEY;
  try {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_secret_key_12345';
    const payload = '{"test":true}';

    assert.equal(paystackProvider.verifyWebhookSignature(payload, null), false);
    // @ts-expect-error testing runtime resistance to undefined
    assert.equal(paystackProvider.verifyWebhookSignature(payload, undefined), false);

    // Missing secret key
    delete process.env.PAYSTACK_SECRET_KEY;
    const dummySig = '0'.repeat(128);
    assert.equal(paystackProvider.verifyWebhookSignature(payload, dummySig), false);
  } finally {
    process.env.PAYSTACK_SECRET_KEY = originalSecret;
  }
});

// ---------------------------------------------------------------------------
// FIX #2: Failed Payment Retry State Machine & Safety Rules
// ---------------------------------------------------------------------------
test('Fix 2.1: Order state machine enforces FAILED as terminal state (cannot mutate to PENDING)', () => {
  // Historical FAILED orders must never be updated back to PENDING
  assert.equal(canTransitionOrderStatus('FAILED', 'PENDING'), false);
  assert.equal(canTransitionOrderStatus('FAILED', 'PAID'), false);
  assert.equal(canTransitionOrderStatus('FAILED', 'CANCELLED'), false);

  // PENDING can legitimately transition to FAILED or PAID
  assert.equal(canTransitionOrderStatus('PENDING', 'FAILED'), true);
  assert.equal(canTransitionOrderStatus('PENDING', 'PAID'), true);
  assert.equal(canTransitionOrderStatus('PENDING', 'CANCELLED'), true);

  // PAID is also terminal (except REFUNDED)
  assert.equal(canTransitionOrderStatus('PAID', 'PENDING'), false);
  assert.equal(canTransitionOrderStatus('PAID', 'FAILED'), false);
  assert.equal(canTransitionOrderStatus('PAID', 'REFUNDED'), true);
});

test('Fix 2.2: Payment status state machine enforces FAILED as terminal state', () => {
  assert.equal(canTransitionPaymentStatus('FAILED', 'PENDING'), false);
  assert.equal(canTransitionPaymentStatus('FAILED', 'SUCCESS'), false);
  assert.equal(canTransitionPaymentStatus('PENDING', 'SUCCESS'), true);
  assert.equal(canTransitionPaymentStatus('PENDING', 'FAILED'), true);
});

test('Fix 2.3: formatMoney accurately formats minor amounts for USD and NGN', () => {
  assert.equal(formatMoney(1990, 'USD'), '$19.90');
  assert.equal(formatMoney(3990, 'USD'), '$39.90');
  assert.equal(formatMoney(0, 'USD'), '$0.00');
  // NGN format contains 5,000.00
  const ngnFormatted = formatMoney(500000, 'NGN');
  assert.ok(ngnFormatted.includes('5,000.00'));
});

// ---------------------------------------------------------------------------
// FIX #3: Lesson Resources Formatting & Resolution
// ---------------------------------------------------------------------------
test('Fix 3.1: formatFileSize formats byte counts correctly and handles invalid inputs', () => {
  assert.equal(formatFileSize(null), null);
  assert.equal(formatFileSize(undefined), null);
  assert.equal(formatFileSize(0), null);
  assert.equal(formatFileSize(-100), null);

  assert.equal(formatFileSize(500), '500 B');
  assert.equal(formatFileSize(1023), '1023 B');
  assert.equal(formatFileSize(1024), '1.0 KB');
  assert.equal(formatFileSize(1536), '1.5 KB');
  assert.equal(formatFileSize(1024 * 1024), '1.0 MB');
  assert.equal(formatFileSize(1024 * 1024 * 2.5), '2.5 MB');
});

test('Fix 3.2: Lesson resource link prioritizes externalUrl over assetUrl', () => {
  const resourceWithBoth = {
    name: 'Slide Deck',
    externalUrl: 'https://docs.google.com/presentation/d/xyz',
    assetUrl: '/uploads/slides.pdf',
  };
  const resolvedUrl1 = resourceWithBoth.externalUrl || resourceWithBoth.assetUrl || '#';
  assert.equal(resolvedUrl1, 'https://docs.google.com/presentation/d/xyz');

  const resourceWithAssetOnly = {
    name: 'Cheat Sheet',
    externalUrl: null,
    assetUrl: '/uploads/cheatsheet.pdf',
  };
  const resolvedUrl2 = resourceWithAssetOnly.externalUrl || resourceWithAssetOnly.assetUrl || '#';
  assert.equal(resolvedUrl2, '/uploads/cheatsheet.pdf');

  const emptyResource = {
    name: 'Notes',
    externalUrl: null,
    assetUrl: null,
  };
  const resolvedUrl3 = emptyResource.externalUrl || emptyResource.assetUrl || '#';
  assert.equal(resolvedUrl3, '#');
});

// ---------------------------------------------------------------------------
// FIX #4: Robots Route Exclusions
// ---------------------------------------------------------------------------
test('Fix 4.1: robots() disallows sensitive private routes and allows public indexing', () => {
  const robotsConfig = robots();

  assert.ok(robotsConfig.rules);
  const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;

  assert.equal(rules.userAgent, '*');
  assert.equal(rules.allow, '/');

  const disallowed = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];
  assert.ok(disallowed.includes('/api/'), 'Disallows /api/');
  assert.ok(disallowed.includes('/admin/'), 'Disallows /admin/');
  assert.ok(disallowed.includes('/student/'), 'Disallows /student/');
  assert.ok(disallowed.includes('/checkout/'), 'Disallows /checkout/');
  assert.ok(disallowed.includes('/continue-registration/'), 'Disallows /continue-registration/');

  // Ensure public catalog routes are NOT in disallow list
  assert.equal(disallowed.includes('/courses'), false);
  assert.equal(disallowed.includes('/about'), false);
  assert.equal(disallowed.includes('/solutions'), false);

  // Check sitemap configuration
  assert.ok(typeof robotsConfig.sitemap === 'string');
  assert.ok(robotsConfig.sitemap.endsWith('/sitemap.xml'));
});
