"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">New Hero Slide</h1>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
                <input name="title" placeholder="Title" value={form.title} onChange={handleChange} className="w-full border p-2 rounded" required />
                <input name="subtitle" placeholder="Subtitle" value={form.subtitle} onChange={handleChange} className="w-full border p-2 rounded" />
                <div className="flex gap-4">
                    <input name="badge" placeholder="Badge" value={form.badge} onChange={handleChange} className="w-full border p-2 rounded" />
                    <input name="caption" placeholder="Caption" value={form.caption} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>

                <div className="border p-4 rounded space-y-2">
                    <h3 className="font-semibold">Image</h3>
                    <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} className="w-full border p-2 rounded mb-2" />
                    <input type="file" onChange={handleFileChange} ref={fileInputRef} />
                    {form.image && <img src={form.image} className="h-40 object-cover mt-2" />}
                </div>

                <div className="flex gap-4">
                    <input name="cta1Label" placeholder="CTA 1 Label" value={form.cta1Label} onChange={handleChange} className="w-full border p-2 rounded" />
                    <input name="cta1Href" placeholder="CTA 1 Link" value={form.cta1Href} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div className="flex gap-4">
                    <input name="cta2Label" placeholder="CTA 2 Label" value={form.cta2Label} onChange={handleChange} className="w-full border p-2 rounded" />
                    <input name="cta2Href" placeholder="CTA 2 Link" value={form.cta2Href} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                 <input name="tags" placeholder="Tags (comma separated)" value={form.tags} onChange={handleChange} className="w-full border p-2 rounded" />

                <button type="submit" className="bg-black text-white px-4 py-2 rounded">Create Slide</button>
            </form>
        </div>
    )
}
