import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { getPaymentProvider } from './provider';
import { canTransitionPaymentStatus } from './rules';
import { isPaystackCurrencyEnabled } from './currency';

const pendingOrderTtlMs = 24 * 60 * 60 * 1000;
const staleInitializationMs = 2 * 60 * 1000;

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `SYM-${date}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function generatePaymentReference(orderNumber: string) {
  return `${orderNumber}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
}

export function getCanonicalAppUrl(): URL {
  const configuredUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;
  if (!configuredUrl) throw new Error('PAYMENT_APP_URL_UNCONFIGURED');

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error('PAYMENT_APP_URL_INVALID');
  }

  const isLocalHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.username || url.password || (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && isLocalHost && url.protocol === 'http:'))) {
    throw new Error('PAYMENT_APP_URL_INVALID');
  }

  return url;
}

function getCallbackUrl(orderNumber: string) {
  const url = getCanonicalAppUrl();
  url.pathname = `/checkout/${encodeURIComponent(orderNumber)}/status`;
  url.search = '';
  url.hash = '';
  return url.toString();
}

export async function createOrReuseOrder(studentId: string, courseId: string) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`course-order:${studentId}:${courseId}`}))`;

    const [student, course, enrollment] = await Promise.all([
      tx.student.findUnique({ where: { id: studentId }, select: { id: true, status: true } }),
      tx.course.findUnique({
        where: { id: courseId },
        select: { id: true, status: true, priceMinor: true, currency: true, isFree: true },
      }),
      tx.enrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId } },
        select: { id: true, status: true },
      }),
    ]);

    if (!student || student.status !== 'ACTIVE') return { error: 'Student account is not eligible.' } as const;
    if (!course || course.status !== 'PUBLISHED') return { error: 'Course is unavailable.' } as const;
    if (enrollment && ['ACTIVE', 'COMPLETED'].includes(enrollment.status)) return { alreadyEnrolled: true } as const;
    if (enrollment?.status === 'SUSPENDED') return { error: 'Enrollment requires administrator review.' } as const;

    if (course.isFree) {
      if (course.priceMinor !== 0) return { error: 'Free course pricing is invalid.' } as const;
      if (enrollment?.status === 'PENDING' || enrollment?.status === 'CANCELLED') {
        await tx.enrollment.update({ where: { id: enrollment.id }, data: { status: 'ACTIVE', source: 'FREE', orderId: null, startedAt: new Date() } });
      } else if (!enrollment) {
        await tx.enrollment.create({ data: { studentId, courseId, status: 'ACTIVE', source: 'FREE', startedAt: new Date() } });
      }
      return { freeEnrollment: true } as const;
    }

    if (!Number.isSafeInteger(course.priceMinor) || course.priceMinor <= 0) {
      return { error: 'Course pricing is not configured.' } as const;
    }
    if (!isPaystackCurrencyEnabled(course.currency)) {
      return { error: 'This course currency is not enabled for the Paystack account.' } as const;
    }

    const reusableOrder = await tx.order.findFirst({
      where: { studentId, courseId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { payments: { where: { status: 'PENDING' }, select: { id: true }, take: 1 } },
    });

    if (reusableOrder && (reusableOrder.expiresAt === null || reusableOrder.expiresAt > new Date() || reusableOrder.payments.length > 0)) {
      return { order: reusableOrder } as const;
    }

    if (reusableOrder) {
      await tx.order.update({ where: { id: reusableOrder.id }, data: { status: 'EXPIRED' } });
    }

    const order = await tx.order.create({
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
  });
}

type InitializationResult =
  | { kind: 'redirect'; redirectUrl: string }
  | { kind: 'wait' }
  | { kind: 'initialize'; paymentId: string; reference: string };

export async function initializeOrderPayment(studentId: string, orderNumber: string) {
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: {
      student: { select: { id: true, email: true, status: true } },
      course: { select: { id: true, title: true, slug: true, status: true, isFree: true, priceMinor: true, currency: true } },
      payments: { where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!order || order.studentId !== studentId) return { error: 'ORDER_NOT_FOUND' } as const;
  if (order.student.status !== 'ACTIVE' || order.course.status !== 'PUBLISHED') return { error: 'ORDER_UNAVAILABLE' } as const;
  if (order.status !== 'PENDING') return { error: 'ORDER_NOT_PAYABLE' } as const;
  if (order.course.isFree || order.amountMinor <= 0) return { error: 'FREE_OR_INVALID_PRICE' } as const;
  if (!isPaystackCurrencyEnabled(order.currency)) return { error: 'UNSUPPORTED_CURRENCY' } as const;

  const existingEnrollment = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId: order.courseId } },
    select: { status: true },
  });
  if (existingEnrollment && ['ACTIVE', 'COMPLETED'].includes(existingEnrollment.status)) {
    return { alreadyEnrolled: true, courseId: order.courseId } as const;
  }

  if (order.expiresAt && order.expiresAt <= new Date() && order.payments.length === 0) {
    await db.order.updateMany({ where: { id: order.id, status: 'PENDING' }, data: { status: 'EXPIRED' } });
    return { error: 'ORDER_EXPIRED' } as const;
  }

  let callbackUrl: string;
  try {
    callbackUrl = getCallbackUrl(order.orderNumber);
  } catch {
    return { error: 'APP_URL_UNCONFIGURED' } as const;
  }

  const initialization = await db.$transaction<InitializationResult>(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`payment-init:${order.id}`}))`;

    const latestPending = await tx.payment.findFirst({
      where: { orderId: order.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    if (latestPending?.authorizationUrl) {
      return { kind: 'redirect', redirectUrl: latestPending.authorizationUrl };
    }
    if (latestPending && Date.now() - latestPending.createdAt.getTime() < staleInitializationMs) {
      return { kind: 'wait' };
    }
    if (latestPending) {
      await tx.payment.update({
        where: { id: latestPending.id },
        data: { status: 'FAILED', failureReason: 'Initialization did not complete; a retry was started.' },
      });
    }

    const reference = generatePaymentReference(order.orderNumber);
    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        provider: 'PAYSTACK',
        providerReference: reference,
        amountMinor: order.amountMinor,
        currency: order.currency,
        status: 'PENDING',
      },
    });
    return { kind: 'initialize', paymentId: payment.id, reference };
  });

  if (initialization.kind === 'redirect') return { redirectUrl: initialization.redirectUrl } as const;
  if (initialization.kind === 'wait') return { error: 'PAYMENT_INITIALIZATION_PENDING' } as const;

  try {
    const initialized = await getPaymentProvider().initializePayment({
      email: order.student.email,
      amountMinor: order.amountMinor,
      currency: order.currency,
      reference: initialization.reference,
      callbackUrl,
      metadata: {
        orderNumber: order.orderNumber,
        studentId,
        courseId: order.courseId,
        courseSlug: order.course.slug,
        courseTitle: order.course.title,
      },
    });

    await db.payment.updateMany({
      where: { id: initialization.paymentId, status: 'PENDING' },
      data: { authorizationUrl: initialized.authorizationUrl },
    });
    return { redirectUrl: initialized.authorizationUrl } as const;
  } catch (error) {
    const code = error instanceof Error ? error.message : 'PAYMENT_PROVIDER_UNAVAILABLE';
    const definitiveFailure = code === 'PAYMENT_INITIALIZATION_FAILED' || code === 'PAYMENT_REFERENCE_MISMATCH';
    await db.payment.updateMany({
      where: { id: initialization.paymentId, status: 'PENDING' },
      data: {
        ...(definitiveFailure ? { status: 'FAILED' as const } : {}),
        failureReason: definitiveFailure ? 'Paystack could not initialize the transaction.' : 'Provider response was unavailable; retry verification before a new attempt.',
      },
    });
    return { error: definitiveFailure ? 'PAYMENT_INITIALIZATION_FAILED' : 'PAYMENT_PROVIDER_UNAVAILABLE' } as const;
  }
}

