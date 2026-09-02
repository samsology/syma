import type { OrderStatus, PaymentStatus } from '@prisma/client';

const orderTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'FAILED', 'CANCELLED', 'EXPIRED'],
  PAID: ['REFUNDED'],
  FAILED: [],
  CANCELLED: [],
  REFUNDED: [],
  EXPIRED: [],
};

const paymentTransitions: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ['SUCCESS', 'FAILED', 'CANCELLED'],
  SUCCESS: ['REFUNDED'],
  FAILED: [],
  CANCELLED: [],
  REFUNDED: [],
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus) {
  return from === to || orderTransitions[from].includes(to);
}

export function canTransitionPaymentStatus(from: PaymentStatus, to: PaymentStatus) {
  return from === to || paymentTransitions[from].includes(to);
}

export function formatMoney(amountMinor: number, currency = 'USD') {
  const locale = currency === 'USD' ? 'en-US' : 'en-NG';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}
