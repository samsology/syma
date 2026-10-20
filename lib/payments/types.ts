import type { Currency, PaymentProvider, PaymentStatus } from '@prisma/client';

export type InitializePaymentInput = {
  email: string;
  amountMinor: number;
  currency: Currency;
  reference: string;
  callbackUrl: string;
  metadata: {
    orderNumber: string;
    studentId: string;
    courseId: string;
    courseSlug?: string;
    courseTitle?: string;
  };
};

export type InitializedPayment = {
  provider: PaymentProvider;
  providerReference: string;
  authorizationUrl: string;
  accessCode?: string;
};

export type VerifiedPayment = {
  provider: PaymentProvider;
  providerReference: string;
  status: PaymentStatus;
  providerTransactionId: string | null;
  amountMinor: number | null;
  currency: Currency | null;
  paidAt: Date | null;
  metadata?: unknown;
  failureReason?: string;
};

export type PaymentProviderAdapter = {
  provider: PaymentProvider;
  initializePayment(input: InitializePaymentInput): Promise<InitializedPayment>;
  verifyPayment(reference: string): Promise<VerifiedPayment>;
  verifyWebhookSignature(payload: string, signature: string | null): boolean;
};
