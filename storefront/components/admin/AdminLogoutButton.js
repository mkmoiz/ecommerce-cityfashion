"use client";

import { useRouter } from "next/navigation";
import { API_BASE } from "@/utils/api";

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/admin/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.error("Admin logout failed", err);
    } finally {
      router.push("/admin/login");
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:border-black"
    >
      Logout
    </button>
  );
}
