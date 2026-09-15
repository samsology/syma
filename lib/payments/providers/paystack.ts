import crypto from 'node:crypto';
import type { Currency } from '@prisma/client';
import type {
  InitializePaymentInput,
  InitializedPayment,
  PaymentProviderAdapter,
  VerifiedPayment,
} from '../types';

import { getPaystackSecretKey } from '../config';

const baseUrl = 'https://api.paystack.co';

function secretKey() {
  return getPaystackSecretKey();
}

function toCurrency(value: unknown): Currency {
  if (value === 'USD' || value === 'NGN') return value;
  throw new Error('PAYMENT_CURRENCY_UNSUPPORTED');
}

export const paystackProvider: PaymentProviderAdapter = {
  provider: 'PAYSTACK',

  async initializePayment(input: InitializePaymentInput): Promise<InitializedPayment> {
    const key = secretKey();
    if (!key) throw new Error('PAYMENT_PROVIDER_UNCONFIGURED');

    const response = await fetch(`${baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        amount: input.amountMinor,
        currency: input.currency,
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: input.metadata,
      }),
    });
    const json = await response.json();

    if (!response.ok || !json.status || !json.data?.authorization_url || !json.data?.reference) {
      throw new Error('PAYMENT_INITIALIZATION_FAILED');
    }

    return {
      provider: 'PAYSTACK',
      providerReference: json.data.reference,
      authorizationUrl: json.data.authorization_url,
    };
  },

  async verifyPayment(reference: string): Promise<VerifiedPayment> {
    const key = secretKey();
    if (!key) throw new Error('PAYMENT_PROVIDER_UNCONFIGURED');

    const response = await fetch(`${baseUrl}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });
    const json = await response.json();

    if (!response.ok || !json.status || !json.data) {
      return {
        provider: 'PAYSTACK',
        providerReference: reference,
        status: 'FAILED',
        amountMinor: 0,
        currency: 'USD',
        paidAt: null,
        failureReason: 'Provider verification failed.',
      };
    }

    let currency: Currency;
    try {
      currency = toCurrency(json.data.currency);
    } catch {
      return {
        provider: 'PAYSTACK',
        providerReference: json.data.reference ?? reference,
        status: 'FAILED',
        amountMinor: Number(json.data.amount ?? 0),
        currency: 'USD',
        paidAt: null,
        failureReason: 'Unsupported provider currency.',
      };
    }

    return {
      provider: 'PAYSTACK',
      providerReference: json.data.reference ?? reference,
      status:
        json.data.status === 'success'
          ? 'SUCCESS'
          : json.data.status === 'abandoned'
            ? 'CANCELLED'
            : 'FAILED',
      amountMinor: Number(json.data.amount ?? 0),
      currency,
      paidAt: json.data.paid_at ? new Date(json.data.paid_at) : null,
      failureReason: json.data.gateway_response,
    };
  },

  verifyWebhookSignature(payload: string, signature: string | null): boolean {
    const key = secretKey();
    if (!key || !signature || typeof signature !== 'string' || typeof payload !== 'string') {
      return false;
    }
    try {
      const hash = crypto.createHmac('sha512', key).update(payload).digest('hex');
      const hashBuf = Buffer.from(hash);
      const sigBuf = Buffer.from(signature);

      if (hashBuf.length !== sigBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(hashBuf, sigBuf);
    } catch {
      return false;
    }
  },
};
