"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import CartBadge from "@/components/CartBadge";
import { API_BASE } from "@/utils/api";

const navLinks = [
  { href: "/orders", label: "Orders" },
  { href: "/categories", label: "Categories" }
];

const featuredCollections = [
  { label: "New arrivals", href: "/products?sort=newest", description: "Fresh from the studio." },
  { label: "Wardrobe staples", href: "/products?min=499&max=2999", description: "Layerable everyday picks." },
  { label: "Gifts curated", href: "/products?sort=price_desc", description: "Ready-to-wrap statements." }
];

const quickFilters = [
  { label: "Essentials", href: "/products?sort=newest", meta: "Everyday ready" },
  { label: "Under ₹1999", href: "/products?max=1999&sort=price_asc", meta: "Value picks" },
  { label: "Occasion edit", href: "/products?sort=price_desc", meta: "Evening statements" },
  { label: "Accessories", href: "/categories/accessories", meta: "Finish the look" }
];

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const megaMenuId = "shop-mega-menu";

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/store/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  const isActive = (href) => pathname === href || pathname?.startsWith(`${href}/`);
  const visibleCategories = categories.slice(0, 6);

  const handleMegaBlur = () => {
    setTimeout(() => setMegaOpen(false), 120);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0b10]/95 text-white backdrop-blur shadow-lg">
      <div className="container relative flex items-center justify-between gap-4 py-5">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden rounded-full border border-white/20 bg-white/10 px-3 py-2 text-white shadow-sm hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0b0b10] font-display text-lg">
              CF
            </span>
            <span className="leading-tight font-display">
              <span className="block text-[11px] uppercase tracking-[0.32em] text-white/70">City</span>
              <span className="block text-base">Fashion</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-2 text-sm font-medium text-white md:flex">
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
            onFocus={() => setMegaOpen(true)}
            onBlur={handleMegaBlur}
          >
            <button
              onClick={() => setMegaOpen((v) => !v)}
              aria-expanded={megaOpen}
              aria-controls={megaMenuId}
              aria-haspopup="true"
              className={`rounded-full border px-4 py-2 transition ${
                megaOpen
                  ? "border-white/30 bg-white/15 text-white shadow"
                  : "border-white/10 bg-transparent text-white hover:-translate-y-0.5 hover:bg-white/10"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span>Shop</span>
                <span className={`transition ${megaOpen ? "rotate-180" : ""}`}>▾</span>
              </span>
            </button>
            <MegaMenu id={megaMenuId} open={megaOpen} categories={visibleCategories} />
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-2 transition ${
                isActive(link.href)
                  ? "border border-white/30 bg-white text-[#0c0d12] shadow"
                  : "border border-white/10 bg-transparent text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CartBadge />
          {status === "authenticated" ? (
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2 py-1 shadow-sm">
              <div className="h-9 w-9 overflow-hidden rounded-full bg-white/10 ring-2 ring-white/10">
                {session.user?.image ? (
                  <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/70">
                    {(session.user?.name || session.user?.email || "?").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="hidden text-left text-xs leading-tight text-white/70 sm:block">
                <p className="font-semibold text-white">{session.user?.name || "Account"}</p>
                <p className="text-white/60">{session.user?.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#0c0d12] transition hover:-translate-y-0.5 hover:shadow"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
            className="rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-semibold text-[#0b0b10] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0b0b10]/95 backdrop-blur">
          <nav className="container space-y-4 py-4 text-sm font-medium text-white">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Shop</p>
              <Link
                href="/products"
                className="block rounded-[var(--radius-sm)] border border-white/15 bg-white/10 px-3 py-2 shadow-sm"
                onClick={() => setOpen(false)}
              >
                All products
              </Link>
              <div className="grid grid-cols-2 gap-2">
                {(visibleCategories.length ? visibleCategories : Array.from({ length: 4 })).map((cat, idx) => (
                  <Link
                    key={cat?.id || idx}
                    href={cat?.slug ? `/categories/${cat.slug}` : "#"}
                    className="rounded-[var(--radius-sm)] border border-white/15 bg-white/5 px-3 py-2 text-left shadow-sm"
                    onClick={() => setOpen(false)}
                  >
                    {cat?.name || "Loading"}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-[var(--radius-sm)] px-3 py-2 ${isActive(link.href) ? "bg-white text-[#0c0d12]" : "border border-white/15 bg-white/10 shadow-sm"}`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {status === "authenticated" ? (
              <button
                onClick={() => { setOpen(false); signOut(); }}
                className="w-full rounded-[var(--radius-sm)] bg-white px-3 py-2 text-left text-[#0c0d12]"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => { setOpen(false); signIn("google"); }}
                className="w-full rounded-[var(--radius-sm)] border border-white/15 bg-white px-3 py-2 text-left text-[#0c0d12] shadow-sm"
              >
                Sign in
              </button>
            )}
          </nav>
        </div>
      )}

    </header>
  );
}

function MegaMenu({ open, categories, id }) {
  if (!open) return null;

  return (
    <div
      className="absolute left-1/2 top-full w-[min(1100px,calc(100vw-2rem))] -translate-x-1/2 pt-3"
      id={id}
      role="menu"
      aria-label="Shop categories"
    >
      <div className="grid gap-5 rounded-[var(--radius-lg)] border border-white/15 bg-[#0b0b10] p-6 shadow-2xl md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3 text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">Categories</p>
            <Link href="/categories" className="text-xs font-semibold text-white underline-offset-4 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-2">
            {categories.length
              ? categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="group flex items-center justify-between rounded-[var(--radius-md)] border border-white/10 bg-white/5 px-3 py-3 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <div>
                      <p className="font-semibold group-hover:text-white">{cat.name}</p>
                      {cat.description && <p className="text-xs text-white/60">{cat.description}</p>}
                    </div>
                    <span className="text-lg text-white/50 transition group-hover:translate-x-1">→</span>
                  </Link>
                ))
              : Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-[var(--radius-md)] border border-dashed border-white/15 bg-white/5 px-3 py-4 text-sm text-white/60"
                  >
                    Loading...
                  </div>
                ))}
          </div>
        </div>

        <div className="space-y-3 rounded-[var(--radius-md)] border border-white/10 bg-white/5 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-200">Curations</p>
            <Link
              href="/products?sort=newest"
              className="text-xs font-semibold text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Shop all
            </Link>
          </div>
          <div className="space-y-2">
            {quickFilters.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-3 py-2.5 text-sm transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-xs text-white/60">{item.meta}</p>
                </div>
                <span className="text-lg text-white/50">↗</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 text-white shadow-lg">
          <div className="absolute right-[-40%] top-[-20%] h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" aria-hidden />
          <div className="space-y-3 relative">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-200">Studio highlight</p>
            <p className="text-lg font-semibold">CityFashion Capsule 01</p>
            <p className="text-sm text-white/70">
              Limited looks with sculpted tailoring, smoked neutrals, and luminous accents.
            </p>
            <div className="flex gap-2">
              <Link
                href="/products?sort=newest"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0b0b10] shadow transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                View capsule
              </Link>
              <Link
                href="/categories"
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Browse all
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
