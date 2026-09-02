import Link from 'next/link';
import { StatusPill } from '@/components/admin/StatusPill';
import { requireStudent } from '@/lib/auth/student-authorization';
import { getStudentOrders } from '@/lib/orders/queries';
import { formatMoney } from '@/lib/payments/rules';

export default async function StudentOrdersPage() {
  const student = await requireStudent();
  const orders = await getStudentOrders(student.id);

  return (
    <section className="space-y-5">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Billing</p>
        <h1 className="text-3xl font-black text-slate-950">My Orders</h1>
      </header>
      <div className="grid gap-3">
        {orders.map((order) => (
          <Link key={order.id} href={`/checkout/${order.orderNumber}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-primary">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-slate-950">{order.course.title}</p>
                <p className="text-sm text-slate-500">{order.orderNumber} · {formatMoney(order.amountMinor, order.currency)}</p>
              </div>
              <StatusPill status={order.status} />
            </div>
          </Link>
        ))}
        {!orders.length ? <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center font-semibold text-slate-500">No orders yet.</p> : null}
      </div>
    </section>
  );
}
