type PaystackInitializeInput = {
  email: string;
  amountKobo: number;
  currency?: 'NGN';
  callbackUrl: string;
  metadata: Record<string, string>;
};

type PaystackInitializeResponse = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export type PaystackVerification = {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  paidAt?: string | null;
  customerEmail?: string;
  metadata?: Record<string, unknown>;
};

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

function getPaystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured.');
  }

  return key;
}

async function parsePaystackResponse<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok || !payload.status) {
    throw new Error(payload.message || 'Paystack request failed.');
  }

  return payload.data as T;
}

export async function initializePaystackTransaction({
  email,
  amountKobo,
  currency = 'NGN',
  callbackUrl,
  metadata,
}: PaystackInitializeInput): Promise<PaystackInitializeResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amountKobo,
      currency,
      callback_url: callbackUrl,
      metadata,
    }),
  });

  const data = await parsePaystackResponse<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>(response);

  return {
    authorizationUrl: data.authorization_url,
    accessCode: data.access_code,
    reference: data.reference,
  };
}

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerification> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${getPaystackSecretKey()}`,
      },
      cache: 'no-store',
    }
  );

  const data = await parsePaystackResponse<{
    reference: string;
    status: string;
    amount: number;
    currency: string;
    paid_at?: string | null;
    customer?: { email?: string };
    metadata?: Record<string, unknown>;
  }>(response);

  return {
    reference: data.reference,
    status: data.status,
    amount: data.amount,
    currency: data.currency,
    paidAt: data.paid_at,
    customerEmail: data.customer?.email,
    metadata: data.metadata,
  };
}

