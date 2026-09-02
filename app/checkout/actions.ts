'use server';

import { redirect } from 'next/navigation';
import { requireStudent } from '@/lib/auth/student-authorization';
import { initializePaymentSchema } from '@/lib/validation/payment';
import { initializeOrderPayment, verifyAndSettlePayment } from '@/lib/payments/service';

export async function initializePaymentAction(formData: FormData) {
  const student = await requireStudent();
  const parsed = initializePaymentSchema.safeParse({ orderNumber: formData.get('orderNumber') });
  if (!parsed.success) redirect('/student/orders');

  const orderNumber = parsed.data.orderNumber;
  const result = await initializeOrderPayment(student.id, orderNumber);
  if (result.redirectUrl) redirect(result.redirectUrl);
  redirect(`/checkout/${orderNumber}?error=provider`);
}

export async function verifyPaymentAction(formData: FormData) {
  const parsed = { reference: String(formData.get('reference') ?? '') };
  if (!parsed.reference) redirect('/student/orders');

  const result = await verifyAndSettlePayment(parsed.reference);
  if (result.order) redirect(`/checkout/${result.order.orderNumber}/status`);
  redirect('/student/orders');
}
