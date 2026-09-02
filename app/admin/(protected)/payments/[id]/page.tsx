import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusPill } from '@/components/admin/StatusPill';
import { db } from '@/lib/db';
import { formatMoney } from '@/lib/payments/rules';

type AdminPaymentDetailPageProps = { params: Promise<{ id: string }> };

export default async function AdminPaymentDetailPage({ params }: AdminPaymentDetailPageProps) {
  const { id } = await params;
  const payment = await db.payment.findUnique({
    where: { id },
    include: { order: { include: { student: true, course: true } } },
  });
  if (!payment) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/payments" className="text-sm font-black text-primary">Back to Payments</Link>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">{payment.providerReference}</h1>
            <p className="mt-2 text-slate-600">{payment.provider} · {payment.order.orderNumber}</p>
          </div>
          <StatusPill status={payment.status} />
        </div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
          <div><dt className="font-black text-slate-500">Amount</dt><dd>{formatMoney(payment.amountMinor, payment.currency)}</dd></div>
          <div><dt className="font-black text-slate-500">Student</dt><dd>{payment.order.student.firstName} {payment.order.student.lastName}</dd></div>
          <div><dt className="font-black text-slate-500">Course</dt><dd>{payment.order.course.title}</dd></div>
          <div><dt className="font-black text-slate-500">Paid</dt><dd>{payment.paidAt?.toLocaleDateString() ?? 'Not paid'}</dd></div>
          <div><dt className="font-black text-slate-500">Failure</dt><dd>{payment.failureReason ?? 'None'}</dd></div>
        </dl>
      </section>
    </div>
  );
}
