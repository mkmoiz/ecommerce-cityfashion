"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { API_BASE } from "@/utils/api";

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated" || !session?.apiToken) return;
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/orders`, {
          headers: { Authorization: `Bearer ${session.apiToken}` },
          credentials: "include"
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [status, session?.apiToken]);

  if (status !== "authenticated") {
    return (
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-display font-semibold">My Orders</h1>
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

  const formatted = useMemo(
    () =>
      orders.map((order) => {
        const itemsCount = order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0;
        return { ...order, itemsCount };
      }),
    [orders]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-display font-semibold">My Orders</h1>
        <p className="text-slate-600">Track your purchases and statuses.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {formatted.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Order #{order.id}</p>
                  <p className="text-lg font-semibold text-slate-900">₹{Number(order.totalAmount || 0).toFixed(2)}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    order.status === "PAID"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {order.status || "Pending"}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                <span>{order.itemsCount} {order.itemsCount === 1 ? "item" : "items"}</span>
                <span className="inline-flex items-center gap-1 text-slate-700">
                  View details
                  <span aria-hidden>↗</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
