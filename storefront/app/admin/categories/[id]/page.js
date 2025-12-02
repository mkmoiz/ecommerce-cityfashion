"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminDelete, adminGet, adminPut, getAdminToken } from "@/utils/adminApi";

export default function AdminCategoryDetailPage({ params }) {
  const hasToken = Boolean(getAdminToken());
  const router = useRouter();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!hasToken) {
      setLoading(false);
      return;
    }
    adminGet(`/admin/categories/${params.id}`)
      .then((data) => {
        setCategory(data);
        setForm({ name: data.name || "", description: data.description || "" });
      })
      .catch((err) => setError(err.message || "Failed to load category"))
      .finally(() => setLoading(false));
  }, [hasToken, params.id]);

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await adminPut(`/admin/categories/${params.id}`, {
        name: form.name.trim(),
        description: form.description.trim()
      });
      setSuccess("Saved");
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await adminDelete(`/admin/categories/${params.id}`);
      router.push("/admin/categories");
    } catch (err) {
      setError(err.message || "Failed to delete");
      setDeleting(false);
    }
  };

  if (!hasToken) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-700">
        <h1 className="text-2xl font-semibold">Category #{params.id}</h1>
        <p className="mt-2 text-sm">Set NEXT_PUBLIC_ADMIN_TOKEN to manage categories.</p>
      </div>
    );
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category #{params.id}</h1>
          <p className="text-sm text-slate-600">Edit category.</p>
        </div>
        <Link href="/admin/categories" className="text-sm text-slate-600 hover:text-black">
          ← Back to categories
        </Link>
      </div>

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

      {category ? (
        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Name</span>
            <input
              value={form.name}
              onChange={updateField("name")}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
              required
            />
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={updateField("description")}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
            />
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
          Category not found.
        </div>
      )}
    </div>
  );
}
