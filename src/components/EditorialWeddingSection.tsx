"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useUploadedImages } from "@/hooks/useUploadedImages";
import { AnimatedHeading } from "./AnimatedHeading";

export function EditorialWeddingSection() {
  const { images } = useUploadedImages();

  const featureImages = useMemo(() => {
    const weddingImages = images.filter(
      (image) => !image.isPhotographer && image.category === "Hochzeit",
    );
    return weddingImages.length >= 4 ? weddingImages.slice(1, 5) : images.slice(1, 5);
  }, [images]);

  const [leadImage, sideImage, detailImage, closingImage] = featureImages;

  if (!leadImage || !sideImage || !detailImage) return null;

  return (
    <section className="bg-white py-20 md:py-32" aria-labelledby="editorial-title">
      <div className="section-shell grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div className="max-w-xl">
          <AnimatedHeading
            id="editorial-title"
            eyebrow="Hochzeitsreportagen"
            title="Ein ruhiger Blick fuer grosse Gefuehle."
            className="serif-heading text-[2.35rem] uppercase text-graphite md:text-[3.65rem]"
          />
          <p className="mt-8 text-lg leading-9 text-muted">
            Vom ersten Ankommen bis zu den feinen Details entsteht eine Bildsprache,
            die elegant, nahbar und zeitlos bleibt.
          </p>
          <a
            href="#galerie"
            className="quiet-link mt-9 inline-block text-sm font-bold uppercase tracking-normal text-clay"
          >
            Reportage ansehen
          </a>
        </div>

        <div className="grid min-h-[720px] gap-4 sm:grid-cols-[1.12fr_0.88fr]">
          <div className="relative min-h-[520px] overflow-hidden bg-linen">
            <Image
              src={leadImage.src}
              alt={leadImage.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 52vw, 42vw"
              className="object-cover"
            />
          </div>

          <div className="grid gap-4">
            <div className="relative min-h-[290px] overflow-hidden bg-linen">
              <Image
                src={sideImage.src}
                alt={sideImage.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 28vw"
                className="object-cover"
              />
            </div>

            <div className="relative min-h-[210px] overflow-hidden bg-linen">
              <Image
                src={detailImage.src}
                alt={detailImage.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 28vw"
                className="object-cover"
              />
            </div>

            {closingImage ? (
              <div className="relative min-h-[190px] overflow-hidden bg-linen">
                <Image
                  src={closingImage.src}
                  alt={closingImage.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 28vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
