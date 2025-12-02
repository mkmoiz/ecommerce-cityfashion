import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { apiGet } from "@/utils/api";

export default async function CategoryDetailPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  let category;
  try {
    category = await apiGet(`/store/categories/${params.slug}`);
  } catch (err) {
    return notFound();
  }
  const products = category.products || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Category</p>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <p className="text-slate-600">{category.description || ""}</p>
        </div>
        <Link href="/categories" className="text-sm text-slate-600 hover:text-black">
          ← All categories
        </Link>
      </div>

      {products.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No products in this category yet.
        </div>
      )}
    </div>
  );
}
