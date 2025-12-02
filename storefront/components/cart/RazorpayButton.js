"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "@/utils/api";
import { useCart } from "@/components/cart/CartContext";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/ToastProvider";

export default function RazorpayButton() {
  const { data: session } = useSession();
  const { total, clear, items } = useCart();
  const { addToast } = useToast();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    // load Razorpay script
    const scriptId = "razorpay-sdk";
    if (document.getElementById(scriptId)) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setReady(true);
    script.onerror = () => setError("Failed to load Razorpay SDK");
    document.body.appendChild(script);
  }, []);

  const handlePay = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payments/razorpay/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create order");
      }

      const { order, keyId } = await res.json();

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Priya Collections",
        description: "Order payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            await fetch(`${API_BASE}/orders`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: session?.apiToken ? `Bearer ${session.apiToken}` : ""
              },
              credentials: "include",
              body: JSON.stringify({
                items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                paymentMethod: "razorpay"
              })
            });
          } catch (err) {
            setError("Payment captured, but failed to save order. Contact support.");
            addToast({ title: "Order save failed", description: "Payment succeeded but order save failed.", tone: "error" });
            return;
          }
          clear();
          setInfo("Payment successful.");
          addToast({ title: "Payment successful", description: "Order placed. Thank you!", tone: "success" });
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || ""
        },
        theme: { color: "#000000" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        setError(resp.error?.description || "Payment failed");
        addToast({ title: "Payment failed", description: resp.error?.description, tone: "error" });
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Payment failed");
      addToast({ title: "Payment failed", description: err.message, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={!ready || loading}
        onClick={handlePay}
        className="w-full rounded-full bg-black px-4 py-3 text-white shadow transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-500"
      >
        {loading ? "Processing..." : "Checkout with Razorpay"}
      </button>
      {info && <p className="text-sm text-emerald-600">{info}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!ready && !error && <p className="text-xs text-slate-500">Loading payment SDK...</p>}
    </div>
  );
}
