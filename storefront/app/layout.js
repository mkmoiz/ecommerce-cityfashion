import Link from "next/link";
import NavBar from "@/components/NavBar";
import RootProviders from "@/components/CartProvider";
import "./globals.css";

export const metadata = {
  title: "Priya Collections | Storefront",
  description: "Modern storefront UI powered by Next.js and your ecommerce API"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <RootProviders>
          <NavBar />
          <main className="container flex-1 pt-16 pb-12 space-y-10">{children}</main>
          <footer className="mt-10 pt-10 border-t border-white/5 bg-[#0b0b10] text-slate-100">
            <div className="container space-y-8 pt-16 pb-14">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
                    CityFashion
                  </div>
                  <p className="text-3xl font-semibold leading-snug text-white lg:text-4xl">
                    Crafted for modern wardrobes.
                  </p>
                  <p className="text-sm text-slate-300 max-w-xl">
                    Premium pieces, secure checkout, fast delivery.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-200">Shop</p>
                    <div className="space-y-1 text-sm text-slate-300">
                      <Link href="/products" className="block hover:text-white">Products</Link>
                      <Link href="/categories" className="block hover:text-white">Categories</Link>
                      <Link href="/cart" className="block hover:text-white">Bag</Link>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-200">Company</p>
                    <div className="space-y-1 text-sm text-slate-300">
                      <span className="block">About</span>
                      <span className="block">Journal</span>
                      <span className="block">Careers</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-200">Support</p>
                    <div className="space-y-1 text-sm text-slate-300">
                      <span className="block">Help center</span>
                      <span className="block">Shipping</span>
                      <span className="block">Returns</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Secure payments", body: "Encrypted checkout with trusted gateways." },
                  { title: "Fast dispatch", body: "Most orders ship within 48 hours." },
                  { title: "Easy returns", body: "15-day hassle-free returns policy." },
                  { title: "Concierge", body: "Need styling help? We’re a message away." }
                ].map((card) => (
                  <div key={card.title} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                    <p className="font-semibold text-white">{card.title}</p>
                    <p className="text-xs text-slate-400">{card.body}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-sm text-slate-400">
                <span>© {new Date().getFullYear()} CityFashion</span>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Next.js</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Tailwind</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">API Powered</span>
                </div>
              </div>
            </div>
          </footer>
        </RootProviders>
      </body>
    </html>
  );
}
