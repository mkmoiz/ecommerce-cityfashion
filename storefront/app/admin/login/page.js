import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="max-w-lg space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Admin Access</p>
        <h1 className="text-3xl font-display font-semibold">Sign in</h1>
        <p className="text-sm text-slate-600">Admins sign in with credentials. Google login remains for shoppers.</p>
      </div>
      <AdminLoginForm />
    </div>
  );
}
