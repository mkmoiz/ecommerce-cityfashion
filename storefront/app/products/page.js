import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { apiGet } from "@/utils/api";

const PAGE_SIZE = 12;

function pickParam(params, key) {
  if (!params) return "";
  if (typeof params.get === "function") return params.get(key) || "";
  const value = params[key];
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export default async function ProductsPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;

  const page = Number(pickParam(searchParams, "page")) || 1;
  const sort = pickParam(searchParams, "sort") || "newest";
  const q = pickParam(searchParams, "q");
  const min = pickParam(searchParams, "min");
  const max = pickParam(searchParams, "max");
  const category = pickParam(searchParams, "category");

  const query = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
    sort
  });

  if (q) query.set("q", q);
  if (min) query.set("min", min);
  if (max) query.set("max", max);
  if (category) query.set("category", category);

  const [data, categories] = await Promise.all([
    apiGet(`/store/products?${query.toString()}`),
    apiGet("/store/categories")
  ]);
  const products = data.products || [];
  const pages = Math.max(data.pages || 1, 1);

  const buildQuery = (overrides = {}) => {
    const params = new URLSearchParams({
      page: String(overrides.page ?? page),
      limit: String(PAGE_SIZE),
      sort: overrides.sort ?? sort
    });

    if (q && overrides.q !== "") params.set("q", overrides.q ?? q);
    if (min && overrides.min !== "") params.set("min", overrides.min ?? min);
    if (max && overrides.max !== "") params.set("max", overrides.max ?? max);
    if (category && overrides.category !== "") params.set("category", overrides.category ?? category);

    return params.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">All Products</h1>
          <p className="text-sm text-slate-600">
            Search, filter by price, and paginate through the catalog.
          </p>
        </div>

        <form className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm" method="get">
          <input
            name="q"
            placeholder="Search products"
            defaultValue={q}
            className="min-w-[180px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
          />
          <input
            name="min"
            type="number"
            placeholder="Min price"
            defaultValue={min}
            className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
          />
          <input
            name="max"
            type="number"
            placeholder="Max price"
            defaultValue={max}
            className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
          />
          <select
            name="sort"
            defaultValue={sort}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <select
            name="category"
            defaultValue={category}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow hover:-translate-y-0.5 hover:shadow-lg transition"
          >
            Apply
          </button>
          <Link
            href="/products"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-black/60"
          >
            Reset
          </Link>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {products.length ? (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No products match your filters yet.
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: pages }).map((_, idx) => {
          const href = `/products?${buildQuery({ page: idx + 1 })}`;
          const isActive = idx + 1 === Number(page);

          return (
            <Link
              key={idx}
              href={href}
              className={`rounded-full px-4 py-2 text-sm border transition ${
                isActive
                  ? "border-black bg-black text-white"
                  : "border-slate-200 bg-white hover:border-black/60"
              }`}
            >
              {idx + 1}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
