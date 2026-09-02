import { z } from 'zod';

export const currencySchema = z.enum(['USD']);
export const orderStatusSchema = z.enum([
  'PENDING',
  'PAID',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
  'EXPIRED',
]);
export const paymentStatusSchema = z.enum([
  'PENDING',
  'SUCCESS',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
]);

export const createOrderSchema = z.object({
  courseId: z.string().trim().min(1, 'Course is required.'),
});

export const initializePaymentSchema = z.object({
  orderNumber: z.string().trim().min(1, 'Order is required.'),
});

export const verifyPaymentSchema = z.object({
  reference: z.string().trim().min(1, 'Payment reference is required.'),
});
