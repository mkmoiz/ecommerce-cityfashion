"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { API_BASE } from "@/utils/api";

export default function OrderDetailClient({ orderId }) {
  const { data: session, status } = useSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated" || !session?.apiToken || !orderId) return;

    const fetchOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${session.apiToken}` },
          credentials: "include"
        });
        if (!res.ok) throw new Error(await res.text());
        setOrder(await res.json());
      } catch (err) {
        setError(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [status, session?.apiToken, orderId]);

  if (status !== "authenticated") {
    return (
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-display font-semibold">Order #{orderId}</h1>
        <p className="text-slate-600">Sign in to view your orders.</p>
        <button
          onClick={() => signIn("google")}
          className="rounded-full border border-black px-5 py-3 text-sm font-semibold text-black shadow-sm"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold">Order #{orderId}</h1>
          <p className="text-slate-600">Details and items.</p>
        </div>
        <Link href="/orders" className="text-sm text-slate-600 hover:text-black">← Back to orders</Link>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <p className="text-sm text-slate-500">Loading...</p>}

      {order && (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Items</h2>
            <div className="divide-y divide-slate-100">
              {order.items?.length ? (
                order.items.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-900">{item.product?.title || "Product"}</p>
                      <p className="text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-slate-900">₹{Number(item.price || 0).toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <p className="py-3 text-sm text-slate-500">No items.</p>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Summary</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                order.status === "PAID"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-amber-50 text-amber-700 border border-amber-100"
              }`}>
                <span className="h-2 w-2 rounded-full bg-current" />
                {order.status || "Pending"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Total</span>
              <span className="font-semibold">{order.totalAmount ? `₹${order.totalAmount}` : "-"}</span>
            </div>
            <div className="space-y-1 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Shipping</p>
              {order.addressLine1 || order.addressLine2 || order.city ? (
                <>
                  {order.addressLine1 && <p>{order.addressLine1}</p>}
                  {order.addressLine2 && <p>{order.addressLine2}</p>}
                  <p>{[order.city, order.state, order.postalCode].filter(Boolean).join(", ")}</p>
                  <p>{order.country}</p>
                  {order.phone && <p>{order.phone}</p>}
                </>
              ) : (
                <p className="text-slate-500">No shipping address on file.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
