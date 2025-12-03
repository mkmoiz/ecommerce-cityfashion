"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { adminGet, adminDelete, getAdminToken } from "@/utils/adminApi";
import { toast } from "react-hot-toast";

export default function AdminHeroPage() {
  const [slides, setSlides] = useState([]);
  const hasToken = Boolean(getAdminToken());

  useEffect(() => {
    if (hasToken) {
      adminGet("/admin/hero").then(setSlides).catch(err => toast.error(err.message));
    }
  }, [hasToken]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await adminDelete(`/admin/hero/${id}`);
      setSlides(prev => prev.filter(s => s.id !== id));
      toast.success("Slide deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!hasToken) return <div>Sign in to view hero slides.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold">Hero Slides</h1>
            <p className="text-slate-500 text-sm">Manage your homepage carousel.</p>
        </div>
        <Link href="/admin/hero/new" className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition">
          Add Slide
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                    <th className="px-6 py-4 text-left">Slide</th>
                    <th className="px-6 py-4 text-left">Content</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {slides.map(slide => (
                    <tr key={slide.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 w-48">
                            <div className="h-24 w-40 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                                {slide.image ? (
                                    <img src={slide.image} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-slate-400">No Image</div>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">{slide.title}</p>
                            <p className="text-sm text-slate-500 line-clamp-1">{slide.subtitle}</p>
                            {slide.badge && (
                                <span className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                    {slide.badge}
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${slide.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${slide.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {slide.active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                                <Link href={`/admin/hero/${slide.id}/edit`} className="text-sm font-medium text-slate-600 hover:text-black">
                                    Edit
                                </Link>
                                <button onClick={() => handleDelete(slide.id)} className="text-sm font-medium text-red-600 hover:text-red-700">
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {slides.length === 0 && (
                    <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                            No slides yet. Create your first one to feature on the homepage.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
