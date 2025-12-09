"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE } from "@/utils/api";

export default function FilterSidebar({ categories: initialCategories }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL params state
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [inStock, setInStock] = useState(searchParams.get("in_stock") === "true");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");

  const [categories, setCategories] = useState(initialCategories || []);
  const [loadingCats, setLoadingCats] = useState(!initialCategories);

  // Fetch categories if not passed
  useEffect(() => {
    if (!initialCategories) {
      setLoadingCats(true);
      fetch(`${API_BASE}/store/categories`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setCategories(Array.isArray(data) ? data : []);
          setLoadingCats(false);
        })
        .catch(() => setLoadingCats(false));
    }
  }, [initialCategories]);

  // Sync state with URL if it changes externally
  useEffect(() => {
    setMinPrice(searchParams.get("min") || "");
    setMaxPrice(searchParams.get("max") || "");
    setInStock(searchParams.get("in_stock") === "true");
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice) params.set("min", minPrice);
    else params.delete("min");

    if (maxPrice) params.set("max", maxPrice);
    else params.delete("max");

    if (inStock) params.set("in_stock", "true");
    else params.delete("in_stock");

    if (selectedCategory) params.set("category", selectedCategory);
    else params.delete("category");

    // Reset page to 1
    params.set("page", "1");

    router.push(`/search?${params.toString()}`);
  };

  const handleClear = () => {
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setSelectedCategory("");
    router.push("/search");
  };

  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">Category</h3>
        {loadingCats ? (
          <div className="text-sm text-white/50">Loading...</div>
        ) : (
          <div className="space-y-2">
            <label className="flex items-center gap-3 text-sm text-white/70 hover:text-white cursor-pointer group">
              <input
                type="radio"
                name="category"
                value=""
                checked={selectedCategory === ""}
                onChange={() => setSelectedCategory("")}
                className="sr-only"
              />
              <span className={`w-2 h-2 rounded-full ${selectedCategory === "" ? "bg-white" : "bg-white/20 group-hover:bg-white/50"}`}></span>
              All Categories
            </label>
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-3 text-sm text-white/70 hover:text-white cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value={cat.slug}
                  checked={selectedCategory === cat.slug}
                  onChange={() => setSelectedCategory(cat.slug)}
                  className="sr-only"
                />
                <span className={`w-2 h-2 rounded-full ${selectedCategory === cat.slug ? "bg-white" : "bg-white/20 group-hover:bg-white/50"}`}></span>
                {cat.name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">Price Range</h3>
        <div className="flex items-center gap-2">
          <div className="relative w-full">
            <span className="absolute left-3 top-2.5 text-xs text-white/50">₹</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded bg-white/5 border border-white/10 px-3 pl-6 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
            />
          </div>
          <span className="text-white/50">-</span>
          <div className="relative w-full">
            <span className="absolute left-3 top-2.5 text-xs text-white/50">₹</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded bg-white/5 border border-white/10 px-3 pl-6 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Stock */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">Availability</h3>
        <label className="flex items-center gap-3 text-sm text-white/70 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="rounded bg-white/10 border-white/20 text-white focus:ring-0 focus:ring-offset-0"
          />
          In Stock Only
        </label>
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
        <button
          onClick={applyFilters}
          className="w-full rounded bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200 transition"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClear}
          className="w-full text-xs text-white/50 hover:text-white transition text-center"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
