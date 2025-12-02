import Link from "next/link";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

export const metadata = {
  title: "Admin | Priya Collections",
  description: "Admin dashboard for managing products, orders, and customers."
};

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/customers", label: "Customers" }
];

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container flex items-center justify-between gap-6 py-5">
          <Link href="/admin" className="text-lg font-semibold text-[var(--ink)]">
            Admin Panel
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-[var(--muted)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/" className="rounded-full px-3 py-1.5 text-[var(--muted)] hover:text-[var(--ink)]">
              Back to store
            </Link>
            <AdminLogoutButton />
          </nav>
        </div>
      </header>

      <main className="container py-10 space-y-6">{children}</main>
    </div>
  );
}
