"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartContext";

export default function AddToCartButton({ product }) {
  const { addItem, openDrawer } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!product) return;
    setAdding(true);
    try {
      const success = addItem(product, 1);
      if (success) {
        openDrawer();
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = product?.stock === 0;

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`rounded-full px-6 py-3 text-white shadow transition hover:-translate-y-0.5 hover:shadow-lg ${
        isOutOfStock
          ? "cursor-not-allowed bg-gray-400 opacity-80"
          : added
          ? "bg-emerald-600"
          : "bg-[var(--accent)] hover:bg-[var(--accent-strong)]"
      }`}
      disabled={adding || isOutOfStock}
    >
      {isOutOfStock ? "Out of Stock" : added ? "Added" : adding ? "Adding..." : "Add to Cart"}
    </button>
  );
}
