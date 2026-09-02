import crypto from 'node:crypto';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { getPaymentProvider } from './provider';
import { canTransitionOrderStatus, canTransitionPaymentStatus } from './rules';

const pendingOrderTtlMs = 24 * 60 * 60 * 1000;

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `SYM-${date}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function generatePaymentReference(orderNumber: string) {
  return `${orderNumber}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
}

async function callbackUrl(orderNumber: string) {
  const headerStore = await headers();
  const proto = headerStore.get('x-forwarded-proto') ?? 'http';
  const host = headerStore.get('host') ?? 'localhost:3000';
  return `${proto}://${host}/checkout/${orderNumber}/status`;
}

export async function createOrReuseOrder(studentId: string, courseId: string) {
  const [student, course, enrollment] = await Promise.all([
    db.student.findUnique({ where: { id: studentId }, select: { id: true, email: true, status: true } }),
    db.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true, priceMinor: true, currency: true },
    }),
    db.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
      select: { id: true, status: true },
    }),
  ]);

  if (!student || student.status !== 'ACTIVE') return { error: 'Student account is not eligible.' } as const;
  if (!course || course.status !== 'PUBLISHED') return { error: 'Course is unavailable.' } as const;
  if (enrollment && ['ACTIVE', 'COMPLETED'].includes(enrollment.status)) return { alreadyEnrolled: true } as const;

  if (course.priceMinor <= 0) {
    const order = await db.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          studentId,
          courseId,
          amountMinor: 0,
          currency: course.currency,
          status: 'PAID',
          paidAt: new Date(),
        },
      });
      await tx.enrollment.upsert({
        where: { studentId_courseId: { studentId, courseId } },
        update: { status: 'ACTIVE', source: 'PAYMENT', orderId: createdOrder.id, startedAt: new Date() },
        create: { studentId, courseId, status: 'ACTIVE', source: 'PAYMENT', orderId: createdOrder.id, startedAt: new Date() },
      });
      return createdOrder;
    });
    return { order, freeEnrollment: true } as const;
  }

  const reusableOrder = await db.order.findFirst({
    where: {
      studentId,
      courseId,
      status: 'PENDING',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: 'desc' },
  });

  if (reusableOrder) return { order: reusableOrder } as const;

  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      studentId,
      courseId,
      amountMinor: course.priceMinor,
      currency: course.currency,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + pendingOrderTtlMs),
    },
  });

  return { order } as const;
}

export async function initializeOrderPayment(studentId: string, orderNumber: string) {
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { student: true, course: { select: { id: true, title: true } } },
  });

  if (!order || order.studentId !== studentId) return { error: 'Order not found.' } as const;
  if (order.status !== 'PENDING') return { error: 'This order is not payable.' } as const;
  if (order.amountMinor <= 0) return { redirectUrl: `/student/courses/${order.courseId}` } as const;

  const providerReference = generatePaymentReference(order.orderNumber);
  const payment = await db.payment.create({
    data: {
      orderId: order.id,
      provider: 'PAYSTACK',
      providerReference,
      amountMinor: order.amountMinor,
      currency: order.currency,
      status: 'PENDING',
    },
  });

  try {
    const provider = getPaymentProvider();
    const initialized = await provider.initializePayment({
      email: order.student.email,
      amountMinor: order.amountMinor,
      currency: order.currency,
      reference: providerReference,
      callbackUrl: await callbackUrl(order.orderNumber),
      metadata: {
        orderNumber: order.orderNumber,
        studentId,
        courseId: order.courseId,
      },
    });

    await db.payment.update({
      where: { id: payment.id },
      data: { authorizationUrl: initialized.authorizationUrl },
    });

    return { redirectUrl: initialized.authorizationUrl } as const;
  } catch (error) {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED', failureReason: error instanceof Error ? error.message : 'Payment initialization failed.' },
    });
    return { error: 'Payment provider is unavailable. Please try again later.' } as const;
  }
}

export async function verifyAndSettlePayment(reference: string) {
  const payment = await db.payment.findUnique({
    where: { provider_providerReference: { provider: 'PAYSTACK', providerReference: reference } },
    include: { order: true },
  });

  if (!payment) return { error: 'Payment reference not found.' } as const;
  if (payment.status === 'SUCCESS' && payment.order.status === 'PAID') return { order: payment.order } as const;

  const provider = getPaymentProvider();
  const verified = await provider.verifyPayment(reference);
  const amountMatches = verified.amountMinor === payment.order.amountMinor;
  const currencyMatches = verified.currency === payment.order.currency;
  const nextStatus = verified.status === 'SUCCESS' && amountMatches && currencyMatches ? 'SUCCESS' : verified.status === 'CANCELLED' ? 'CANCELLED' : 'FAILED';

  const order = await db.$transaction(async (tx) => {
    const currentPayment = await tx.payment.findUniqueOrThrow({
      where: { id: payment.id },
      include: { order: true },
    });

    if (!canTransitionPaymentStatus(currentPayment.status, nextStatus)) return currentPayment.order;

    await tx.payment.update({
      where: { id: currentPayment.id },
      data: {
        status: nextStatus,
        paidAt: nextStatus === 'SUCCESS' ? verified.paidAt ?? new Date() : null,
        failureReason: amountMatches && currencyMatches ? verified.failureReason : 'Amount or currency mismatch.',
      },
    });

    if (nextStatus === 'SUCCESS' && canTransitionOrderStatus(currentPayment.order.status, 'PAID')) {
      const paidOrder = await tx.order.update({
        where: { id: currentPayment.orderId },
        data: { status: 'PAID', paidAt: verified.paidAt ?? new Date() },
      });
      await tx.enrollment.upsert({
        where: { studentId_courseId: { studentId: paidOrder.studentId, courseId: paidOrder.courseId } },
        update: { status: 'ACTIVE', source: 'PAYMENT', orderId: paidOrder.id, startedAt: new Date() },
        create: {
          studentId: paidOrder.studentId,
          courseId: paidOrder.courseId,
          status: 'ACTIVE',
          source: 'PAYMENT',
          orderId: paidOrder.id,
          startedAt: new Date(),
        },
      });
      return paidOrder;
    }

    if (nextStatus === 'FAILED' && canTransitionOrderStatus(currentPayment.order.status, 'FAILED')) {
      return tx.order.update({ where: { id: currentPayment.orderId }, data: { status: 'FAILED' } });
    }

    if (nextStatus === 'CANCELLED' && canTransitionOrderStatus(currentPayment.order.status, 'CANCELLED')) {
      return tx.order.update({ where: { id: currentPayment.orderId }, data: { status: 'CANCELLED' } });
    }

    return currentPayment.order;
  });

  return { order } as const;
}
