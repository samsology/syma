import Link from 'next/link';
import { StatusPill } from '@/components/admin/StatusPill';
import { getAdminOrders, type CommerceSort } from '@/lib/orders/queries';
import { formatMoney } from '@/lib/payments/rules';

type AdminOrdersPageProps = {
  searchParams: Promise<{ search?: string; status?: string; sort?: CommerceSort; page?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? '1');
  const { orders, totalCount, totalPages } = await getAdminOrders({ ...params, page });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Commerce</p>
        <h1 className="text-3xl font-black text-slate-950">Orders</h1>
      </header>
      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_180px_auto]">
        <input name="search" defaultValue={params.search ?? ''} placeholder="Search orders..." className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <select name="status" defaultValue={params.status ?? 'ALL'} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {['ALL', 'PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED'].map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select name="sort" defaultValue={params.sort ?? 'newest'} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="amount-high">Amount High</option>
          <option value="amount-low">Amount Low</option>
        </select>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-white">Filter</button>
      </form>
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-bold text-slate-900">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{order.student.firstName} {order.student.lastName}<br /><span className="text-xs">{order.student.email}</span></td>
                  <td className="px-4 py-3 text-slate-600">{order.course.title}</td>
                  <td className="px-4 py-3 text-slate-600">{formatMoney(order.amountMinor, order.currency)}</td>
                  <td className="px-4 py-3"><StatusPill status={order.status} /></td>
                  <td className="px-4 py-3"><Link className="font-black text-primary" href={`/admin/orders/${order.id}`}>View</Link></td>
                </tr>
              ))}
              {!orders.length ? <tr><td colSpan={6} className="px-4 py-10 text-center font-semibold text-slate-500">No orders found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
      <p className="text-sm font-semibold text-slate-500">Showing page {page} of {totalPages} · {totalCount} orders</p>
    </div>
  );
}
