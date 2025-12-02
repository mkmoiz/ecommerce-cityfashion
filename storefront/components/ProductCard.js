"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export default function ProductCard({ product }) {
  const images = useMemo(
    () => (product?.productImages || []).map((img) => img.url).filter(Boolean),
    [product?.productImages]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const image = images[activeIndex] || images[0] || product?.productImages?.[0]?.url;
  const category = product?.category?.name;
  const hasMultiple = images.length > 1;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            No image
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {category || "Collection"}
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-sm text-slate-700 shadow-sm opacity-0 transition group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-sm text-slate-700 shadow-sm opacity-0 transition group-hover:opacity-100"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    idx === activeIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
          New drop
        </div>
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-slate-900">
          {product.title}
        </h3>
        <p className="text-lg font-bold text-orange-600">₹{product.price}</p>
      </div>
    </Link>
  );
}
