import Link from "next/link";
import { cookies } from "next/headers";
import { adminGet } from "@/utils/adminApi";

export default async function AdminCustomersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  if (!token) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-700">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="mt-2 text-sm">
          Please <Link href="/admin/login" className="underline">sign in</Link> to load customers.
        </p>
      </div>
    );
  }

  let customers = [];
  let error = "";

  try {
    customers = await adminGet("/admin/customers", token);
  } catch (err) {
    error = err.message || "Failed to load customers";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-sm text-slate-600">View registered customers.</p>
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
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.length ? (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{customer.name || "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{customer.email}</td>
                  <td className="px-4 py-3 text-slate-700">{customer.role || "user"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="rounded-full border border-slate-200 px-3 py-1 text-slate-700 hover:border-black"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
