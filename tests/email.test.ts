import assert from 'node:assert/strict';
import test from 'node:test';
import {
  sendTransactionalEmail,
  sendEnrollmentConfirmation,
  sendConsultationConfirmation,
  sendContactConfirmation,
} from '../lib/email/email';

test('1. sendTransactionalEmail returns skipped when BREVO_API_KEY is not configured', async () => {
  const originalKey = process.env.BREVO_API_KEY;
  try {
    delete process.env.BREVO_API_KEY;
    const result = await sendTransactionalEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Test</p>',
      text: 'Test',
    });

    assert.equal(result.success, false);
    assert.equal(result.skipped, true);
    assert.equal(typeof result.error, 'string');
  } finally {
    if (originalKey !== undefined) {
      process.env.BREVO_API_KEY = originalKey;
    }
  }
});

test('2. sendTransactionalEmail validates recipient email before dispatch', async () => {
  const resultMissing = await sendTransactionalEmail({
    to: '',
    subject: 'Test',
    html: '<p>Test</p>',
    text: 'Test',
  });
  assert.equal(resultMissing.success, false);
  assert.equal(resultMissing.error, 'Invalid recipient email address.');

  const resultMalformed = await sendTransactionalEmail({
    to: 'invalid-email-no-at',
    subject: 'Test',
    html: '<p>Test</p>',
    text: 'Test',
  });
  assert.equal(resultMalformed.success, false);
  assert.equal(resultMalformed.error, 'Invalid recipient email address.');
});

test('3. sendTransactionalEmail handles successful Brevo HTTP 201 response', async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.BREVO_API_KEY;

  try {
    process.env.BREVO_API_KEY = 'test-fake-key-12345';
    global.fetch = async (url, init) => {
      assert.equal(url, 'https://api.brevo.com/v3/smtp/email');
      const headers = init?.headers as Record<string, string>;
      assert.equal(headers['api-key'], 'test-fake-key-12345');

      return new Response(
        JSON.stringify({ messageId: '<20260910.123456@smtp-relay.brevo.com>' }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const result = await sendTransactionalEmail({
      to: 'recipient@domain.com',
      subject: 'Hello',
      html: '<p>Hello world</p>',
      text: 'Hello world',
    });

    assert.equal(result.success, true);
    assert.equal(result.messageId, '<20260910.123456@smtp-relay.brevo.com>');
  } finally {
    global.fetch = originalFetch;
    if (originalKey !== undefined) {
      process.env.BREVO_API_KEY = originalKey;
    } else {
      delete process.env.BREVO_API_KEY;
    }
  }
});

test('4. sendTransactionalEmail handles Brevo HTTP 400 error safely without crashing', async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.BREVO_API_KEY;

  try {
    process.env.BREVO_API_KEY = 'test-fake-key-12345';
    global.fetch = async () => {
      return new Response(
        JSON.stringify({
          code: 'invalid_parameter',
          message: 'Sender domain is not authorized or verified on Brevo.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const result = await sendTransactionalEmail({
      to: 'recipient@domain.com',
      subject: 'Hello',
      html: '<p>Hello</p>',
      text: 'Hello',
    });

    assert.equal(result.success, false);
    assert.equal(result.error, 'Sender domain is not authorized or verified on Brevo.');
  } finally {
    global.fetch = originalFetch;
    if (originalKey !== undefined) {
      process.env.BREVO_API_KEY = originalKey;
    } else {
      delete process.env.BREVO_API_KEY;
    }
  }
});

test('5. sendTransactionalEmail handles network failure safely', async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.BREVO_API_KEY;

  try {
    process.env.BREVO_API_KEY = 'test-fake-key-12345';
    global.fetch = async () => {
      throw new Error('fetch failed: connection refused');
    };

    const result = await sendTransactionalEmail({
      to: 'recipient@domain.com',
      subject: 'Hello',
      html: '<p>Hello</p>',
      text: 'Hello',
    });

    assert.equal(result.success, false);
    assert.equal(result.error, 'fetch failed: connection refused');
  } finally {
    global.fetch = originalFetch;
    if (originalKey !== undefined) {
      process.env.BREVO_API_KEY = originalKey;
    } else {
      delete process.env.BREVO_API_KEY;
    }
  }
});

test('6. Confirmation helpers return EmailResult with truthful delivery status', async () => {
  const originalKey = process.env.BREVO_API_KEY;
  try {
    delete process.env.BREVO_API_KEY;

    const enrollRes = await sendEnrollmentConfirmation({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      program: 'Healthcare Analytics',
    });
    assert.equal(enrollRes.success, false);
    assert.equal(enrollRes.skipped, true);

    const consultRes = await sendConsultationConfirmation({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      consultationType: 'healthcare-analytics',
    });
    assert.equal(consultRes.success, false);
    assert.equal(consultRes.skipped, true);

    const contactRes = await sendContactConfirmation({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Inquiry',
    });
    assert.equal(contactRes.success, false);
    assert.equal(contactRes.skipped, true);
  } finally {
    if (originalKey !== undefined) {
      process.env.BREVO_API_KEY = originalKey;
    }
  }
});
