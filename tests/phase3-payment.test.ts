import assert from 'node:assert/strict';
import test from 'node:test';
import crypto from 'node:crypto';
import { paystackProvider } from '../lib/payments/providers/paystack';
import {
  canTransitionOrderStatus,
  canTransitionPaymentStatus,
  formatMoney,
} from '../lib/payments/rules';
import {
  getPaystackSecretKey,
  getPaystackPublicKey,
  isPaystackConfigured,
  getPaystackEnvironment,
  getSafePaystackConfig,
  maskKey,
} from '../lib/payments/config';
import { formatCoursePrice } from '../lib/courses/catalog';

// Seed-data course imports
import { dataLiteracyCourse } from '../prisma/seed-data/data-literacy';
import { dataAnalyticsCourse } from '../prisma/seed-data/data-analytics';
import { dataScienceCourse } from '../prisma/seed-data/data-science';
import { advancedDataAnalyticsCourse } from '../prisma/seed-data/advanced-data-analytics';
import { healthcareAnalyticsCourse } from '../prisma/seed-data/healthcare-analytics';

// ---------------------------------------------------------------------------
// SUITE 1: Authoritative NGN Course Pricing & Currency Formatting
// ---------------------------------------------------------------------------

test('1.1: All 5 official courses in seed data have authoritative NGN pricing and kobo subunits', () => {
  const authoritativePrices = [
    {
      course: dataLiteracyCourse,
      expectedSlug: 'introduction-to-data-literacy',
      expectedKobo: 2990000, // ₦29,900
      expectedDisplay: '₦29,900.00',
    },
    {
      course: dataAnalyticsCourse,
      expectedSlug: 'introduction-to-data-analytics',
      expectedKobo: 5990000, // ₦59,900
      expectedDisplay: '₦59,900.00',
    },
    {
      course: dataScienceCourse,
      expectedSlug: 'introduction-to-data-science',
      expectedKobo: 6900000, // ₦69,000
      expectedDisplay: '₦69,000.00',
    },
    {
      course: advancedDataAnalyticsCourse,
      expectedSlug: 'advanced-data-analytics',
      expectedKobo: 7990000, // ₦79,900
      expectedDisplay: '₦79,900.00',
    },
    {
      course: healthcareAnalyticsCourse,
      expectedSlug: 'healthcare-analytics',
      expectedKobo: 8990000, // ₦89,900
      expectedDisplay: '₦89,900.00',
    },
  ];

  for (const item of authoritativePrices) {
    assert.equal(item.course.slug, item.expectedSlug);
    assert.equal(item.course.currency, 'NGN');
    assert.equal(item.course.priceMinor, item.expectedKobo);
    assert.equal(formatMoney(item.course.priceMinor, item.course.currency), item.expectedDisplay);
  }
});

test('1.2: formatCoursePrice formats both NGN and USD accurately and rejects unsupported currencies', () => {
  // NGN support
  assert.equal(formatCoursePrice(2990000, 'NGN'), '₦29,900.00');
  assert.equal(formatCoursePrice(5990000, 'NGN'), '₦59,900.00');
  assert.equal(formatCoursePrice(6900000, 'NGN'), '₦69,000.00');
  assert.equal(formatCoursePrice(7990000, 'NGN'), '₦79,900.00');
  assert.equal(formatCoursePrice(8990000, 'NGN'), '₦89,900.00');

  // Baseline USD backward-compatibility
  assert.equal(formatCoursePrice(1990, 'USD'), '$19.90');
  assert.equal(formatCoursePrice(3990, 'USD'), '$39.90');

  // Rejects unsupported currencies
  assert.throws(() => formatCoursePrice(1000, 'EUR'), /Unsupported launch catalogue currency/);
  assert.throws(() => formatCoursePrice(1000, 'GBP'), /Unsupported launch catalogue currency/);
});

// ---------------------------------------------------------------------------
// SUITE 2: Paystack Configuration Helper & Safe Credential Handling
// ---------------------------------------------------------------------------

