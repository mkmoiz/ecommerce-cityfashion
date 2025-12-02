import Link from "next/link";
import { cookies } from "next/headers";
import { adminGet } from "@/utils/adminApi";

export default async function AdminHomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  if (!token) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-700">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <p className="mt-2 text-sm">
          Please <Link href="/admin/login" className="underline">sign in</Link> with admin credentials.
        </p>
      </div>
    );
  }

  let stats = null;
  let me = null;
  let error = "";

  try {
    [stats, me] = await Promise.all([
      adminGet("/admin/stats", token),
      adminGet("/admin/me", token)
    ]);
  } catch (err) {
    error = err.message || "Failed to load admin data";
  }

  const cards = [
    { label: "Products", value: stats?.totalProducts ?? "-", tone: "from-sky-500/15 to-sky-500/5" },
    { label: "Orders", value: stats?.totalOrders ?? "-", tone: "from-emerald-500/15 to-emerald-500/5" },
    { label: "Customers", value: stats?.totalCustomers ?? "-", tone: "from-amber-500/15 to-amber-500/5" },
    { label: "Revenue", value: stats?.totalRevenue ? `₹${stats.totalRevenue}` : "-", tone: "from-indigo-500/15 to-indigo-500/5" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? "-", tone: "from-rose-500/15 to-rose-500/5" }
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--ink)]">Admin dashboard</h1>
            <p className="text-slate-600">Monitor products, orders, and customers from your API.</p>
            {me && (
              <p className="text-sm text-slate-500">Logged in as {me.name || me.email}</p>
            )}
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          >
            View storefront ↗
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border border-[var(--border)] bg-gradient-to-br ${card.tone} p-5 shadow-sm`}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-slate-600 hover:text-black">
            View all
          </Link>
        </div>

        {stats?.recentOrders?.length ? (
          <div className="mt-4 divide-y divide-slate-100">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-[var(--ink)]">Order #{order.id}</p>
                  <p className="text-slate-500">Customer: {order.user?.email || "-"}</p>
                </div>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-[var(--ink)] hover:border-black"
                >
                  Open
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
