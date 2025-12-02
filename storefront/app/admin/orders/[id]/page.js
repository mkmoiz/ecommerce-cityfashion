import Link from "next/link";
import { cookies } from "next/headers";
import { adminGet, adminPut } from "@/utils/adminApi";

export default async function AdminOrderDetailPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  if (!token) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-700">
        <h1 className="text-2xl font-semibold">Order #{params.id}</h1>
        <p className="mt-2 text-sm">Sign in with admin credentials to view this order.</p>
      </div>
    );
  }

  let order = null;
  let error = "";

  try {
    order = await adminGet(`/admin/orders/${params.id}`, token);
  } catch (err) {
    error = err.message || "Failed to load order";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order #{params.id}</h1>
          <p className="text-sm text-slate-600">Order details and line items.</p>
        </div>
        <Link href="/admin/orders" className="text-sm text-slate-600 hover:text-black">
          ← Back to orders
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {order ? (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--ink)]">Items</h2>
            <div className="divide-y divide-slate-100">
              {order.items?.length ? (
                order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                    <div className="space-y-1">
                      <p className="font-medium text-[var(--ink)]">{item.product?.title || "Product"}</p>
                      <p className="text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-[var(--ink)]">₹{item.price}</p>
                  </div>
                ))
              ) : (
                <p className="py-3 text-sm text-slate-500">No items.</p>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Summary</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Customer</span>
              <span className="font-medium">{order.user?.email || "-"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <StatusForm id={order.id} status={order.status} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Total</span>
              <span className="font-semibold">{order.totalAmount ? `₹${order.totalAmount}` : "-"}</span>
            </div>
            <div className="space-y-1 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Shipping</p>
              <p>{order.addressLine1}</p>
              {order.addressLine2 && <p>{order.addressLine2}</p>}
              <p>{[order.city, order.state, order.postalCode].filter(Boolean).join(", ")}</p>
              <p>{order.country}</p>
              <p>{order.phone}</p>
            </div>
            <PaymentPanel order={order} />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
          Order not found.
        </div>
      )}
    </div>
  );
}

function StatusForm({ id, status }) {
  async function setStatus(formData) {
    "use server";
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value || "";
    const nextStatus = formData.get("status");
    if (!nextStatus) return;
    await adminPut(`/admin/orders/${id}/status`, { status: nextStatus }, token);
  }

  return (
    <form action={setStatus} className="flex items-center gap-2">
      <select
        name="status"
        defaultValue={status}
        className="rounded-full border border-[var(--border)] bg-white px-2 py-1 text-xs shadow-sm"
      >
        <option value="PENDING">Pending</option>
        <option value="PAID">Paid</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <button
        type="submit"
        className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--ink)] hover:border-black"
      >
        Update
      </button>
    </form>
  );
}

function PaymentPanel({ order }) {
  const paymentId = order.paymentId || order.razorpay_payment_id || order.payment_id;
  const razorpayOrderId = order.razorpayOrderId || order.razorpay_order_id;
  const signature = order.razorpaySignature || order.razorpay_signature;

  if (!paymentId && !razorpayOrderId && !signature) return null;

  return (
    <div className="mt-4 space-y-2 rounded-xl border border-[var(--border)] bg-slate-50 p-3 text-sm text-slate-700">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Payment</p>
      {paymentId && (
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Payment ID</span>
          <span className="font-semibold text-[var(--ink)]">{paymentId}</span>
        </div>
      )}
      {razorpayOrderId && (
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Razorpay Order</span>
          <span className="font-semibold text-[var(--ink)]">{razorpayOrderId}</span>
        </div>
      )}
      {signature && (
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Signature</span>
          <span className="font-semibold text-[var(--ink)]">{signature}</span>
        </div>
      )}
    </div>
  );
}
