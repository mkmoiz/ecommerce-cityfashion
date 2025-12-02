import Link from "next/link";
import { cookies } from "next/headers";
import { adminDelete, adminGet } from "@/utils/adminApi";

export default async function AdminProductsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  if (!token) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-700">
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="mt-2 text-sm">
          <Link href="/admin/login" className="underline">Sign in</Link> with admin credentials to manage products.
        </p>
      </div>
    );
  }

  let products = [];
  let error = "";

  try {
    products = await adminGet("/admin/products", token);
  } catch (err) {
    error = err.message || "Failed to load products";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--ink)]">Products</h1>
          <p className="text-sm text-slate-600">Manage all products from the API.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
        >
          Add product
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Category</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Price</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Stock</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length ? (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{product.title}</td>
                  <td className="px-4 py-3 text-slate-700">{product.category?.name || "-"}</td>
                  <td className="px-4 py-3 text-slate-700">₹{product.price}</td>
                  <td className="px-4 py-3 text-slate-700">{product.stock ?? "-"}</td>
                  <td className="px-4 py-3">
                    <StatusPill active={product.active} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="rounded-full border border-[var(--border)] px-3 py-1 text-[var(--ink)] hover:border-black"
                      >
                        Edit
                      </Link>
                      <form action={deleteProduct.bind(null, product.id)}>
                        <button
                          type="submit"
                          className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700 hover:border-red-400"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function deleteProduct(id) {
  "use server";
  const token = cookies().get("admin_token")?.value || "";
  try {
    await adminDelete(`/admin/products/${id}`, token);
  } catch (err) {
    console.error("Delete product failed:", err);
  }
}

function StatusPill({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {active ? "Active" : "Hidden"}
    </span>
  );
}
