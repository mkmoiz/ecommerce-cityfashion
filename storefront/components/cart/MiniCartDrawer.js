"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

export default function MiniCartDrawer() {
  const { items, total, drawerOpen, closeDrawer, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur"
      onClick={closeDrawer}
      aria-modal="true"
      role="dialog"
      style={{ inset: "0", margin: "auto" }}
    >
      <aside
        className="relative w-full max-w-2xl rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[var(--border)] px-6 py-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Mini bag</p>
            <p className="text-lg font-semibold text-[var(--ink)]">
              {items.length ? `${items.length} item${items.length > 1 ? "s" : ""}` : "Your bag is empty"}
            </p>
          </div>
          <button
            onClick={closeDrawer}
            className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
            aria-label="Close mini cart"
          >
            Close
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-10 text-sm text-[var(--muted)]">
              Your bag is empty. Start with a favorite piece.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-[auto_1fr_auto]"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-white">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted)]">No image</div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Link
                        href={`/product/${item.slug}`}
                        className="line-clamp-2 font-semibold text-[var(--ink)] hover:underline"
                        onClick={closeDrawer}
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm font-semibold text-[var(--ink)]">₹{Number(item.price || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:justify-center">
                    <div className="flex items-center rounded-full border border-[var(--border)] bg-white shadow-sm">
                      <button
                        className="px-3 py-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
                        onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                        aria-label={`Decrease quantity of ${item.title}`}
                      >
                        −
                      </button>
                      <span className="px-3 text-sm font-semibold text-[var(--ink)]">
                        {item.quantity || 1}
                      </span>
                      <button
                        className="px-3 py-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        aria-label={`Increase quantity of ${item.title}`}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-1 text-right">
                    <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Line total</p>
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      ₹{(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-[var(--border)] bg-white px-6 py-4">
          <div className="flex items-center justify-between text-sm text-[var(--muted)]">
            <span>Subtotal</span>
            <span className="text-base font-semibold text-[var(--ink)]">₹{total.toFixed(2)}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 font-semibold text-[var(--ink)] shadow-sm">
              Free shipping over ₹999
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 font-semibold text-[var(--ink)] shadow-sm">
              Dispatch-ready
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="flex-1 rounded-full bg-[var(--ink)] px-4 py-3 text-center text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-black"
            >
              Review full cart
            </Link>
            <button
              onClick={closeDrawer}
              className="flex-1 rounded-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
            >
              Keep browsing
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
