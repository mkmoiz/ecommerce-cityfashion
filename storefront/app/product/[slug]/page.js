import Link from "next/link";
import { notFound } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { apiGet } from "@/utils/api";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  let product;

  try {
    product = await apiGet(`/store/products/${params.slug}`);
  } catch (err) {
    return notFound();
  }

  const images = product.productImages || [];
  let related = [];

  try {
    const query = new URLSearchParams({ limit: "6", sort: "newest" });
    if (product.category?.slug) {
      query.set("category", product.category.slug);
    }
    const relatedRes = await apiGet(`/store/products?${query.toString()}`);
    related = (relatedRes.products || [])
      .filter((p) => p.slug !== product.slug)
      .slice(0, 4);
  } catch {
    related = [];
  }

  return (
    <div className="space-y-8">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-sm text-[var(--muted)] shadow-sm transition hover:-translate-y-0.5 hover:shadow hover:text-[var(--ink)]"
      >
        <span aria-hidden>←</span> Back to products
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <ImageGallery images={images} title={product.title} />
        </div>

        <div className="space-y-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-6 shadow-sm lg:sticky lg:top-20">
          <ProductInfo product={product} />
        </div>
      </div>

      <CompleteTheLook products={related} />
    </div>
  );
}

function ProductInfo({ product }) {
  const availability =
    product.stock === 0
      ? { label: "Out of stock", tone: "border-red-100 bg-red-50 text-red-700" }
      : product.stock > 0
        ? { label: `${product.stock} in stock`, tone: "border-emerald-100 bg-emerald-50 text-emerald-700" }
        : { label: "In stock", tone: "border-emerald-100 bg-emerald-50 text-emerald-700" };

  const chips = [
    availability,
    { label: "Free shipping over ₹999", tone: "border-[var(--border)] bg-[var(--surface)] text-[var(--ink)]" },
    { label: "15-day returns", tone: "border-amber-100 bg-amber-50 text-amber-800" },
    { label: "Secure checkout", tone: "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]" }
  ];

  const description = product.description || "No description added yet.";

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-[var(--muted)]">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
          {product.category?.name || "Product"}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[var(--ink)] sm:text-4xl">{product.title}</h1>
            <p className="text-[var(--muted)] leading-relaxed">{description}</p>
          </div>
          <div className="min-w-[140px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-3 text-right shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Price</p>
            <p className="text-2xl font-semibold text-[var(--ink)]">₹{product.price}</p>
          </div>
        </div>
        {product.category && (
          <Link
            href={`/categories/${product.category.slug}`}
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
          >
            View more from {product.category.name} ↗
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${chip.tone}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {chip.label}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <AddToCartButton product={product} />
        <Link
          href="/products"
          className="rounded-full border border-[var(--border)] bg-white px-6 py-3 text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
        >
          Continue shopping
        </Link>
      </div>

      <div className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)] sm:grid-cols-3">
        <InfoBlock title="Free shipping" body="On orders over ₹999" />
        <InfoBlock title="Easy returns" body="15-day hassle-free returns" />
        <InfoBlock title="Secure checkout" body="Encrypted payments" />
      </div>
    </div>
  );
}

function InfoBlock({ title, body }) {
  return (
    <div className="space-y-1">
      <p className="font-semibold text-[var(--ink)]">{title}</p>
      <p>{body}</p>
    </div>
  );
}

function CompleteTheLook({ products }) {
  if (!products?.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Complete the look</p>
          <p className="text-lg font-semibold text-[var(--ink)]">Pair it with these picks</p>
        </div>
        <Link href="/products" className="text-sm font-medium text-[var(--ink)] underline-offset-4 hover:underline">
          View all products
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.slug}`}
            className="group overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface)]">
              {item.productImages?.[0]?.url ? (
                <img
                  src={item.productImages[0].url}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted)]">
                  No image
                </div>
              )}
              <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[var(--muted)] shadow-sm">
                ₹{item.price}
              </span>
            </div>
            <div className="p-3 space-y-1">
              <p className="text-sm font-semibold text-[var(--ink)] line-clamp-2 group-hover:underline">
                {item.title}
              </p>
              {item.category?.name && (
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">{item.category.name}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
