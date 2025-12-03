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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hero Slides</h1>
        <Link href="/admin/hero/new" className="rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-slate-800">
          Add Slide
        </Link>
      </div>
      <div className="grid gap-4">
        {slides.map(slide => (
            <div key={slide.id} className="flex items-center gap-4 rounded-lg border p-4 bg-white">
                {slide.image && <img src={slide.image} alt={slide.title} className="h-20 w-32 object-cover rounded" />}
                <div className="flex-1">
                    <h3 className="font-semibold">{slide.title}</h3>
                    <p className="text-sm text-gray-500">{slide.subtitle}</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/admin/hero/${slide.id}/edit`} className="text-blue-600 text-sm">Edit</Link>
                    <button onClick={() => handleDelete(slide.id)} className="text-red-600 text-sm">Delete</button>
                </div>
            </div>
        ))}
        {slides.length === 0 && <p className="text-gray-500">No slides found.</p>}
      </div>
    </div>
  );
}
