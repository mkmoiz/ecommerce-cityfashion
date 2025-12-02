"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useCart } from "@/components/cart/CartContext";
import RazorpayButton from "@/components/cart/RazorpayButton";
import { useEffect, useState } from "react";
import { API_BASE } from "@/utils/api";

export default function CartPage() {
  const { items, total, updateQuantity, updateItemStock, removeItem, clear } = useCart();
  const { data: session, status } = useSession();
  const [address, setAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

  useEffect(() => {
    if (status !== "authenticated" || !session?.apiToken) return;
    const fetchProfile = async () => {
      setLoadingAddress(true);
      setAddressError("");
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${session.apiToken}` },
          credentials: "include"
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setAddress(data);
      } catch (err) {
        setAddressError(err.message || "Failed to load address");
      } finally {
        setLoadingAddress(false);
      }
    };
    fetchProfile();
  }, [status, session?.apiToken]);

  const itemIds = items.map((i) => i.id).sort().join(",");

  useEffect(() => {
    if (!itemIds) return;
    const fetchStocks = async () => {
      try {
        const res = await fetch(`${API_BASE}/store/products?ids=${items.map((i) => i.id).join(",")}`);
        if (!res.ok) return;
        const data = await res.json();
        const products = data.products || [];

        products.forEach((p) => {
          updateItemStock(p.id, p.stock);
        });
      } catch (err) {
        console.error("Failed to refresh stocks", err);
      }
    };
    fetchStocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemIds]);

  const shippingProgress = Math.min((total / 999) * 100, 100);
  const quantityOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  const hasItems = items.length > 0;
  const steps = [
    { label: "Bag", state: "current" },
    { label: "Delivery", state: hasItems ? "upcoming" : "locked" },
    { label: "Payment", state: hasItems ? "locked" : "locked" }
  ];

  return (
    <div className="space-y-8 pt-4 sm:pt-6">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-semibold text-[var(--ink)] sm:text-4xl">
              {hasItems ? "Review your bag" : "Bag is empty"}
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Curate your picks, adjust quantities, and glide through checkout.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
            >
              Continue shopping
            </Link>
            {hasItems && (
              <a
                href="#checkout-summary"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Go to summary
              </a>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            {steps.map((step, idx) => (
              <div key={step.label} className="flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${
                    step.state === "current"
                      ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                      : "border-[var(--border)] bg-white text-[var(--muted)]"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className={step.state === "current" ? "text-[var(--ink)]" : ""}>{step.label}</span>
                {idx < steps.length - 1 && <span className="mx-2 h-px w-8 bg-[var(--border)]" />}
              </div>
            ))}
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm text-[var(--muted)]">
              <span>Free shipping over ₹999</span>
              <span className="font-semibold text-[var(--ink)]">
                {shippingProgress >= 100 ? "Unlocked" : `₹${Math.max(0, 999 - total).toFixed(0)} to go`}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
            {hasItems && (
              <p className="mt-2 text-xs text-[var(--muted)]">
                Estimated delivery: 3–5 business days once you complete checkout.
              </p>
            )}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border)] bg-white p-10 text-center text-[var(--muted)] shadow-sm">
          <p className="text-lg font-semibold text-[var(--ink)]">Your bag is empty.</p>
          <p className="mt-2 text-sm">Add products from the store and they will appear here.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-5 py-3 text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm text-[var(--muted)]">
              <span className="font-semibold text-[var(--ink)]">Items</span>
              <span>{items.length} {items.length === 1 ? "item" : "items"}</span>
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-[auto_1fr_auto]"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-20 w-20 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-white sm:h-24 sm:w-24">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted)]">No image</div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Link href={`/product/${item.slug}`} className="font-semibold text-[var(--ink)] hover:underline">
                        {item.title}
                      </Link>
                      <p className="text-sm font-semibold text-[var(--ink)]">₹{Number(item.price || 0).toFixed(2)}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-700">
                          In stock
                        </span>
                        <span>Free delivery eligible</span>
                        <span className="inline-flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                          Gift options available
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:justify-center">
                    {item.stock === 0 ? (
                      <span className="inline-flex items-center justify-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                        Out of Stock
                      </span>
                    ) : (
                      <label className="text-xs font-semibold text-[var(--muted)]">
                        Qty
                        <select
                          value={item.quantity || 1}
                          onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                          className="mt-1 w-28 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-2 py-2 text-sm text-[var(--ink)] shadow-sm focus:border-[var(--ink)] focus:outline-none"
                        >
                          {Array.from({ length: Math.min(10, item.stock !== undefined ? item.stock : 10) }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                          {(item.quantity || 1) > Math.min(10, item.stock !== undefined ? item.stock : 10) && (
                            <option value={item.quantity || 1}>{item.quantity}</option>
                          )}
                        </select>
                      </label>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs font-semibold text-[var(--muted)]">
                      <button
                        className="hover:text-[var(--ink)]"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                      <span aria-hidden>•</span>
                      <button className="hover:text-[var(--ink)]">Save for later</button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-2 text-right">
                    <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">Line total</p>
                    <p className="text-lg font-semibold text-[var(--ink)]">
                      ₹{(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </p>
                    <p className="text-xs text-[var(--muted)]">Inclusive of taxes</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              >
                Add more items
              </Link>
              <button
                type="button"
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--muted)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                onClick={clear}
              >
                Clear bag
              </button>
            </div>
          </div>

          <div id="checkout-summary" className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/95 p-5 shadow-lg lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-[var(--ink)]">Order Summary</h2>
            <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--muted)]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[var(--ink)]">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-[var(--ink)]">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-white p-3 text-sm">
              <p className="text-[var(--muted)]">Gift cards or promo codes</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] shadow-sm focus:border-[var(--ink)] focus:outline-none"
                />
                <button
                  type="button"
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                >
                  Apply
                </button>
              </div>
            </div>
            {status !== "authenticated" ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--muted)]">Sign in to checkout.</p>
                <button
                  onClick={() => signIn("google")}
                  className="w-full rounded-full bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Sign in
                </button>
              </div>
            ) : loadingAddress ? (
              <p className="text-sm text-[var(--muted)]">Loading address...</p>
            ) : addressError ? (
              <div className="space-y-2">
                <p className="text-sm text-red-600">{addressError}</p>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                >
                  Update profile
                </Link>
              </div>
            ) : !address?.addressLine1 ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--muted)]">Add a shipping address before checkout.</p>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                >
                  Add address
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
                  <p className="font-semibold text-[var(--ink)]">Shipping to</p>
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>{[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}</p>
                  <p>{address.country}</p>
                  <p>{address.phone}</p>
                  <Link href="/profile" className="mt-2 inline-block text-xs text-[var(--ink)] underline">
                    Update address
                  </Link>
                </div>
                <RazorpayButton />
              </div>
            )}
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)]">
              Encrypted checkout • Secure payments • Easy returns
            </div>
          </div>
        </div>
      )}
      {hasItems && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4 lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full border border-[var(--border)] bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Subtotal</p>
              <p className="text-lg font-semibold text-[var(--ink)]">₹{total.toFixed(2)}</p>
            </div>
            <a
              href="#checkout-summary"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Checkout
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
