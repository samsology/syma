import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusPill } from '@/components/admin/StatusPill';
import { db } from '@/lib/db';
import { formatMoney } from '@/lib/payments/rules';

type AdminOrderDetailPageProps = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      course: { select: { id: true, title: true } },
      payments: { orderBy: { createdAt: 'desc' } },
      enrollment: true,
    },
  });
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="text-sm font-black text-primary">Back to Orders</Link>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">{order.orderNumber}</h1>
            <p className="mt-2 text-slate-600">{order.student.firstName} {order.student.lastName} · {order.course.title}</p>
          </div>
          <StatusPill status={order.status} />
        </div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
          <div><dt className="font-black text-slate-500">Amount</dt><dd>{formatMoney(order.amountMinor, order.currency)}</dd></div>
          <div><dt className="font-black text-slate-500">Created</dt><dd>{order.createdAt.toLocaleDateString()}</dd></div>
          <div><dt className="font-black text-slate-500">Paid</dt><dd>{order.paidAt?.toLocaleDateString() ?? 'Not paid'}</dd></div>
        </dl>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Payment Attempts</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {order.payments.map((payment) => (
            <Link key={payment.id} href={`/admin/payments/${payment.id}`} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-slate-900">{payment.providerReference}</span>
              <StatusPill status={payment.status} />
            </Link>
          ))}
          {!order.payments.length ? <p className="py-4 text-sm font-semibold text-slate-500">No payment attempts yet.</p> : null}
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Enrollment</h2>
        {order.enrollment ? <StatusPill status={order.enrollment.status} /> : <p className="mt-2 text-sm font-semibold text-slate-500">No enrollment activated from this order.</p>}
      </section>
    </div>
  );
}
