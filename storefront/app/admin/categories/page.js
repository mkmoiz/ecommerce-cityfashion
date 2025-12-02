import Link from "next/link";
import { cookies } from "next/headers";
import { adminGet, adminPost } from "@/utils/adminApi";

export default async function AdminCategoriesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";
  let categories = [];
  let error = "";

  if (token) {
    try {
      categories = await adminGet("/admin/categories", token);
    } catch (err) {
      error = err.message || "Failed to load categories";
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-sm text-slate-600">Manage product categories.</p>
        </div>
      </div>

      {!token && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Please <Link href="/admin/login" className="underline">sign in</Link> to manage categories.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {token && <CategoryForm token={token} />}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Slug</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Products</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.length ? (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{cat.name}</td>
                  <td className="px-4 py-3 text-slate-700">{cat.slug}</td>
                  <td className="px-4 py-3 text-slate-700">{cat._count?.products ?? 0}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/categories/${cat.id}`}
                      className="rounded-full border border-slate-200 px-3 py-1 text-slate-700 hover:border-black"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryForm() {
  async function createCategory(formData, token) {
    "use server";

    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || undefined;

    if (!name) {
      return { error: "Name is required" };
    }

    try {
      await adminPost("/admin/categories", { name, description }, token);
      return { success: true };
    } catch (err) {
      return { error: err.message || "Failed to create category" };
    }
  }

  return (
    <form action={createCategory} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Add category</h2>
      <div className="grid gap-3 md:grid-cols-[2fr_3fr]">
        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Name</span>
          <input
            name="name"
            placeholder="Category name"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
            required
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Description</span>
          <input
            name="description"
            placeholder="Optional description"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
          />
        </label>
      </div>
      <button type="submit" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow">
        Create category
      </button>
    </form>
  );
}
