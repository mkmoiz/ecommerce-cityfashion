"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminGet, adminPost, getAdminToken, uploadProductImage } from "@/utils/adminApi";

export default function AdminProductNewPage() {
  const router = useRouter();
  const hasToken = Boolean(getAdminToken());

  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    stock: "",
    images: "",
    categoryId: ""
  });
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const parsedImages = form.images
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  useEffect(() => {
    if (!hasToken) return;
    adminGet("/admin/categories")
      .then(setCategories)
      .catch((err) => setError(err.message || "Failed to load categories"));
  }, [hasToken]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const appendImages = (urls) => {
    setForm((prev) => {
      const existing = prev.images
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
      const merged = [...existing, ...urls];
      return { ...prev, images: merged.join("\n") };
    });
  };

  const handleFilePick = () => fileInputRef.current?.click();

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploadError("");
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const url = await uploadProductImage(file);
        uploaded.push(url);
      }
      if (uploaded.length) {
        appendImages(uploaded);
      }
    } catch (err) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!hasToken) {
      setError("Set NEXT_PUBLIC_ADMIN_TOKEN in .env.local to create products.");
      return;
    }

    const images = form.images
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

    const price = Number(form.price);
    const stock = form.stock ? Number(form.stock) : null;

    if (!form.title.trim() || Number.isNaN(price)) {
      setError("Title and price are required.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price,
      stock,
      images,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined
    };

    setSubmitting(true);
    try {
      await adminPost("/admin/products", payload);
      setSuccess("Product created. Redirecting...");
      setTimeout(() => router.push("/admin/products"), 600);
    } catch (err) {
      setError(err.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Add product</h1>
          <p className="text-sm text-slate-600">Create a new product via the admin API.</p>
        </div>
        <Link href="/admin/products" className="text-sm text-slate-600 hover:text-black">
          ← Back to products
        </Link>
      </div>

      {!hasToken && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Set NEXT_PUBLIC_ADMIN_TOKEN in .env.local to submit this form.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Title *</span>
            <input
              value={form.title}
              onChange={handleChange("title")}
              placeholder="Enter product title"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
              required
            />
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Price *</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange("price")}
              placeholder="1999"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Category</span>
            <select
              value={form.categoryId}
              onChange={handleChange("categoryId")}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
            >
              <option value="">Select a category (optional)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Stock</span>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange("stock")}
              placeholder="Optional"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
            />
          </label>
        </div>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Description</span>
          <textarea
            value={form.description}
            onChange={handleChange("description")}
            placeholder="Product details, materials, etc."
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Image URLs</span>
            <textarea
              value={form.images}
              onChange={handleChange("images")}
              placeholder="One URL per line or comma-separated"
              rows={5}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
            />
            <p className="text-xs text-slate-500">You can paste URLs or upload below.</p>
          </label>

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Upload images</p>
                <p className="text-xs text-slate-500">Uploads go to your configured bucket via signed URL.</p>
              </div>
              <button
                type="button"
                onClick={handleFilePick}
                disabled={uploading}
                className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white shadow disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {uploading ? "Uploading..." : "Select files"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {uploadError && (
              <p className="text-xs text-red-600">Upload failed: {uploadError}</p>
            )}
            {parsedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {parsedImages.slice(0, 6).map((url) => (
                  <div key={url} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <img src={url} alt="Product" className="h-20 w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-black px-5 py-3 text-white shadow disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitting ? "Creating..." : "Create product"}
        </button>
      </form>
    </div>
  );
}
