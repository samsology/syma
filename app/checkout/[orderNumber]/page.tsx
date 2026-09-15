import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { initializePaymentAction, retryOrderPaymentAction } from '@/app/checkout/actions';
import { StatusPill } from '@/components/admin/StatusPill';
import { CheckoutPayButton } from '@/components/checkout/CheckoutPayButton';
import { requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { formatMoney } from '@/lib/payments/rules';

type CheckoutPageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const [{ orderNumber }, query, student] = await Promise.all([params, searchParams, requireStudent()]);
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: {
      course: { select: { title: true, shortDescription: true } },
      student: { select: { firstName: true, lastName: true, email: true } },
      payments: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  });

  if (!order || order.studentId !== student.id) notFound();
  if (order.status === 'PAID') redirect(`/checkout/${order.orderNumber}/status`);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Checkout</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{order.course.title}</h1>
        <p className="mt-2 text-slate-600">{order.course.shortDescription}</p>
        {query.error === 'provider' ? <p className="mt-4 rounded-lg border border-error/30 bg-red-50 px-4 py-3 text-sm font-semibold text-error">Payment provider is unavailable. Check Paystack test credentials and retry.</p> : null}
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="font-black text-slate-500">Order</dt><dd>{order.orderNumber}</dd></div>
          <div><dt className="font-black text-slate-500">Amount</dt><dd>{formatMoney(order.amountMinor, order.currency)}</dd></div>
          <div><dt className="font-black text-slate-500">Student</dt><dd>{order.student.firstName} {order.student.lastName}</dd></div>
          <div><dt className="font-black text-slate-500">Status</dt><dd><StatusPill status={order.status} /></dd></div>
        </dl>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {order.status === 'PENDING' ? (
            <form action={initializePaymentAction}>
              <input type="hidden" name="orderNumber" value={order.orderNumber} />
              <CheckoutPayButton label="Pay Now with Paystack" loadingLabel="Connecting to Paystack..." />
            </form>
          ) : order.status === 'FAILED' ? (
            <form action={retryOrderPaymentAction}>
              <input type="hidden" name="orderNumber" value={order.orderNumber} />
              <CheckoutPayButton label="Retry Payment" loadingLabel="Preparing Order..." />
            </form>
          ) : (
            <button disabled className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white opacity-60">Order {order.status}</button>
          )}
          <Link href="/student/orders" className="rounded-lg border border-slate-200 px-5 py-3 text-center text-sm font-black text-slate-700">My Orders</Link>
        </div>
      </section>
    </main>
  );
}
