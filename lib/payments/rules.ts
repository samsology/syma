import type { OrderStatus, PaymentStatus } from '@prisma/client';
import { formatMinorAmount } from './currency';

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

export function formatMoney(
  amountMinor: number,
  currency: 'NGN' | 'USD' | string = 'NGN',
  options?: { showDecimals?: boolean }
) {
  if (currency !== 'USD' && currency !== 'NGN') throw new Error('Unsupported payment currency.');
  return formatMinorAmount(amountMinor, currency, options);
}
