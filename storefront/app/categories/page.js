import Link from "next/link";
import { apiGet } from "@/utils/api";

export default async function CategoriesPage() {
  const categories = await apiGet("/store/categories");

  return (
    <div className="space-y-8">
      <div className="glass-tile relative overflow-hidden px-6 py-10 sm:px-10">
        <div className="absolute right-6 top-6 hidden h-28 w-28 rounded-full bg-[var(--accent)]/15 blur-2xl md:block" aria-hidden />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em]">
              Categories
            </div>
            <div className="max-w-2xl space-y-2">
              <h1 className="text-3xl font-bold text-[var(--ink)] sm:text-4xl">Explore the collections</h1>
              <p className="text-sm text-[var(--muted)]">Jump into curated assortments—tailored edits, staples, and seasonal drops.</p>
            </div>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          >
            Browse all products
            <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.length ? (
          categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-[var(--accent)]/10 blur-2xl transition duration-500 group-hover:translate-y-1" aria-hidden />
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Category</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">{cat.name}</h2>
              <p className="text-sm text-[var(--muted)] line-clamp-3">{cat.description || ""}</p>
              <div className="mt-4 flex items-center justify-between text-sm font-semibold text-[var(--ink)]">
                <span>{cat._count?.products || 0} products</span>
                <span className="text-[var(--accent)] transition group-hover:translate-x-1">View</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="md:col-span-3 rounded-2xl border border-dashed border-[var(--border)] bg-white p-8 text-center text-[var(--muted)]">
            No categories yet.
          </div>
        )}
      </div>
    </div>
  );
}
