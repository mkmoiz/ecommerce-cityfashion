"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "storefront_cart_v1";

function loadCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load cart", err);
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to persist cart", err);
    }
  }, [items, hydrated]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0),
    [items]
  );

  const count = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 1), 0),
    [items]
  );

  const addItem = (product, quantity = 1) => {
    const stock = product.stock !== undefined ? product.stock : Infinity;
    const existing = items.find((p) => p.id === product.id);
    const currentQty = existing ? (existing.quantity || 1) : 0;

    if (currentQty + quantity > stock) {
      alert(`Cannot add more items. Only ${stock} left in stock.`);
      return false;
    }

    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id
            ? { ...p, quantity: (p.quantity || 1) + quantity, stock: product.stock }
            : p
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          slug: product.slug,
          image: product.productImages?.[0]?.url,
          quantity: quantity || 1,
          stock: product.stock
        }
      ];
    });
    setDrawerOpen(true);
    return true;
  };

  const updateQuantity = (id, quantity) => {
    const item = items.find((i) => i.id === id);
    if (item && item.stock !== undefined && quantity > item.stock) {
      alert(`Cannot update quantity. Only ${item.stock} left in stock.`);
      quantity = item.stock;
    }

    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => (item.quantity || 0) > 0)
    );
  };

  const updateItemStock = (id, stock) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = (item.quantity || 1) > stock ? stock : (item.quantity || 1);
          return { ...item, stock, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clear = () => {
    setItems([]);
    setDrawerOpen(false);
  };

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);
  const toggleDrawer = () => setDrawerOpen((v) => !v);

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      updateItemStock,
      removeItem,
      clear,
      total,
      count,
      drawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      hydrated
    }),
    [items, total, count, drawerOpen, hydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
