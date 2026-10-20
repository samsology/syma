'use server';

import { redirect } from 'next/navigation';
import { requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { initializePaymentSchema, verifyPaymentSchema } from '@/lib/validation/payment';
import {
  createOrReuseOrder,
  initializeOrderPayment,
  verifyAndSettlePayment,
} from '@/lib/payments/service';

export async function initializePaymentAction(formData: FormData) {
  const student = await requireStudent();
  const parsed = initializePaymentSchema.safeParse({ orderNumber: formData.get('orderNumber') });
  if (!parsed.success) redirect('/student/orders');

  const orderNumber = parsed.data.orderNumber;
  const result = await initializeOrderPayment(student.id, orderNumber);
  if (result.redirectUrl) redirect(result.redirectUrl);
  if ('alreadyEnrolled' in result) redirect(`/student/courses/${result.courseId}`);
  redirect(`/checkout/${orderNumber}?error=${encodeURIComponent(result.error || 'provider')}`);
}

export async function verifyPaymentAction(formData: FormData) {
  const student = await requireStudent();
  const parsed = verifyPaymentSchema.safeParse({ reference: formData.get('reference') });
  if (!parsed.success) redirect('/student/orders');

  const payment = await db.payment.findUnique({
    where: { provider_providerReference: { provider: 'PAYSTACK', providerReference: parsed.data.reference } },
    select: { order: { select: { studentId: true, orderNumber: true } } },
  });
  if (!payment || payment.order.studentId !== student.id) redirect('/student/orders');

  await verifyAndSettlePayment(parsed.data.reference, {
    studentId: student.id,
    orderNumber: payment.order.orderNumber,
  });
  redirect(`/checkout/${payment.order.orderNumber}/status?reference=${encodeURIComponent(parsed.data.reference)}`);
}

export async function retryOrderPaymentAction(formData: FormData) {
  const student = await requireStudent();
  const orderNumber = String(formData.get('orderNumber') ?? '').trim();
  if (!orderNumber) redirect('/student/orders');

  const failedOrder = await db.order.findUnique({
    where: { orderNumber },
    include: { course: true },
  });

  if (!failedOrder || failedOrder.studentId !== student.id) {
    redirect('/student/orders');
  }

  if (failedOrder.status === 'PAID') {
    redirect(`/student/courses/${failedOrder.courseId}`);
  }

  if (failedOrder.course.status !== 'PUBLISHED') {
    redirect('/student/orders');
  }

  const existingEnrollment = await db.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: failedOrder.courseId,
      },
    },
  });
  if (existingEnrollment && ['ACTIVE', 'COMPLETED'].includes(existingEnrollment.status)) {
    redirect(`/student/courses/${failedOrder.courseId}`);
  }

  const result = await createOrReuseOrder(student.id, failedOrder.courseId);
  if ('alreadyEnrolled' in result || 'freeEnrollment' in result) {
    redirect(`/student/courses/${failedOrder.courseId}`);
  }

  if (result.order) {
    redirect(`/checkout/${result.order.orderNumber}`);
  }

  redirect('/student/orders');
}
