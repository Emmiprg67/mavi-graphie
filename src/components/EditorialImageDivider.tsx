"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useUploadedImages } from "@/hooks/useUploadedImages";

export function EditorialImageDivider() {
  const { images } = useUploadedImages();

  const dividerImage = useMemo(() => {
    const details = images.filter(
      (image) =>
        image.category === "Hochzeit" &&
        !image.useOnHome &&
        !image.isPhotographer,
    );
    return details[2] ?? details[0] ?? images[5];
  }, [images]);

  if (!dividerImage) return null;

  return (
    <section
      className="relative min-h-[68vh] overflow-hidden bg-graphite text-white"
      aria-label="Hochzeitsdetail"
    >
      <Image
        src={dividerImage.src}
        alt={dividerImage.alt}
        fill
        sizes="100vw"
        className="object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/28" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,.08)_55%,rgba(0,0,0,.35))]" />

      <div className="section-shell relative z-10 flex min-h-[68vh] items-end pb-14 pt-24 md:pb-20">
        <div className="max-w-xl">
          <p className="eyebrow mb-5 text-mist">Details</p>
          <h2 className="serif-heading text-[2.4rem] uppercase md:text-[4rem]">
            Zwischen den grossen Momenten liegt die Erinnerung.
          </h2>
        </div>
      </div>
    </section>
  );
}
