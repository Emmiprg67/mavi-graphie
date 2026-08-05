"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { MediaImage } from "@/types/media";

type ImageLightboxProps = {
  images: MediaImage[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function ImageLightbox({
  images,
  activeIndex,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const isOpen = activeIndex !== null;
  const image = activeIndex !== null ? images[activeIndex] : null;
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    document.body.classList.toggle("lightbox-open", isOpen);
    return () => document.body.classList.remove("lightbox-open");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeIndex === null || images.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNavigate((activeIndex + 1) % images.length);
      if (event.key === "ArrowLeft") {
        onNavigate((activeIndex - 1 + images.length) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, images.length, isOpen, onClose, onNavigate]);

  if (!isOpen || activeIndex === null || !image) return null;

  const previousIndex = (activeIndex - 1 + images.length) % images.length;
  const nextIndex = (activeIndex + 1) % images.length;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/86 px-4 py-7 opacity-100 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Bildansicht"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center border border-white/55 bg-black/20 text-2xl leading-none text-white backdrop-blur-sm transition hover:bg-white hover:text-graphite md:right-8 md:top-8"
        onClick={onClose}
        aria-label="Lightbox schließen"
      >
        ×
      </button>

      <button
        type="button"
        className="absolute left-3 top-1/2 z-10 flex h-12 w-10 -translate-y-1/2 items-center justify-center border-y border-r border-white/45 bg-black/20 text-3xl leading-none text-white backdrop-blur-sm transition hover:bg-white hover:text-graphite md:left-8"
        onClick={() => onNavigate(previousIndex)}
        aria-label="Vorheriges Bild"
      >
        ‹
      </button>

      <figure
        className="relative h-full max-h-[86vh] w-full max-w-5xl"
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return;
          const delta = touchStart.current - event.changedTouches[0].clientX;
          if (Math.abs(delta) > 42) onNavigate(delta > 0 ? nextIndex : previousIndex);
          touchStart.current = null;
        }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 768px) 92vw, 960px"
          className="object-contain"
          priority
        />
        <figcaption className="sr-only">{image.alt}</figcaption>
        <p className="absolute inset-x-0 -bottom-10 text-center text-sm font-semibold text-white/85">
          {activeIndex + 1} / {images.length}
        </p>
      </figure>

      <button
        type="button"
        className="absolute right-3 top-1/2 z-10 flex h-12 w-10 -translate-y-1/2 items-center justify-center border-y border-l border-white/45 bg-black/20 text-3xl leading-none text-white backdrop-blur-sm transition hover:bg-white hover:text-graphite md:right-8"
        onClick={() => onNavigate(nextIndex)}
        aria-label="Nächstes Bild"
      >
        ›
      </button>
    </div>
  );
}