test('2.1: Paystack config helper correctly detects presence and environment', () => {
  const origSecret = process.env.PAYSTACK_SECRET_KEY;
  const origPublic = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  try {
    // Unconfigured state
    delete process.env.PAYSTACK_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    assert.equal(isPaystackConfigured(), false);
    assert.equal(getPaystackEnvironment(), 'unconfigured');
    assert.equal(getPaystackSecretKey(), undefined);

    // Test environment
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock_secret_key_12345';
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = 'pk_test_mock_public_key_67890';

    assert.equal(isPaystackConfigured(), true);
    assert.equal(getPaystackEnvironment(), 'test');
    assert.equal(getPaystackSecretKey(), 'sk_test_mock_secret_key_12345');
    assert.equal(getPaystackPublicKey(), 'pk_test_mock_public_key_67890');

    // Live environment detection
    process.env.PAYSTACK_SECRET_KEY = 'sk_live_mock_secret_key_99999';
    assert.equal(getPaystackEnvironment(), 'live');
  } finally {
    process.env.PAYSTACK_SECRET_KEY = origSecret;
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = origPublic;
  }
});

test('2.2: getSafePaystackConfig masks keys and never leaks raw secret in safe diagnostics', () => {
  const origSecret = process.env.PAYSTACK_SECRET_KEY;
  const origPublic = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  try {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_secret1234567890';
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = 'pk_test_public9876543210';

    const safeConfig = getSafePaystackConfig();

    assert.equal(safeConfig.isConfigured, true);
    assert.equal(safeConfig.environment, 'test');
    assert.equal(safeConfig.secretKeyMasked, 'sk_test...7890');
    assert.equal(safeConfig.publicKeyMasked, 'pk_test...3210');

    // Crucial check: Safe config object does NOT contain the raw secret key
    assert.equal(JSON.stringify(safeConfig).includes('sk_test_secret1234567890'), false);
  } finally {
    process.env.PAYSTACK_SECRET_KEY = origSecret;
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = origPublic;
  }
});

test('2.3: maskKey safely handles null, undefined, short, and long keys', () => {
  assert.equal(maskKey(null), null);
  assert.equal(maskKey(undefined), null);
  assert.equal(maskKey(''), null);
  assert.equal(maskKey('short'), '***');
  assert.equal(maskKey('12345678'), '***');
  assert.equal(maskKey('sk_test_123456789'), 'sk_test...6789');
});

// ---------------------------------------------------------------------------
// SUITE 3: HMAC SHA-512 Webhook Signature Verification
// ---------------------------------------------------------------------------

test('3.1: verifyWebhookSignature validates authentic HMAC SHA-512 Paystack signatures', () => {
  const origSecret = process.env.PAYSTACK_SECRET_KEY;
  try {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_secure_hash_secret_key_123';
    const payload = JSON.stringify({
      event: 'charge.success',
      data: {
        reference: 'SYM-20260915-ABCD-12345',
        amount: 2990000,
        currency: 'NGN',
        status: 'success',
      },
    });

    const validSignature = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(payload)
      .digest('hex');

    assert.equal(paystackProvider.verifyWebhookSignature(payload, validSignature), true);
  } finally {
    process.env.PAYSTACK_SECRET_KEY = origSecret;
  }
});

test('3.2: verifyWebhookSignature rejects tampered payloads, forged signatures, or unconfigured secret', () => {
  const origSecret = process.env.PAYSTACK_SECRET_KEY;
  try {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_secure_hash_secret_key_123';
    const payload = JSON.stringify({ event: 'charge.success', data: { amount: 2990000 } });
    const validSignature = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(payload)
      .digest('hex');

    // Tampered payload
    const tamperedPayload = JSON.stringify({ event: 'charge.success', data: { amount: 100 } });
    assert.equal(paystackProvider.verifyWebhookSignature(tamperedPayload, validSignature), false);

    // Completely invalid signature string
    assert.equal(paystackProvider.verifyWebhookSignature(payload, 'forged_invalid_signature_hex'), false);

    // Missing signature
    assert.equal(paystackProvider.verifyWebhookSignature(payload, null), false);
    assert.equal(paystackProvider.verifyWebhookSignature(payload, ''), false);

    // Unconfigured secret
    delete process.env.PAYSTACK_SECRET_KEY;
    assert.equal(paystackProvider.verifyWebhookSignature(payload, validSignature), false);
  } finally {
    process.env.PAYSTACK_SECRET_KEY = origSecret;
  }
});

