"use client";

import Providers from "@/components/Providers";
import { CartProvider as CartContextProvider } from "@/components/cart/CartContext";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import MiniCartDrawer from "@/components/cart/MiniCartDrawer";

export default function RootProviders({ children }) {
  return (
    <Providers>
      <ToastProvider>
        <AdminAuthProvider>
          <CartContextProvider>
            {children}
            <MiniCartDrawer />
          </CartContextProvider>
        </AdminAuthProvider>
      </ToastProvider>
    </Providers>
  );
}
