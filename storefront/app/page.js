import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import { apiGet } from "@/utils/api";

const PAGE_SIZE = 8;
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" }
];

export default async function HomePage({ searchParams: searchParamsPromise }) {
  const paramsObj = await searchParamsPromise;
  const page = Number(paramsObj?.page) || 1;
  const sort = paramsObj?.sort || "newest";

  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
    sort
  });

  const data = await apiGet(`/store/products?${params.toString()}`);
  const categories = await apiGet("/store/categories");
  const products = data.products || [];
  const pages = Math.max(data.pages || 1, 1);
  const heroData = await apiGet("/store/hero").catch(() => []);
  let heroSlides = heroData.map((s) => ({
    badge: s.badge,
    title: s.title,
    subtitle: s.subtitle,
    image: s.image,
    caption: s.caption,
    tags: s.tags ? s.tags.split(",").map((t) => t.trim()) : [],
    ctas: [
      s.cta1Label && { label: s.cta1Label, href: s.cta1Href, variant: "primary" },
      s.cta2Label && { label: s.cta2Label, href: s.cta2Href }
    ].filter(Boolean)
  }));

  if (heroSlides.length === 0) {
    heroSlides = [
      {
        badge: "New Season",
        title: "Signature silhouettes made for the city.",
        subtitle:
          "Layerable textures, sculpted tailoring, and bold accessories that turn every street into a runway.",
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80",
        caption: "City Capsule '24",
        tags: ["Tailored", "Monochrome", "Layer-ready"],
        ctas: [
          { label: "Shop capsule", href: "/products?sort=newest", variant: "primary" },
          { label: "View lookbook", href: "/categories" }
        ]
      },
      {
        badge: "Limited drop",
        title: "Evening edit with luminous details.",
        subtitle:
          "Draped silhouettes, metallic accents, and statement jewelry curated for after-hours.",
        image:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80",
        caption: "Evening Stories",
        tags: ["Metallic", "Occasion", "Luxe trims"],
        ctas: [
          { label: "Shop evening", href: "/products?sort=price_desc", variant: "primary" },
          { label: "Gifting picks", href: "/products?min=999&max=2999" }
        ]
      },
      {
        badge: "Editor’s pick",
        title: "Weekend ease with artisan craft.",
        subtitle:
          "Soft knits, breathable linens, and handcrafted accents designed for slow days.",
        image:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80&sat=-30",
        caption: "Weekend Lines",
        tags: ["Handmade", "Linen", "Relaxed"],
        ctas: [
          { label: "Shop relaxed", href: "/products?sort=newest", variant: "primary" },
          { label: "All categories", href: "/categories" }
        ]
      }
    ];
  }

  return (
    <div className="mt-8 space-y-12">
      <section>
        <HeroCarousel slides={heroSlides} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Shop by category</h2>
            <p className="text-sm text-slate-500">Jump into curated collections.</p>
          </div>
          <Link href="/categories" className="text-sm text-slate-600 hover:text-black">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories?.length ? (
            categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Category</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{cat.name}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{cat.description || ""}</p>
                <p className="mt-3 text-sm font-medium text-orange-600">
                  {cat._count?.products || 0} products
                </p>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 md:col-span-3">
              No categories yet.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Featured capsules</h2>
            <p className="text-sm text-slate-500">Curated edits inspired by what’s trending in the market.</p>
          </div>
          <Link href="/products" className="text-sm text-slate-600 hover:text-black">
            Explore all
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {heroSlides.slice(0, 3).map((slide) => (
            <div
              key={slide.title}
              className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-sm"
            >
              <div className="relative h-52 overflow-hidden">
                <img src={slide.image} alt={slide.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <span className="absolute left-4 bottom-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[var(--ink)] shadow">
                  {slide.caption}
                </span>
              </div>
              <div className="space-y-2 p-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">{slide.badge}</p>
                <p className="text-lg font-semibold text-[var(--ink)]">{slide.title}</p>
                <p className="text-sm text-[var(--muted)] line-clamp-2">{slide.subtitle}</p>
                <div className="flex gap-2 pt-1">
                  {slide.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full bg-[var(--surface)] px-2 py-1 text-[11px] font-semibold text-[var(--muted)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="latest" className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Latest Products</h2>
            <p className="text-sm text-slate-500">Browse the newest drops with sorting and pagination.</p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            {SORT_OPTIONS.map((option) => {
              const sortParams = new URLSearchParams({ page: "1", limit: String(PAGE_SIZE), sort: option.value });
              return (
                <Link
                  key={option.value}
                  href={`/?${sortParams.toString()}`}
                  className={`rounded-full border px-4 py-2 transition ${
                    sort === option.value
                      ? "border-black bg-black text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-black/60"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, idx) => {
            const nextParams = new URLSearchParams({
              page: String(idx + 1),
              limit: String(PAGE_SIZE),
              sort
            });

            return (
              <Link
                key={idx}
                href={`/?${nextParams.toString()}`}
                className={`rounded-full px-4 py-2 text-sm border transition ${
                  idx + 1 === Number(page)
                    ? "border-black bg-black text-white"
                    : "border-slate-200 bg-white hover:border-black/60"
                }`}
              >
                {idx + 1}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
