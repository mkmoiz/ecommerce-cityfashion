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
      addItem(product, 1);
      openDrawer();
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } finally {
      setAdding(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`rounded-full px-6 py-3 text-white shadow transition hover:-translate-y-0.5 hover:shadow-lg ${
        added ? "bg-emerald-600" : "bg-[var(--accent)] hover:bg-[var(--accent-strong)]"
      }`}
      disabled={adding}
    >
      {added ? "Added" : adding ? "Adding..." : "Add to Cart"}
    </button>
  );
}
