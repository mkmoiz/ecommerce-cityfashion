"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminGet, adminPut, getAdminToken, uploadProductImage } from "@/utils/adminApi";
import { toast } from "react-hot-toast";

export default function AdminProductEditPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
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
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const parsedImages = form.images
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  useEffect(() => {
    if (!hasToken) return;

    const fetchData = async () => {
      try {
        const [cats, product] = await Promise.all([
          adminGet("/admin/categories"),
          adminGet(`/admin/products/${params.id}`)
        ]);
        setCategories(cats);
        setForm({
          title: product.title || "",
          price: product.price,
          description: product.description || "",
          stock: product.stock !== null ? product.stock : "",
          images: (product.productImages || []).map(img => img.url).join("\n"),
          categoryId: product.categoryId || ""
        });
      } catch (err) {
        toast.error(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hasToken, params.id]);

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
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasToken) {
        toast.error("Not authenticated");
        return;
    }

    const images = form.images
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

    const price = Number(form.price);
    const stock = form.stock !== "" ? Number(form.stock) : null;

    if (!form.title.trim() || Number.isNaN(price)) {
      toast.error("Title and price are required.");
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
      await adminPut(`/admin/products/${params.id}`, payload);
      toast.success("Product updated");
      setTimeout(() => router.push(`/admin/products/${params.id}`), 600);
    } catch (err) {
      toast.error(err.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasToken) {
    return (
        <div className="p-8">Sign in to edit.</div>
    );
  }

  if (loading) {
      return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-sm text-slate-600">Update product details.</p>
        </div>
        <Link href={`/admin/products/${params.id}`} className="text-sm text-slate-600 hover:text-black">
          ← Back to details
        </Link>
      </div>

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
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
            />
          </label>
        </div>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Description</span>
          <textarea
            value={form.description}
            onChange={handleChange("description")}
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
              rows={5}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
            />
            <p className="text-xs text-slate-500">One URL per line.</p>
          </label>

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Upload images</p>
                <p className="text-xs text-slate-500">Uploads go to your configured bucket.</p>
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
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
