import Link from "next/link";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { adminDelete, adminGet } from "@/utils/adminApi";

export default async function AdminProductDetailPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  if (!token) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-700">
        <h1 className="text-2xl font-semibold">Product #{params.id}</h1>
        <p className="mt-2 text-sm">Sign in with admin credentials to load product details.</p>
      </div>
    );
  }

  let product = null;
  let error = "";

  try {
    product = await adminGet(`/admin/products/${params.id}`, token);
  } catch (err) {
    error = err.message || "Failed to load product";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product #{params.id}</h1>
          <p className="text-sm text-slate-600">View product details.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products" className="text-sm text-slate-600 hover:text-black">
            ← Back to products
          </Link>
          <form action={deleteProduct.bind(null, params.id)}>
            <button
              type="submit"
              className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-700 hover:border-red-400"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {product ? (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Title</p>
              <h2 className="text-2xl font-semibold text-slate-900">{product.title}</h2>
              <p className="text-lg font-semibold text-orange-600">₹{product.price}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Description</p>
              <p className="text-slate-700 leading-relaxed">{product.description || "No description"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Images</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {(product.productImages || []).length ? (
                  product.productImages.map((img) => (
                    <div
                      key={img.id || img.url}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <img src={img.url} alt={product.title} className="h-32 w-full object-cover" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No images</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Meta</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Slug</span>
              <span className="font-medium">{product.slug}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Stock</span>
              <span className="font-medium">{product.stock ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="font-medium">{product.active ? "Active" : "Hidden"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Category</span>
              <span className="font-medium">{product.category?.name || "-"}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
          Product not found.
        </div>
      )}
    </div>
  );
}

async function deleteProduct(id) {
  "use server";
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";
  try {
    await adminDelete(`/admin/products/${id}`, token);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
  } catch (err) {
    console.error("Delete product failed:", err);
  }
}
