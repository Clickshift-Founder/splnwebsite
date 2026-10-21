"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";

export type GalleryPhotoView = { id: number; url: string; width: number | null; height: number | null; caption: string | null; label: string; isSample?: boolean };

/** Masonry grid + full-screen lightbox (keyboard ←/→/Esc, swipe on touch). */
export function GalleryGrid({ photos }: { photos: GalleryPhotoView[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, go]);

  const current = open === null ? null : photos[open];

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
        {photos.map((p, i) => (
          <li key={p.id} className="break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group relative block w-full overflow-hidden rounded-[12px] bg-sand focus-visible:outline-offset-4"
              aria-label={`Open photo: ${p.caption ?? p.label}`}
            >
              <Image
                src={p.url}
                alt={p.caption ?? p.label}
                width={p.width ?? 1600}
                height={p.height ?? 1067}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {p.caption && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/85 to-transparent p-4 pt-10 text-left text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {p.caption}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[70] flex flex-col bg-night/95 backdrop-blur-sm"
          onClick={close}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-white md:px-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold text-white/70">
              {open! + 1} / {photos.length} · {current.label}
            </p>
            <div className="flex gap-1">
              <a href={current.url} target="_blank" rel="noopener noreferrer" className="grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label="Open full size">
                <Download className="size-5" />
              </a>
              <button type="button" onClick={close} className="grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label="Close">
                <X className="size-6" />
              </button>
            </div>
          </div>
          <div className="relative min-h-0 flex-1" onClick={(e) => e.stopPropagation()}>
            <Image key={current.id} src={current.url} alt={current.caption ?? current.label} fill sizes="100vw" className="object-contain" priority />
            {photos.length > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} className="absolute left-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 md:left-6" aria-label="Previous photo">
                  <ChevronLeft className="size-7" />
                </button>
                <button type="button" onClick={() => go(1)} className="absolute right-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-6" aria-label="Next photo">
                  <ChevronRight className="size-7" />
                </button>
              </>
            )}
          </div>
          <p className="min-h-14 px-6 py-4 text-center text-white/85" onClick={(e) => e.stopPropagation()}>
            {current.caption}
          </p>
        </div>
      )}
    </>
  );
}
