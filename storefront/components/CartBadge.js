"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

export default function CartBadge() {
  const { count, openDrawer } = useCart();
  return (
    <Link
      href="/cart"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        openDrawer();
      }}
      aria-label={count > 0 ? `Bag with ${count} item${count > 1 ? "s" : ""}` : "Bag is empty"}
      className="relative inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      Bag
      {count > 0 && (
        <span
          className="ml-2 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white text-[#0c0d12] px-2 text-xs font-bold"
          aria-live="polite"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
