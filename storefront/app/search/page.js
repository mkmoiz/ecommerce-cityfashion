"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import FilterSidebar from "@/components/search/FilterSidebar";
import { API_BASE } from "@/utils/api";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [gridType, setGridType] = useState("grid"); // grid or list

  // Params
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const min = searchParams.get("min") || "";
  const max = searchParams.get("max") || "";
  const inStock = searchParams.get("in_stock") === "true";
  const sort = searchParams.get("sort") || "newest";
  const page = searchParams.get("page") || "1";

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
            page,
            limit: 12,
            sort
        });

        if (q) params.append("q", q);
        if (category) params.append("category", category);
        if (min) params.append("min", min);
        if (max) params.append("max", max);
        if (inStock) params.append("in_stock", "true");

        const res = await fetch(`${API_BASE}/store/products?${params.toString()}`);
        if (res.ok) {
            const data = await res.json();
            if (!cancelled) {
                setProducts(data.products || []);
                setTotal(data.total || 0);
                setTotalPages(data.pages || 1);
            }
        } else {
            console.error("Failed to fetch products");
        }
      } catch (error) {
        if (!cancelled) console.error("Error fetching products:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, [q, category, min, max, inStock, sort, page]);

  const handleSortChange = (e) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`/search?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="container py-8 md:py-12 text-white">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-white/10 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-1">Search & Discovery</p>
          <h1 className="text-3xl font-display font-bold">
            {q ? `Results for "${q}"` : "All Products"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-sm text-white/70">
                <span>Sort by:</span>
                <select
                    value={sort}
                    onChange={handleSortChange}
                    className="bg-[#0b0b10] border border-white/20 rounded px-2 py-1 focus:outline-none focus:border-white/50"
                >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>
             </div>
             <p className="text-sm text-white/50 hidden md:block">{total} products found</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="hidden md:block">
            <FilterSidebar />
        </aside>

        {/* Mobile Filter Toggle could go here */}

        {/* Product Grid */}
        <main>
            {loading ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="aspect-[3/4] rounded bg-white/5 animate-pulse" />
                    ))}
                 </div>
            ) : products.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                                <div className="aspect-[3/4] w-full overflow-hidden rounded bg-white/5 relative">
                                    {product.productImages?.[0]?.url ? (
                                        <img
                                            src={product.productImages[0].url}
                                            alt={product.title}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-white/20">No Image</div>
                                    )}
                                    {product.stock <= 0 && (
                                        <div className="absolute top-2 right-2 bg-red-500/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                                            Out of stock
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3">
                                    <h3 className="text-sm font-medium text-white group-hover:underline underline-offset-4">{product.title}</h3>
                                    <div className="mt-1 flex items-center gap-2">
                                        <p className="text-sm text-white/70">₹{product.price}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center gap-2">
                            <button
                                disabled={Number(page) <= 1}
                                onClick={() => handlePageChange(Number(page) - 1)}
                                className="px-3 py-1 rounded border border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`px-3 py-1 rounded border ${Number(page) === i + 1 ? 'bg-white text-black border-white' : 'border-white/20 hover:bg-white/10'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                disabled={Number(page) >= totalPages}
                                onClick={() => handlePageChange(Number(page) + 1)}
                                className="px-3 py-1 rounded border border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="py-20 text-center border border-dashed border-white/10 rounded">
                    <p className="text-lg text-white/60">No products found matching your criteria.</p>
                    <button
                        onClick={() => router.push('/search')}
                        className="mt-4 text-sm text-white underline underline-offset-4"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="container py-12 text-white text-center">Loading Search...</div>}>
            <SearchContent />
        </Suspense>
    )
}
