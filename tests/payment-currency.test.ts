import assert from 'node:assert/strict';
import test from 'node:test';
import { Currency } from '@prisma/client';
import { getConfiguredPaystackCurrencies, isPaystackCurrencyEnabled, parseMajorAmountToMinor, formatMinorAmount } from '../lib/payments/currency';
import { studentRegisterSchema } from '../lib/validation/student';
import { createCourseSchema } from '../lib/validation/course';

test('major currency amounts convert exactly to minor units and reject precision/overflow errors', () => {
  assert.equal(parseMajorAmountToMinor('125.50', Currency.NGN), 12550);
  assert.equal(parseMajorAmountToMinor('0.01', Currency.USD), 1);
  assert.equal(parseMajorAmountToMinor('1.001', Currency.NGN), null);
  assert.equal(parseMajorAmountToMinor('-1', Currency.NGN), null);
  assert.equal(parseMajorAmountToMinor('21474836.48', Currency.NGN), null);
  assert.equal(formatMinorAmount(12550, Currency.NGN), '₦125.50');
});

test('Paystack currencies fail closed and accept only an explicit supported allowlist', () => {
  const original = process.env.PAYSTACK_SUPPORTED_CURRENCIES;
  try {
    delete process.env.PAYSTACK_SUPPORTED_CURRENCIES;
    assert.deepEqual(getConfiguredPaystackCurrencies(), []);
    assert.equal(isPaystackCurrencyEnabled(Currency.NGN), false);
    process.env.PAYSTACK_SUPPORTED_CURRENCIES = 'ngn,USD,unsupported,NGN';
    assert.deepEqual(getConfiguredPaystackCurrencies(), [Currency.NGN, Currency.USD]);
  } finally {
    if (original === undefined) delete process.env.PAYSTACK_SUPPORTED_CURRENCIES;
    else process.env.PAYSTACK_SUPPORTED_CURRENCIES = original;
  }
});

test('registration normalizes email and does not accept a public role field', () => {
  const parsed = studentRegisterSchema.parse({ firstName: 'A', lastName: 'Student', email: ' USER@EXAMPLE.COM ', password: 'long-password-123', confirmPassword: 'long-password-123', role: 'ADMIN' });
  assert.equal(parsed.email, 'user@example.com');
  assert.equal('role' in parsed, false);
  assert.equal(studentRegisterSchema.safeParse({ ...parsed, password: 'short', confirmPassword: 'short' }).success, false);
});

test('course pricing requires explicit paid price or an explicitly free zero price', () => {
  const base = { title: 'Course', slug: 'course', shortDescription: 'Short', description: 'Long', category: 'Data Analytics', level: 'Beginner', duration: '4 weeks', currency: Currency.NGN, benefits: [], cta: 'Apply', sortOrder: 0 };
  assert.equal(createCourseSchema.safeParse({ ...base, isFree: false, priceMinor: 0 }).success, false);
  assert.equal(createCourseSchema.safeParse({ ...base, isFree: true, priceMinor: 0 }).success, true);
  assert.equal(createCourseSchema.safeParse({ ...base, isFree: true, priceMinor: 100 }).success, false);
});

test('NGN currency formatting supports clean catalogue display without decimals and never appends USD', () => {
  assert.equal(formatMinorAmount(1990000, Currency.NGN, { showDecimals: false }), '₦19,900');
  assert.equal(formatMinorAmount(3990000, Currency.NGN, { showDecimals: false }), '₦39,900');
  assert.equal(formatMinorAmount(12550, Currency.NGN, { showDecimals: false }), '₦125.50');
  assert.equal(formatMinorAmount(1990000, Currency.NGN), '₦19,900.00');

  const formatted = formatMinorAmount(1990000, Currency.NGN, { showDecimals: false });
  assert.ok(formatted.startsWith('₦'));
  assert.equal(formatted.includes('USD'), false);
});
