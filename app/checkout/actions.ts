'use server';

import { redirect } from 'next/navigation';
import { requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { initializePaymentSchema } from '@/lib/validation/payment';
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
  redirect(`/checkout/${orderNumber}?error=provider`);
}

export async function verifyPaymentAction(formData: FormData) {
  const parsed = { reference: String(formData.get('reference') ?? '') };
  if (!parsed.reference) redirect('/student/orders');

  const result = await verifyAndSettlePayment(parsed.reference);
  if (result.order) redirect(`/checkout/${result.order.orderNumber}/status`);
  redirect('/student/orders');
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
