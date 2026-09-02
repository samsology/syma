import type { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { db } from '@/lib/db';

export const ordersPerPage = 20;
export const paymentsPerPage = 20;

export type CommerceSort = 'newest' | 'oldest' | 'amount-high' | 'amount-low';

function orderBy(sort?: CommerceSort): Prisma.OrderOrderByWithRelationInput[] {
  if (sort === 'oldest') return [{ createdAt: 'asc' }];
  if (sort === 'amount-high') return [{ amountMinor: 'desc' }];
  if (sort === 'amount-low') return [{ amountMinor: 'asc' }];
  return [{ createdAt: 'desc' }];
}

function paymentOrderBy(sort?: CommerceSort): Prisma.PaymentOrderByWithRelationInput[] {
  if (sort === 'oldest') return [{ createdAt: 'asc' }];
  if (sort === 'amount-high') return [{ amountMinor: 'desc' }];
  if (sort === 'amount-low') return [{ amountMinor: 'asc' }];
  return [{ createdAt: 'desc' }];
}

export async function getAdminOrders(params: { search?: string; status?: string; sort?: CommerceSort; page?: number }) {
  const page = Math.max(params.page ?? 1, 1);
  const where: Prisma.OrderWhereInput = {};
  if (params.status && params.status !== 'ALL') where.status = params.status as OrderStatus;
  if (params.search?.trim()) {
    const query = params.search.trim();
    where.OR = [
      { orderNumber: { contains: query, mode: 'insensitive' } },
      { student: { firstName: { contains: query, mode: 'insensitive' } } },
      { student: { lastName: { contains: query, mode: 'insensitive' } } },
      { student: { email: { contains: query, mode: 'insensitive' } } },
      { course: { title: { contains: query, mode: 'insensitive' } } },
      { payments: { some: { providerReference: { contains: query, mode: 'insensitive' } } } },
    ];
  }

  const [orders, totalCount] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: orderBy(params.sort),
      skip: (page - 1) * ordersPerPage,
      take: ordersPerPage,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
        course: { select: { id: true, title: true } },
        _count: { select: { payments: true } },
      },
    }),
    db.order.count({ where }),
  ]);

  return { orders, totalCount, totalPages: Math.max(Math.ceil(totalCount / ordersPerPage), 1), page };
}

export async function getAdminPayments(params: { search?: string; status?: string; sort?: CommerceSort; page?: number }) {
  const page = Math.max(params.page ?? 1, 1);
  const where: Prisma.PaymentWhereInput = {};
  if (params.status && params.status !== 'ALL') where.status = params.status as PaymentStatus;
  if (params.search?.trim()) {
    const query = params.search.trim();
    where.OR = [
      { providerReference: { contains: query, mode: 'insensitive' } },
      { order: { orderNumber: { contains: query, mode: 'insensitive' } } },
      { order: { student: { email: { contains: query, mode: 'insensitive' } } } },
      { order: { course: { title: { contains: query, mode: 'insensitive' } } } },
    ];
  }

  const [payments, totalCount] = await Promise.all([
    db.payment.findMany({
      where,
      orderBy: paymentOrderBy(params.sort),
      skip: (page - 1) * paymentsPerPage,
      take: paymentsPerPage,
      include: {
        order: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, email: true } },
            course: { select: { id: true, title: true } },
          },
        },
      },
    }),
    db.payment.count({ where }),
  ]);

  return { payments, totalCount, totalPages: Math.max(Math.ceil(totalCount / paymentsPerPage), 1), page };
}

export async function getStudentOrders(studentId: string) {
  return db.order.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    include: {
      course: { select: { id: true, title: true, shortDescription: true } },
      payments: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
}
