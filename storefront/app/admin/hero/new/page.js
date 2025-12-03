"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminPost, uploadProductImage, getAdminToken } from "@/utils/adminApi";
import { toast } from "react-hot-toast";

export default function NewHeroSlide() {
    const router = useRouter();
    const hasToken = Boolean(getAdminToken());
    const [form, setForm] = useState({
        title: "", subtitle: "", badge: "", caption: "",
        cta1Label: "", cta1Href: "", cta2Label: "", cta2Href: "",
        tags: "", image: ""
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadProductImage(file);
            setForm(prev => ({ ...prev, image: url }));
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminPost("/admin/hero", form);
            toast.success("Slide created");
            router.push("/admin/hero");
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (!hasToken) return <div>Sign in</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">New Slide</h1>
                    <p className="text-slate-500 text-sm">Create a standout hero banner.</p>
                </div>
                <Link href="/admin/hero" className="text-sm font-medium text-slate-600 hover:text-black">
                    ← Cancel
                </Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-900">Content</h3>
                        <div className="grid gap-4">
                            <label className="block text-sm">
                                <span className="font-medium text-slate-700">Title</span>
                                <input name="title" value={form.title} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none" required />
                            </label>
                            <label className="block text-sm">
                                <span className="font-medium text-slate-700">Subtitle</span>
                                <input name="subtitle" value={form.subtitle} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none" />
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="block text-sm">
                                    <span className="font-medium text-slate-700">Badge</span>
                                    <input name="badge" placeholder="e.g. New Season" value={form.badge} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none" />
                                </label>
                                <label className="block text-sm">
                                    <span className="font-medium text-slate-700">Caption</span>
                                    <input name="caption" placeholder="e.g. Summer '24" value={form.caption} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none" />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="font-semibold text-slate-900">Visuals</h3>
                        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                            {form.image ? (
                                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-white shadow-sm">
                                    <img src={form.image} className="h-full w-full object-cover" />
                                    <button type="button" onClick={() => setForm(f => ({...f, image: ""}))} className="absolute top-2 right-2 rounded-full bg-white/90 p-1 text-slate-500 shadow-sm hover:text-red-600">
                                        <span className="sr-only">Remove</span>
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Drag and drop or click to upload</p>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full bg-white border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                                        Choose File
                                    </button>
                                </div>
                            )}
                            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                            <div className="mt-4">
                                <span className="text-xs text-slate-400 uppercase tracking-wider">OR</span>
                                <input name="image" placeholder="Paste Image URL" value={form.image} onChange={handleChange} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none text-center" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="font-semibold text-slate-900">Actions</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary CTA</p>
                                <input name="cta1Label" placeholder="Label" value={form.cta1Label} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                                <input name="cta1Href" placeholder="Link" value={form.cta1Href} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Secondary CTA</p>
                                <input name="cta2Label" placeholder="Label" value={form.cta2Label} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                                <input name="cta2Href" placeholder="Link" value={form.cta2Href} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm">
                            <span className="font-medium text-slate-700">Tags</span>
                            <input name="tags" placeholder="Comma separated (e.g. Sale, New, Hot)" value={form.tags} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none" />
                        </label>
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={uploading} className="w-full rounded-full bg-black py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 disabled:opacity-50">
                            {uploading ? "Uploading..." : "Create Slide"}
                        </button>
                    </div>
                </form>

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Preview</h3>
                    {/* Simulated Hero Card */}
                    <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-xl">
                        <div className="relative aspect-[4/3] bg-slate-100">
                            {form.image ? (
                                <img src={form.image} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-300 bg-slate-50 text-sm">No image</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                                {form.badge && (
                                    <span className="inline-block rounded-full bg-white/20 backdrop-blur px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                                        {form.badge}
                                    </span>
                                )}
                                <p className="text-2xl font-bold leading-tight">{form.title || "Slide Title"}</p>
                                <p className="text-sm text-white/90 line-clamp-2">{form.subtitle || "Subtitle text goes here."}</p>
                                <div className="pt-2 flex gap-2">
                                    {form.cta1Label && (
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">{form.cta1Label}</span>
                                    )}
                                    {form.cta2Label && (
                                        <span className="rounded-full border border-white/40 bg-black/20 backdrop-blur px-3 py-1 text-xs font-bold text-white">{form.cta2Label}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 text-center">This is a simplified preview. Actual display varies.</p>
                </div>
            </div>
        </div>
    )
}