type VerificationAccess = { studentId?: string; orderNumber?: string };

function metadataMatches(metadata: unknown, expected: { orderNumber: string; studentId: string; courseId: string }) {
  if (metadata === undefined || metadata === null || metadata === '') return true;
  let value: unknown = metadata;
  if (typeof metadata === 'string') {
    try {
      value = JSON.parse(metadata) as unknown;
    } catch {
      return false;
    }
  }
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return ['orderNumber', 'studentId', 'courseId'].every((key) =>
    record[key] === undefined || record[key] === expected[key as keyof typeof expected]
  );
}

function statusResult(order: { orderNumber: string }, paymentStatus: string) {
  if (paymentStatus === 'PENDING') return { pending: true as const, order };
  return { order } as const;
}

export async function verifyAndSettlePayment(reference: string, access: VerificationAccess = {}) {
  if (!/^[A-Za-z0-9.=\-]{1,100}$/.test(reference)) return { error: 'INVALID_REFERENCE' } as const;

  const payment = await db.payment.findUnique({
    where: { provider_providerReference: { provider: 'PAYSTACK', providerReference: reference } },
    include: { order: { include: { student: { select: { id: true, status: true } }, course: { select: { id: true } } } } },
  });

  if (!payment) return { error: 'PAYMENT_NOT_FOUND' } as const;
  if (access.studentId && payment.order.studentId !== access.studentId) return { error: 'PAYMENT_NOT_FOUND' } as const;
  if (access.orderNumber && payment.order.orderNumber !== access.orderNumber) return { error: 'PAYMENT_NOT_FOUND' } as const;
  if (payment.status === 'SUCCESS' && payment.order.status === 'PAID') return { order: payment.order } as const;
  if (payment.status !== 'PENDING') return statusResult(payment.order, payment.status);

  let verified;
  try {
    verified = await getPaymentProvider().verifyPayment(reference);
  } catch {
    return { error: 'PAYMENT_PROVIDER_UNAVAILABLE' } as const;
  }
  const amountMatches = verified.amountMinor !== null && verified.amountMinor === payment.amountMinor && verified.amountMinor === payment.order.amountMinor;
  const currencyMatches = verified.currency !== null && verified.currency === payment.currency && verified.currency === payment.order.currency;
  const referenceMatches = verified.providerReference === payment.providerReference;
  const metadataIsValid = metadataMatches(verified.metadata, {
    orderNumber: payment.order.orderNumber,
    studentId: payment.order.studentId,
    courseId: payment.order.courseId,
  });

  if (verified.status === 'PENDING') return { pending: true, order: payment.order } as const;

  const verifiedSuccess = verified.status === 'SUCCESS' && amountMatches && currencyMatches && referenceMatches && metadataIsValid;
  const mismatch = verified.status === 'SUCCESS' && !verifiedSuccess;
  const nextStatus = mismatch ? 'FAILED' : verified.status;

  const order = await db.$transaction(async (tx) => {
    const currentPayment = await tx.payment.findUniqueOrThrow({
      where: { id: payment.id },
      include: { order: true },
    });

    if (currentPayment.status !== 'PENDING') return currentPayment.order;
    if (!canTransitionPaymentStatus(currentPayment.status, nextStatus)) return currentPayment.order;

    const updated = await tx.payment.updateMany({
      where: { id: currentPayment.id, status: 'PENDING' },
      data: {
        status: nextStatus,
        paidAt: nextStatus === 'SUCCESS' ? verified.paidAt ?? new Date() : null,
        verifiedAt: new Date(),
        providerTransactionId: verified.providerTransactionId,
        failureReason: mismatch
          ? 'Provider verification did not match the stored reference, amount, currency, or purchase metadata.'
          : verified.failureReason ?? null,
      },
    });
    if (updated.count !== 1) {
      const latest = await tx.payment.findUniqueOrThrow({ where: { id: currentPayment.id }, include: { order: true } });
      return latest.order;
    }

    if (nextStatus === 'SUCCESS' && currentPayment.order.status !== 'PAID' && currentPayment.order.status !== 'REFUNDED') {
      const paidAt = verified.paidAt ?? new Date();
      const paidOrder = await tx.order.update({
        where: { id: currentPayment.orderId },
        data: { status: 'PAID', paidAt },
      });

      const enrollment = await tx.enrollment.findUnique({
        where: { studentId_courseId: { studentId: paidOrder.studentId, courseId: paidOrder.courseId } },
      });
      if (!enrollment) {
        await tx.enrollment.create({
          data: {
            studentId: paidOrder.studentId,
            courseId: paidOrder.courseId,
            status: 'ACTIVE',
            source: 'PAYMENT',
            orderId: paidOrder.id,
            startedAt: paidAt,
          },
        });
      } else if (enrollment.status === 'PENDING' || enrollment.status === 'CANCELLED') {
        await tx.enrollment.update({
          where: { id: enrollment.id },
          data: { status: 'ACTIVE', source: 'PAYMENT', orderId: paidOrder.id, startedAt: enrollment.startedAt ?? paidAt },
        });
      }
      return paidOrder;
    }

    if (nextStatus === 'FAILED' && currentPayment.order.status === 'PENDING') {
      return tx.order.update({ where: { id: currentPayment.orderId }, data: { status: 'FAILED' } });
    }
    if (nextStatus === 'CANCELLED' && currentPayment.order.status === 'PENDING') {
      return tx.order.update({ where: { id: currentPayment.orderId }, data: { status: 'CANCELLED' } });
    }
    if (nextStatus === 'REFUNDED' && currentPayment.order.status === 'PAID') {
      await tx.enrollment.updateMany({
        where: { studentId: currentPayment.order.studentId, courseId: currentPayment.order.courseId, source: 'PAYMENT' },
        data: { status: 'SUSPENDED' },
      });
      return tx.order.update({ where: { id: currentPayment.orderId }, data: { status: 'REFUNDED' } });
    }

    return currentPayment.order;
  });

  return statusResult(order, nextStatus);
}
