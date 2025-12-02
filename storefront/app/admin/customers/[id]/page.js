import Link from "next/link";
import { adminGet, getAdminToken } from "@/utils/adminApi";

export default async function AdminCustomerDetailPage({ params }) {
  const hasToken = Boolean(getAdminToken());

  if (!hasToken) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-700">
        <h1 className="text-2xl font-semibold">Customer #{params.id}</h1>
        <p className="mt-2 text-sm">Set NEXT_PUBLIC_ADMIN_TOKEN to load customer details.</p>
      </div>
    );
  }

  let customer = null;
  let error = "";

  try {
    customer = await adminGet(`/admin/customers/${params.id}`);
  } catch (err) {
    error = err.message || "Failed to load customer";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer #{params.id}</h1>
          <p className="text-sm text-slate-600">Profile details.</p>
        </div>
        <Link href="/admin/customers" className="text-sm text-slate-600 hover:text-black">
          ← Back to customers
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {customer ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Name</span>
            <span className="font-medium">{customer.name || "-"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Email</span>
            <span className="font-medium">{customer.email}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Role</span>
            <span className="font-medium">{customer.role || "user"}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
          Customer not found.
        </div>
      )}
    </div>
  );
}
