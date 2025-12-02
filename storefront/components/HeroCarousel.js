"use client";

import { useEffect, useState } from "react";

export default function HeroCarousel({ slides = [] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!slides.length) return undefined;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const current = slides[active] || slides[0];

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-xl">
      <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative space-y-6 p-8 md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
            {current.badge}
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-display font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              {current.title}
            </h1>
            <p className="text-base text-[var(--muted)] md:text-lg">{current.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {current.ctas?.map((cta) => (
              <a
                key={cta.href + cta.label}
                href={cta.href}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                  cta.variant === "primary"
                    ? "bg-[var(--ink)] text-white shadow hover:-translate-y-0.5 hover:shadow-lg"
                    : "border border-[var(--border)] bg-white text-[var(--ink)] shadow-sm hover:-translate-y-0.5 hover:shadow"
                }`}
              >
                {cta.label}
                <span aria-hidden>↗</span>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
            {current.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActive(idx)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  idx === active ? "bg-[var(--ink)]" : "bg-[var(--border)]"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="relative h-full min-h-[320px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/40" />
          <img
            src={current.image}
            alt={current.title}
            className="h-full w-full object-cover transition duration-700"
          />
          <div className="absolute bottom-4 right-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink)] shadow">
            {current.caption}
          </div>
        </div>
      </div>
    </div>
  );
}
