'use client';

import { useMemo, useState } from "react";

export default function ImageGallery({ images = [], title = "" }) {
  const safeImages = images || [];
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = useMemo(() => {
    if (!safeImages.length) return null;
    const index = Math.min(activeIndex, safeImages.length - 1);
    return safeImages[index];
  }, [activeIndex, safeImages]);

  return (
    <div className="grid gap-3 lg:grid-cols-[96px_1fr] lg:items-start">
      {safeImages.length > 1 && (
        <div className="hidden flex-col gap-2 lg:flex">
          {safeImages.map((img, idx) => (
            <button
              key={img.id || img.url || idx}
              type="button"
              className={`overflow-hidden rounded-[var(--radius-sm)] border bg-white ${
                idx === activeIndex
                  ? "border-[var(--ink)] shadow"
                  : "border-[var(--border)] hover:border-[var(--ink)]/40"
              }`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1}`}
            >
              <img
                src={img.url}
                alt={`${title} thumbnail ${idx + 1}`}
                className="h-20 w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-inner sm:aspect-[5/6]">
          {activeImage ? (
            <img
              src={activeImage.url}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
              No images yet
            </div>
          )}
          {safeImages.length > 0 && (
            <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink)] backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
              {activeIndex + 1} / {safeImages.length}
            </div>
          )}
        </div>

        {safeImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2 lg:hidden">
            {safeImages.map((img, idx) => (
              <button
                key={img.id || img.url || idx}
                type="button"
                className={`overflow-hidden rounded-[var(--radius-sm)] border bg-white ${
                  idx === activeIndex
                    ? "border-[var(--ink)] shadow"
                    : "border-[var(--border)]"
                }`}
                onClick={() => setActiveIndex(idx)}
              >
                <img
                  src={img.url}
                  alt={`${title} thumbnail ${idx + 1}`}
                  className="h-20 w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
