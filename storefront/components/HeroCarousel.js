"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HeroCarousel({ slides = [] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!slides.length) return undefined;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;

  const current = slides[active] || slides[0];

  return (
    <div className="group relative w-full overflow-hidden rounded-[2rem] bg-[#f9f9f9]">
      <div className="relative grid min-h-[600px] grid-cols-1 lg:grid-cols-2">
        {/* Content Side */}
        <div className="flex flex-col justify-center p-12 lg:p-20 xl:p-24 relative z-20">
          <div className="space-y-8 transition-all duration-500 ease-out" key={active}>
            {current.badge && (
              <div className="inline-flex items-center gap-3">
                <span className="h-px w-8 bg-black"></span>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-900">
                  {current.badge}
                </span>
              </div>
            )}

            <div className="space-y-5">
              <h2 className="text-5xl font-bold leading-[1.05] tracking-tight text-black sm:text-6xl xl:text-7xl">
                {current.title}
              </h2>
              {current.subtitle && (
                <p className="max-w-md text-lg text-neutral-600 leading-relaxed font-medium">
                  {current.subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              {current.ctas?.map((cta, idx) => (
                <Link
                  key={idx}
                  href={cta.href}
                  className={`group/btn inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-bold tracking-wide transition-all duration-300 ${
                    cta.variant === "primary"
                      ? "bg-black text-white hover:bg-neutral-800 hover:scale-105 shadow-xl shadow-black/10"
                      : "bg-white text-black border border-neutral-200 hover:border-black hover:bg-neutral-50"
                  }`}
                >
                  {cta.label}
                  <span className="transition-transform group-hover/btn:translate-x-1">→</span>
                </Link>
              ))}
            </div>

            {current.tags && current.tags.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-10 border-t border-neutral-200">
                    {current.tags.map(tag => (
                        <span key={tag} className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest hover:text-black transition-colors cursor-default">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
          </div>
        </div>

        {/* Image Side */}
        <div className="relative h-[400px] lg:h-full w-full overflow-hidden">
            {slides.map((slide, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === active ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="h-full w-full object-cover object-center transition-transform duration-[10s] ease-linear"
                        style={{ transform: idx === active ? 'scale(1.1)' : 'scale(1)' }}
                    />
                    {/* Gradient Overlay for integration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#f9f9f9] via-[#f9f9f9]/20 to-transparent lg:w-1/2 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#f9f9f9] via-transparent to-transparent lg:hidden h-1/2 bottom-0 top-auto pointer-events-none" />

                    {slide.caption && (
                        <div className="absolute bottom-8 right-8 hidden lg:block">
                            <span className="rounded-full bg-white/80 backdrop-blur-md px-4 py-2 text-xs font-bold text-black shadow-sm uppercase tracking-wider">
                                {slide.caption}
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-10 left-12 lg:left-24 z-30 flex gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className={`h-1.5 transition-all duration-500 rounded-full ${
              idx === active ? "w-12 bg-black" : "w-2 bg-neutral-300 hover:bg-neutral-400"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