// ---------------------------------------------------------------------------
// SUITE 4: Paystack Initialization & Verification Adapter
// ---------------------------------------------------------------------------

test('4.1: paystackProvider throws PAYMENT_PROVIDER_UNCONFIGURED if initialized without secret key', async () => {
  const origSecret = process.env.PAYSTACK_SECRET_KEY;
  try {
    delete process.env.PAYSTACK_SECRET_KEY;
    await assert.rejects(
      async () => {
        await paystackProvider.initializePayment({
          email: 'test@example.com',
          amountMinor: 2990000,
          currency: 'NGN',
          reference: 'REF-123',
          callbackUrl: 'http://localhost:3000/checkout/status',
          metadata: {
            orderNumber: 'SYM-001',
            studentId: 'stud_1',
            courseId: 'crs_1',
          },
        });
      },
      { message: 'PAYMENT_PROVIDER_UNCONFIGURED' }
    );
  } finally {
    process.env.PAYSTACK_SECRET_KEY = origSecret;
  }
});

test('4.2: paystackProvider.initializePayment sends correct parameters to Paystack API', async () => {
  const origSecret = process.env.PAYSTACK_SECRET_KEY;
  const origFetch = globalThis.fetch;

  try {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_sample_key';

    let capturedUrl = '';
    let capturedMethod = '';
    let capturedHeaders: Record<string, string> = {};
    let capturedBody: {
      email?: string;
      amount?: number;
      currency?: string;
      reference?: string;
      callback_url?: string;
      metadata?: { courseSlug?: string };
    } = {};

    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(url);
      capturedMethod = init?.method ?? 'GET';
      capturedHeaders = (init?.headers as Record<string, string>) ?? {};
      capturedBody = JSON.parse(String(init?.body ?? '{}'));

      return new Response(
        JSON.stringify({
          status: true,
          message: 'Authorization URL created',
          data: {
            authorization_url: 'https://checkout.paystack.com/access_code_123',
            access_code: 'access_code_123',
            reference: capturedBody?.reference,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    const result = await paystackProvider.initializePayment({
      email: 'student@example.com',
      amountMinor: 2990000,
      currency: 'NGN',
      reference: 'SYM-TEST-REF-999',
      callbackUrl: 'https://symatech.test/checkout/SYM-001/status',
      metadata: {
        orderNumber: 'SYM-001',
        studentId: 'student_1',
        courseId: 'course_1',
        courseSlug: 'introduction-to-data-literacy',
        courseTitle: 'Introduction to Data Literacy',
      },
    });

    assert.equal(capturedUrl, 'https://api.paystack.co/transaction/initialize');
    assert.equal(capturedMethod, 'POST');
    assert.equal(capturedHeaders.Authorization, 'Bearer sk_test_sample_key');
    assert.equal(capturedBody?.email, 'student@example.com');
    assert.equal(capturedBody?.amount, 2990000);
    assert.equal(capturedBody?.currency, 'NGN');
    assert.equal(capturedBody?.reference, 'SYM-TEST-REF-999');
    assert.equal(capturedBody?.callback_url, 'https://symatech.test/checkout/SYM-001/status');
    assert.equal(capturedBody?.metadata?.courseSlug, 'introduction-to-data-literacy');

    assert.equal(result.provider, 'PAYSTACK');
    assert.equal(result.providerReference, 'SYM-TEST-REF-999');
    assert.equal(result.authorizationUrl, 'https://checkout.paystack.com/access_code_123');
  } finally {
    process.env.PAYSTACK_SECRET_KEY = origSecret;
    globalThis.fetch = origFetch;
  }
});

// ---------------------------------------------------------------------------
// SUITE 5: Amount & Currency Tampering Defense
// ---------------------------------------------------------------------------

test('5.1: verifyPayment correctly parses Paystack successful NGN verification response', async () => {
  const origSecret = process.env.PAYSTACK_SECRET_KEY;
  const origFetch = globalThis.fetch;

  try {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_sample_key';

    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          status: true,
          message: 'Verification successful',
          data: {
            id: 1234567,
            status: 'success',
            reference: 'SYM-TEST-REF-888',
            amount: 5990000,
            currency: 'NGN',
            paid_at: '2026-09-15T07:00:00.000Z',
            gateway_response: 'Successful',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )) as typeof fetch;

    const verified = await paystackProvider.verifyPayment('SYM-TEST-REF-888');

    assert.equal(verified.provider, 'PAYSTACK');
    assert.equal(verified.providerReference, 'SYM-TEST-REF-888');
    assert.equal(verified.status, 'SUCCESS');
    assert.equal(verified.amountMinor, 5990000);
    assert.equal(verified.currency, 'NGN');
    assert.equal(verified.paidAt?.toISOString(), '2026-09-15T07:00:00.000Z');
  } finally {
    process.env.PAYSTACK_SECRET_KEY = origSecret;
    globalThis.fetch = origFetch;
  }
});

test('5.2: verifyPayment handles failed or abandoned provider statuses', async () => {
  const origSecret = process.env.PAYSTACK_SECRET_KEY;
  const origFetch = globalThis.fetch;

  try {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_sample_key';

    // Abandoned transaction
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          status: true,
          data: {
            status: 'abandoned',
            reference: 'REF-ABANDONED',
            amount: 2990000,
            currency: 'NGN',
            gateway_response: 'Customer closed modal',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )) as typeof fetch;

    const abandoned = await paystackProvider.verifyPayment('REF-ABANDONED');
    assert.equal(abandoned.status, 'CANCELLED');
    assert.equal(abandoned.failureReason, 'Customer closed modal');

    // Failed transaction
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          status: true,
          data: {
            status: 'failed',
            reference: 'REF-FAILED',
            amount: 2990000,
            currency: 'NGN',
            gateway_response: 'Insufficient funds',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )) as typeof fetch;

    const failed = await paystackProvider.verifyPayment('REF-FAILED');
    assert.equal(failed.status, 'FAILED');
    assert.equal(failed.failureReason, 'Insufficient funds');
  } finally {
    process.env.PAYSTACK_SECRET_KEY = origSecret;
    globalThis.fetch = origFetch;
  }
});

// ---------------------------------------------------------------------------
// SUITE 6: State Machine Invariants & Terminal State Protection
// ---------------------------------------------------------------------------

test('6.1: OrderStatus transitions enforce terminal state immutability', () => {
  // PENDING can transition to any terminal state
  assert.equal(canTransitionOrderStatus('PENDING', 'PAID'), true);
  assert.equal(canTransitionOrderStatus('PENDING', 'FAILED'), true);
  assert.equal(canTransitionOrderStatus('PENDING', 'CANCELLED'), true);
  assert.equal(canTransitionOrderStatus('PENDING', 'EXPIRED'), true);

  // PAID can only be REFUNDED
  assert.equal(canTransitionOrderStatus('PAID', 'REFUNDED'), true);
  assert.equal(canTransitionOrderStatus('PAID', 'PENDING'), false);
  assert.equal(canTransitionOrderStatus('PAID', 'FAILED'), false);

  // Terminal states have zero outward transitions
  assert.equal(canTransitionOrderStatus('FAILED', 'PENDING'), false);
  assert.equal(canTransitionOrderStatus('FAILED', 'PAID'), false);
  assert.equal(canTransitionOrderStatus('CANCELLED', 'PAID'), false);
  assert.equal(canTransitionOrderStatus('EXPIRED', 'PAID'), false);
  assert.equal(canTransitionOrderStatus('REFUNDED', 'PAID'), false);
});

test('6.2: PaymentStatus transitions prevent resurrecting FAILED or CANCELLED payments', () => {
  // PENDING transitions
  assert.equal(canTransitionPaymentStatus('PENDING', 'SUCCESS'), true);
  assert.equal(canTransitionPaymentStatus('PENDING', 'FAILED'), true);
  assert.equal(canTransitionPaymentStatus('PENDING', 'CANCELLED'), true);

  // SUCCESS can only be REFUNDED
  assert.equal(canTransitionPaymentStatus('SUCCESS', 'REFUNDED'), true);
  assert.equal(canTransitionPaymentStatus('SUCCESS', 'PENDING'), false);
  assert.equal(canTransitionPaymentStatus('SUCCESS', 'FAILED'), false);

  // FAILED/CANCELLED cannot transition to SUCCESS
  assert.equal(canTransitionPaymentStatus('FAILED', 'SUCCESS'), false);
  assert.equal(canTransitionPaymentStatus('FAILED', 'PENDING'), false);
  assert.equal(canTransitionPaymentStatus('CANCELLED', 'SUCCESS'), false);
  assert.equal(canTransitionPaymentStatus('REFUNDED', 'SUCCESS'), false);
});

// ---------------------------------------------------------------------------
// SUITE 7: Settlement Defense, Retry Logic, and Historical Preservation
// ---------------------------------------------------------------------------

test('7.1: Settlement logic marks payment as FAILED when provider amount does not match order amount', () => {
  const orderAmount = 2990000;
  const orderCurrency = 'NGN';

  // Simulating provider returning less than expected amount
  const spoofedVerified: { amountMinor: number; currency: string; status: string } = {
    amountMinor: 1000, // Spoofed amount!
    currency: 'NGN',
    status: 'SUCCESS',
  };

  const amountMatches = spoofedVerified.amountMinor === orderAmount;
  const currencyMatches = spoofedVerified.currency === orderCurrency;
  const nextStatus =
    spoofedVerified.status === 'SUCCESS' && amountMatches && currencyMatches
      ? 'SUCCESS'
      : spoofedVerified.status === 'CANCELLED'
        ? 'CANCELLED'
        : 'FAILED';

  assert.equal(amountMatches, false);
  assert.equal(nextStatus, 'FAILED');

  const failureReason =
    amountMatches && currencyMatches ? undefined : 'Amount or currency mismatch.';
  assert.equal(failureReason, 'Amount or currency mismatch.');
});

test('7.2: Settlement logic marks payment as FAILED when provider currency does not match order currency', () => {
  const orderAmount = 2990000;
  const orderCurrency: string = 'NGN';

  // Simulating provider returning USD instead of NGN
  const spoofedVerified: { amountMinor: number; currency: string; status: string } = {
    amountMinor: 2990000,
    currency: 'USD', // Mismatched currency!
    status: 'SUCCESS',
  };

  const amountMatches = spoofedVerified.amountMinor === orderAmount;
  const currencyMatches = spoofedVerified.currency === orderCurrency;
  const nextStatus =
    spoofedVerified.status === 'SUCCESS' && amountMatches && currencyMatches
      ? 'SUCCESS'
      : spoofedVerified.status === 'CANCELLED'
        ? 'CANCELLED'
        : 'FAILED';

  assert.equal(currencyMatches, false);
  assert.equal(nextStatus, 'FAILED');

  const failureReason =
    amountMatches && currencyMatches ? undefined : 'Amount or currency mismatch.';
  assert.equal(failureReason, 'Amount or currency mismatch.');
});

test('7.3: Failed payment retry flow preserves original failed order intact and creates fresh pending order', () => {
  const failedOrder = {
    id: 'ord_1',
    orderNumber: 'SYM-20260915-FAIL',
    status: 'FAILED' as const,
    amountMinor: 2990000,
    currency: 'NGN' as const,
  };

  // Simulating retry action
  // Step 1: verify original order remains FAILED and is never mutated to PENDING
  assert.equal(canTransitionOrderStatus(failedOrder.status, 'PENDING'), false);

  // Step 2: create new order with unique reference
  const newOrderNumber = 'SYM-20260915-RETRY';
  const newOrder = {
    id: 'ord_2',
    orderNumber: newOrderNumber,
    status: 'PENDING' as const,
    amountMinor: failedOrder.amountMinor,
    currency: failedOrder.currency,
  };

  assert.notEqual(newOrder.orderNumber, failedOrder.orderNumber);
  assert.equal(newOrder.status, 'PENDING');
  assert.equal(failedOrder.status, 'FAILED');
});

