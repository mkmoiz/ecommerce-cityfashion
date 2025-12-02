import Link from "next/link";
import { cookies } from "next/headers";
import { adminGet, adminPut } from "@/utils/adminApi";

export default async function AdminOrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  if (!token) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-700">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="mt-2 text-sm">
          Please <Link href="/admin/login" className="underline">sign in</Link> to view orders.
        </p>
      </div>
    );
  }

  let orders = [];
  let error = "";

  try {
    orders = await adminGet("/admin/orders", token);
  } catch (err) {
    error = err.message || "Failed to load orders";
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[var(--ink)]">Orders</h1>
          <p className="text-sm text-slate-600">Track orders, status, and customers.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Order</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Customer</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Total</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-[var(--ink)]">#{order.id}</td>
                  <td className="px-4 py-3 text-slate-700">{order.user?.email || "-"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">{order.totalAmount ? `₹${order.totalAmount}` : "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="rounded-full border border-slate-200 px-3 py-1 text-slate-700 hover:border-black"
                      >
                        View
                      </Link>
                      <InlineStatusForm id={order.id} status={order.status} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    PAID: "bg-emerald-50 text-emerald-800 border-emerald-200",
    SHIPPED: "bg-sky-50 text-sky-800 border-sky-200",
    DELIVERED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    CANCELLED: "bg-rose-50 text-rose-800 border-rose-200"
  };
  const tone = map[status] || "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status || "UNKNOWN"}
    </span>
  );
}

async function updateStatus(formData) {
  "use server";
  const id = formData.get("id");
  const status = formData.get("status");
  if (!id || !status) return;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";
  await adminPut(`/admin/orders/${id}/status`, { status }, token);
}

function InlineStatusForm({ id, status }) {
  return (
    <form action={updateStatus} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs shadow-sm"
      >
        <option value="PENDING">Pending</option>
        <option value="PAID">Paid</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <button
        type="submit"
        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-black"
      >
        Save
      </button>
    </form>
  );
}
