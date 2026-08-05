"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { galleryFilters } from "@/data/siteContent";
import { useUploadedImages } from "@/hooks/useUploadedImages";
import { AnimatedHeading } from "./AnimatedHeading";
import { ImageLightbox } from "./ImageLightbox";

export function GallerySection() {
  const [activeFilter, setActiveFilter] = useState("Alle");
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const { images, loading } = useUploadedImages();

  const visibleImages = useMemo(() => {
    const galleryImages = images.filter(
      (image) => !image.isPhotographer && image.category !== "Slider",
    );
    if (activeFilter === "Alle") return galleryImages;
    return galleryImages.filter((image) => image.category === activeFilter);
  }, [activeFilter, images]);

  return (
    <section
      id="galerie"
      className="bg-white py-20 md:py-28"
      aria-labelledby="gallery-title"
    >
      <div className="section-shell">
        <div
          id="reportagen"
          className="mb-10 flex flex-col justify-between gap-8 md:flex-row md:items-end"
        >
          <div className="max-w-2xl">
            <AnimatedHeading
              id="gallery-title"
              eyebrow="Reportagen und Galerie"
              title="Leise Momente, warmes Licht und Bilder mit Gefühl."
              className="serif-heading text-[2.15rem] text-graphite md:text-[3.15rem]"
            />
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Galerie filtern">
            {galleryFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`min-h-11 border px-4 text-sm font-semibold transition ${
                  activeFilter === filter
                    ? "border-clay bg-clay text-white"
                    : "border-line bg-white text-graphite hover:border-clay hover:bg-mist"
                }`}
                onClick={() => {
                  setActiveFilter(filter);
                  setActiveImage(null);
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-muted">Galeriebilder werden geladen.</p>
        ) : visibleImages.length === 0 ? (
          <p className="border-y border-line py-12 text-center text-muted">
            Noch keine Galeriebilder vorhanden. Lade im Adminbereich echte Fotos
            hoch und wähle passende Kategorien.
          </p>
        ) : (
          <div className="grid auto-rows-[8px] grid-cols-1 gap-4 transition sm:grid-cols-2 lg:grid-cols-4">
            {visibleImages.map((image, index) => (
              <div
                key={`${activeFilter}-${image.id}`}
                className="gallery-tile"
                style={
                  {
                    "--tile-span": 34 + ((index % 4) * 4),
                  } as React.CSSProperties
                }
              >
                <button
                  type="button"
                  className="group relative h-full min-h-72 w-full overflow-hidden bg-linen transition duration-300"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Galeriebild öffnen: ${image.alt}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.035]"
                    loading={index < 4 ? "eager" : "lazy"}
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-graphite/35 to-transparent p-4 text-left text-xs font-bold uppercase tracking-normal text-white opacity-0 transition group-hover:opacity-100">
                    {image.category}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ImageLightbox
        images={visibleImages}
        activeIndex={activeImage}
        onClose={() => setActiveImage(null)}
        onNavigate={setActiveImage}
      />
    </section>
  );
}
