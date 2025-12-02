"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { API_BASE } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: ""
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (status !== "authenticated" || !session?.apiToken) return;
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${session.apiToken}` },
          credentials: "include"
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setForm((prev) => ({ ...prev, ...data }));
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [status, session?.apiToken]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.apiToken) return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError("");
      try {
        const res = await fetch(`${API_BASE}/orders`, {
          headers: { Authorization: `Bearer ${session.apiToken}` },
          credentials: "include"
        });
        if (!res.ok) throw new Error(await res.text());
        setOrders(await res.json());
      } catch (err) {
        setOrdersError(err.message || "Failed to load orders");
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [status, session?.apiToken]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    setFieldErrors({});

    const required = ["name", "addressLine1", "city", "state", "postalCode", "country", "phone"];
    const errs = {};
    required.forEach((field) => {
      if (!form[field]?.trim()) errs[field] = "Required";
    });
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setSaving(false);
      addToast({ title: "Check required fields", description: "Fill out highlighted fields to save.", tone: "error" });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.apiToken}`
        },
        credentials: "include",
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage("Profile updated");
      addToast({ title: "Profile updated", tone: "success" });
    } catch (err) {
      setError(err.message || "Failed to save profile");
      addToast({ title: "Save failed", description: err.message, tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (status !== "authenticated") {
    return (
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-display font-semibold">Profile</h1>
        <p className="text-slate-600">Sign in to manage your profile and address.</p>
        <button
          onClick={() => signIn("google")}
          className="rounded-full border border-black px-5 py-3 text-sm font-semibold text-black shadow-sm"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-display font-semibold">Profile</h1>
        <p className="text-slate-600">Keep your delivery details up to date.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Name</span>
            <input
              value={form.name || ""}
              onChange={handleChange("name")}
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                fieldErrors.name ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-black"
              }`}
            />
            {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name}</p>}
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Phone</span>
            <input
              value={form.phone || ""}
              onChange={handleChange("phone")}
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                fieldErrors.phone ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-black"
              }`}
            />
            {fieldErrors.phone && <p className="text-xs text-red-600">{fieldErrors.phone}</p>}
          </label>
        </div>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Address line 1</span>
          <input
            value={form.addressLine1 || ""}
            onChange={handleChange("addressLine1")}
            className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none ${
              fieldErrors.addressLine1 ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-black"
            }`}
          />
          {fieldErrors.addressLine1 && <p className="text-xs text-red-600">{fieldErrors.addressLine1}</p>}
        </label>
        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Address line 2</span>
          <input
            value={form.addressLine2 || ""}
            onChange={handleChange("addressLine2")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>City</span>
            <input
            value={form.city || ""}
            onChange={handleChange("city")}
            className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none ${
              fieldErrors.city ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-black"
            }`}
          />
          {fieldErrors.city && <p className="text-xs text-red-600">{fieldErrors.city}</p>}
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>State</span>
            <input
            value={form.state || ""}
            onChange={handleChange("state")}
            className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none ${
              fieldErrors.state ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-black"
            }`}
          />
          {fieldErrors.state && <p className="text-xs text-red-600">{fieldErrors.state}</p>}
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Postal code</span>
            <input
            value={form.postalCode || ""}
            onChange={handleChange("postalCode")}
            className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none ${
              fieldErrors.postalCode ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-black"
            }`}
          />
          {fieldErrors.postalCode && <p className="text-xs text-red-600">{fieldErrors.postalCode}</p>}
          </label>
        </div>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Country</span>
          <input
            value={form.country || ""}
            onChange={handleChange("country")}
            className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none ${
              fieldErrors.country ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-black"
            }`}
          />
          {fieldErrors.country && <p className="text-xs text-red-600">{fieldErrors.country}</p>}
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-emerald-600">{message}</p>}

        <button
          type="submit"
          disabled={saving || loading}
          className="rounded-full bg-black px-5 py-3 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-semibold">Order history</h2>
          <Link href="/orders" className="text-sm text-slate-600 hover:text-black">View all</Link>
        </div>
        {ordersError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{ordersError}</div>}
        {ordersLoading ? (
          <p className="text-sm text-slate-500">Loading orders...</p>
        ) : !orders.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
            No orders yet.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">Order #{order.id}</p>
                    <p className="text-lg font-semibold text-slate-900">₹{order.totalAmount}</p>
                    <p className="text-sm text-slate-600">Status: {order.status}</p>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:border-black"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
