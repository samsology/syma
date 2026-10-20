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
const providerTimeoutMs = 12_000;

type PaystackResponse = {
  status?: boolean;
  data?: {
    authorization_url?: string;
    reference?: string;
    id?: number | string;
    status?: string;
    amount?: number;
    currency?: string;
    paid_at?: string | null;
    gateway_response?: string | null;
    metadata?: unknown;
  };
};

function secretKey() {
  return getPaystackSecretKey();
}

export const paystackProvider: PaymentProviderAdapter = {
  provider: 'PAYSTACK',

  async initializePayment(input: InitializePaymentInput): Promise<InitializedPayment> {
    const key = secretKey();
    if (!key || !key.startsWith('sk_')) throw new Error('PAYMENT_PROVIDER_UNCONFIGURED');

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/transaction/initialize`, {
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
        signal: AbortSignal.timeout(providerTimeoutMs),
      });
    } catch {
      throw new Error('PAYMENT_PROVIDER_UNAVAILABLE');
    }

    let json: PaystackResponse;
    try {
      json = (await response.json()) as PaystackResponse;
    } catch {
      throw new Error('PAYMENT_PROVIDER_INVALID_RESPONSE');
    }

    if (!response.ok || !json.status || !json.data?.authorization_url || !json.data?.reference) {
      throw new Error('PAYMENT_INITIALIZATION_FAILED');
    }

    if (json.data.reference !== input.reference) throw new Error('PAYMENT_REFERENCE_MISMATCH');
    let authorizationUrl: URL;
    try {
      authorizationUrl = new URL(json.data.authorization_url);
    } catch {
      throw new Error('PAYMENT_PROVIDER_INVALID_RESPONSE');
    }
    if (authorizationUrl.protocol !== 'https:' || authorizationUrl.hostname !== 'checkout.paystack.com') {
      throw new Error('PAYMENT_PROVIDER_INVALID_RESPONSE');
    }

    return {
      provider: 'PAYSTACK',
      providerReference: json.data.reference,
      authorizationUrl: authorizationUrl.toString(),
    };
  },

  async verifyPayment(reference: string): Promise<VerifiedPayment> {
    const key = secretKey();
    if (!key) throw new Error('PAYMENT_PROVIDER_UNCONFIGURED');

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(providerTimeoutMs),
      });
    } catch {
      throw new Error('PAYMENT_PROVIDER_UNAVAILABLE');
    }

    let json: PaystackResponse;
    try {
      json = (await response.json()) as PaystackResponse;
    } catch {
      throw new Error('PAYMENT_PROVIDER_INVALID_RESPONSE');
    }

    if (!response.ok || !json.status || !json.data) {
      throw new Error('PAYMENT_PROVIDER_UNAVAILABLE');
    }

    const currency: Currency | null =
      json.data.currency === 'USD' || json.data.currency === 'NGN' ? json.data.currency : null;
    const statusMap = {
      success: 'SUCCESS',
      abandoned: 'CANCELLED',
      failed: 'FAILED',
      pending: 'PENDING',
      ongoing: 'PENDING',
      processing: 'PENDING',
      queued: 'PENDING',
      reversed: 'REFUNDED',
    } as const;
    const status = json.data.status ? statusMap[json.data.status as keyof typeof statusMap] : undefined;
    if (!status) throw new Error('PAYMENT_PROVIDER_INVALID_STATUS');

    return {
      provider: 'PAYSTACK',
      providerReference: json.data.reference ?? reference,
      status,
      providerTransactionId: json.data.id === undefined ? null : String(json.data.id),
      amountMinor: Number.isSafeInteger(json.data.amount) ? json.data.amount! : null,
      currency,
      paidAt: json.data.paid_at ? new Date(json.data.paid_at) : null,
      metadata: json.data.metadata,
      failureReason: status === 'FAILED' ? 'Paystack reported a failed transaction.' : status === 'CANCELLED' ? 'Paystack reported an abandoned transaction.' : undefined,
    };
  },

  verifyWebhookSignature(payload: string, signature: string | null): boolean {
    const key = secretKey();
    if (!key || !signature || typeof signature !== 'string' || typeof payload !== 'string') {
      return false;
    }
    try {
      if (!/^[a-f0-9]{128}$/i.test(signature)) return false;
      const hashBuf = crypto.createHmac('sha512', key).update(payload).digest();
      const sigBuf = Buffer.from(signature, 'hex');

      if (hashBuf.length !== sigBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(hashBuf, sigBuf);
    } catch {
      return false;
    }
  },
};
