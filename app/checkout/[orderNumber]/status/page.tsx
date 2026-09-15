import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusPill } from '@/components/admin/StatusPill';
import { CheckoutPayButton } from '@/components/checkout/CheckoutPayButton';
import { requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { formatMoney } from '@/lib/payments/rules';
import { verifyAndSettlePayment } from '@/lib/payments/service';
import { retryOrderPaymentAction } from '@/app/checkout/actions';

type CheckoutStatusPageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ reference?: string }>;
};

export default async function CheckoutStatusPage({ params, searchParams }: CheckoutStatusPageProps) {
  const [{ orderNumber }, query, student] = await Promise.all([params, searchParams, requireStudent()]);

  if (query.reference) {
    await verifyAndSettlePayment(query.reference);
  }

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { course: true, payments: { orderBy: { createdAt: 'desc' } } },
  });

  if (!order || order.studentId !== student.id) notFound();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Payment Status</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{order.course.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{order.orderNumber} · {formatMoney(order.amountMinor, order.currency)}</p>
        <div className="mt-5"><StatusPill status={order.status} /></div>
        {query.reference ? <p className="mt-4 text-sm text-slate-600">Provider reference received and verified server-side.</p> : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {order.status === 'PAID' ? <Link href={`/student/courses/${order.courseId}`} className="rounded-lg bg-primary px-5 py-3 text-center text-sm font-black text-white">Continue Learning</Link> : null}
          {order.status === 'PENDING' ? (
            <Link href={`/checkout/${order.orderNumber}`} className="rounded-lg bg-primary px-5 py-3 text-center text-sm font-black text-white hover:bg-primary/90">
              Continue Payment
            </Link>
          ) : null}
          {order.status === 'FAILED' ? (
            <form action={retryOrderPaymentAction}>
              <input type="hidden" name="orderNumber" value={order.orderNumber} />
              <CheckoutPayButton label="Retry Payment" loadingLabel="Preparing Order..." />
            </form>
          ) : null}
          <Link href="/student/orders" className="rounded-lg border border-slate-200 px-5 py-3 text-center text-sm font-black text-slate-700">My Orders</Link>
        </div>
      </section>
    </main>
  );
}
